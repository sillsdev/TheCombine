using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Models;
using SIL.Extensions;

namespace BackendFramework.Helper
{
    public class DuplicateFinder
    {
        private readonly LevenshteinDistance _editDist;
        private readonly int _maxInList;
        private readonly int _maxLists;
        private readonly double _maxScore;

        public DuplicateFinder(int maxInList, int maxLists, double maxScore)
        {
            _editDist = new LevenshteinDistance();
            _maxInList = maxInList;
            _maxLists = maxLists;
            _maxScore = maxScore;
        }

        /// <summary>
        /// Get from specified List several sub-Lists,
        /// each with multiple <see cref="Word"/>s having a common Vernacular.
        /// </summary>
        public async Task<List<List<Word>>> GetIdenticalVernWords(
            List<Word> collection, Func<List<string>, Task<bool>> isUnavailableSet)
        {
            var wordLists = new List<List<Word>> { Capacity = _maxLists };
            while (collection.Count > 0 && wordLists.Count < _maxLists)
            {
                var word = collection.First();
                collection.RemoveAt(0);
                var similarWords = GetIdenticalVernToWord(word, collection);
                if (similarWords.Count == 0)
                {
                    continue;
                }

                // Check if set is in blacklist or graylist.
                var ids = new List<string> { word.Id };
                ids.AddRange(similarWords.Select(w => w.Id));
                if (await isUnavailableSet(ids))
                {
                    continue;
                }

                // Remove from collection and add to main list.
                var idsToRemove = similarWords.Select(w => w.Id);
                collection.RemoveAll(w => idsToRemove.Contains(w.Id));
                similarWords.Insert(0, word);
                wordLists.Add(similarWords);
            }
            return wordLists;
        }

        /// <summary> Get the earliest available sublist of the given word-list and its similarity score. </summary>
        private async Task<Tuple<double, List<Word>>> ModifiedScore(double scoreToBeat, List<Tuple<double, Word>> similarWords,
            List<string> unavailableIds, Func<List<string>, Task<bool>> isUnavailableSet)
        {
            var trimmed = similarWords.Where(tuple => !unavailableIds.Contains(tuple.Item2.Id)).ToList();
            var ids = trimmed.Select(tuple => tuple.Item2.Id).ToList();
            while (ids.Count > 1 && trimmed.ElementAt(1).Item1 < scoreToBeat &&
                await isUnavailableSet(ids[..Math.Min(ids.Count, _maxInList)]))
            {
                // If the initial sublist is unavailable, remove the second element and try again.
                // (The first element is the one against which all the similarity scores were computed.)
                trimmed.RemoveAt(1);
                ids.RemoveAt(1);
            }
            var words = trimmed[..Math.Min(trimmed.Count, _maxInList)].Select(tuple => tuple.Item2).ToList();
            return Tuple.Create(words.Count < 2 ? _maxScore + 1.0 : trimmed.ElementAt(1).Item1, words);
        }

        /// <summary> Get from specified List several sub-Lists, each a set of similar <see cref="Word"/>s. </summary>
        /// <returns>
        /// A List of Lists: each inner list is ordered by similarity to the first entry in the List;
        /// the outer list is ordered by similarity of the first two items in each inner List.
        /// </returns>
        public async Task<List<List<Word>>> GetSimilarWords(
            List<Word> collection, Func<List<string>, Task<bool>> isUnavailableSet)
        {
            var similarWordsLists = collection.AsParallel()
                .Select(w => GetSimilarToWord(w, collection))
                .Where(wl => wl.Count > 1).ToList();

            var best = new List<List<Word>>();
            var bestIds = new List<string>();

            while (best.Count < similarWordsLists.Count && best.Count < _maxLists)
            {
                var candidate = Tuple.Create(_maxScore + double.Epsilon, new List<Word>());
                for (var i = 0; i < similarWordsLists.Count; i++)
                {
                    var temp = await ModifiedScore(candidate.Item1, similarWordsLists[i], bestIds, isUnavailableSet);
                    if (temp.Item1 < candidate.Item1)
                    {
                        candidate = temp;
                    }
                }
                if (candidate.Item2.Count == 0)
                {
                    break;
                }
                best.Add(candidate.Item2);
                bestIds.AddRange(candidate.Item2.Select(w => w.Id));
            }
            return best;
        }

        /// <summary> Get from specified List a sub-List with same vern as specified <see cref="Word"/>. </summary>
        private List<Word> GetIdenticalVernToWord(Word word, List<Word> collection)
        {
            var identicalWords = new List<Word> { Capacity = _maxInList - 1 };
            foreach (var other in collection)
            {
                if (word.Vernacular == other.Vernacular && HaveCommonGramCatGroup(word, other))
                {
                    identicalWords.Add(other);
                    if (identicalWords.Count == _maxInList - 1)
                    {
                        break;
                    }
                }
            }
            return identicalWords;
        }

        /// <summary> Get all elements in specified List that are similar to specified <see cref="Word"/>. </summary>
        /// <returns> List of similar <see cref="Word"/>s, ordered by similarity with most similar first. </returns>
        private List<Tuple<double, Word>> GetSimilarToWord(Word word, List<Word> collection)
        {
            var similarWords = new List<Tuple<double, Word>>();
            foreach (var other in collection)
            {
                // Add the word if the score is low enough.
                var score = GetWordScore(word, other);
                if (score <= _maxScore)
                {
                    similarWords.Add(Tuple.Create(score, other));
                }
            }
            similarWords.Sort((x, y) => x.Item1.CompareTo(y.Item1));
            return similarWords;
        }

        /// <summary>
        /// Computes an edit-distance based score indicating similarity of specified <see cref="Word"/>s.
        /// </summary>
        /// <param name="wordA"> The first of two Words to compare. </param>
        /// <param name="wordB"> The second of two Words to compare. </param>
        /// <param name="checkGlossThreshold">
        /// A double (default 1.0): If the Words' vernaculars have a score between this threshold and the _maxScore,
        /// and if the Words share a common definition/gloss, then we override the score with this threshold.
        /// </param>
        /// <param name="gramCatPenalty">
        /// A double (default 1.5): A penalty added to the score if the words have different GramCatGroups.
        /// </param>
        /// <returns> A double: the adjusted distance between the words. </returns>
        public double GetWordScore(
            Word wordA, Word wordB, double checkGlossThreshold = 1.0, double gramCatPenalty = 1.5)
        {
            var vernScore = GetScaledDistance(wordA.Vernacular, wordB.Vernacular);

            if (!HaveCommonGramCatGroup(wordA, wordB))
            {
                checkGlossThreshold += gramCatPenalty;
                vernScore += gramCatPenalty;
            }

            if (vernScore <= checkGlossThreshold || vernScore > _maxScore)
            {
                return vernScore;
            }

            if (HaveSameDefinitionOrGloss(wordA, wordB))
            {
                return (double)checkGlossThreshold;
            }

            return vernScore;
        }

        /// <summary>
        /// Check if two <see cref="Word"/>s have
        /// <see cref="Definition"/>s and/or <see cref="Gloss"/>es with the same nonempty Text/Def.
        /// </summary>
        public static bool HaveSameDefinitionOrGloss(Word wordA, Word wordB)
        {
            var textsA = GetAllDefinitionAndGlossText(wordA);
            if (textsA.Count == 0)
            {
                return false;
            }
            var textsB = GetAllDefinitionAndGlossText(wordB);
            return textsB.Any(tB => textsA.Any(tA => tA.Equals(tB, StringComparison.Ordinal)));
        }

        /// <summary> Get a List of all nonempty Definition Texts and Gloss Defs. </summary>
        private static List<string> GetAllDefinitionAndGlossText(Word wordA)
        {
            var texts = wordA.Senses.SelectMany(s => s.Definitions.Select(d => d.Text.Trim().ToLowerInvariant()))
                .ToList();
            texts.AddRange(wordA.Senses.SelectMany(s => s.Glosses.Select(g => g.Def.Trim().ToLowerInvariant())));
            return texts.Where(t => !string.IsNullOrEmpty(t)).ToList();
        }

        /// <summary>
        /// Check if two <see cref="Word"/>s have a common grammatical category group,
        /// or if the grammatical category group is unspecified in every sense of one of the words.
        /// </summary>
        public static bool HaveCommonGramCatGroup(Word wordA, Word wordB)
        {
            var catGroupsA = wordA.Senses.Select(s => s.GrammaticalInfo.CatGroup).Distinct().ToList();
            if (catGroupsA.Count == 1 && catGroupsA.Contains(GramCatGroup.Unspecified))
            {
                return true;
            }

            var catGroupsB = wordB.Senses.Select(s => s.GrammaticalInfo.CatGroup).Distinct().ToList();
            if (catGroupsB.Count == 1 && catGroupsB.Contains(GramCatGroup.Unspecified))
            {
                return true;
            }

            return catGroupsA.Any(cg => cg != GramCatGroup.Unspecified && catGroupsB.Contains(cg));
        }

        /// <summary>
        /// Get the edit distance between two strings; adjust the result depending on length of the first.
        /// Weights in the function are heuristically adjusted to improve duplicate finding.
        /// </summary>
        private double GetScaledDistance(string stringA, string stringB)
        {
            return _editDist.GetDistance(stringA, stringB) * 7.0 / (stringA.Length + 1.0);
        }
    }
}
