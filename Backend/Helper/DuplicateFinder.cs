using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Models;

namespace BackendFramework.Helper
{
    public class DuplicateFinder
    {
        private readonly LevenshteinDistance _editDist;
        private readonly int _maxInList;
        private readonly int _maxLists;
        private readonly int _maxScore;

        public DuplicateFinder(int maxInList, int maxLists, int maxScore)
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

        /// <summary> Get from specified List several sub-Lists, each a set of similar <see cref="Word"/>s. </summary>
        /// <returns>
        /// A List of Lists: each inner list is ordered by similarity to the first entry in the List;
        /// the outer list is ordered by similarity of the first two items in each inner List.
        /// </returns>
        public async Task<List<List<Word>>> GetSimilarWords(
            List<Word> collection, Func<List<string>, Task<bool>> isUnavailableSet)
        {
            double currentMax = _maxScore;
            var wordLists = new List<Tuple<double, List<Word>>> { Capacity = _maxLists + 1 };
            while (collection.Count > 0 && (wordLists.Count < _maxLists || currentMax > 0))
            {
                var word = collection.First();
                collection.RemoveAt(0);
                var similarWords = GetSimilarToWord(word, collection);
                if (similarWords.Count == 0)
                {
                    continue;
                }
                var score = similarWords.First().Item1;
                if (score > currentMax || (wordLists.Count >= _maxLists && Math.Abs(score - currentMax) < 0.001))
                {
                    continue;
                }

                // Check if set is in blacklist or graylist.
                var ids = new List<string> { word.Id };
                ids.AddRange(similarWords.Select(w => w.Item2.Id));
                if (await isUnavailableSet(ids))
                {
                    continue;
                }

                // Remove similar words from collection.
                var idsToRemove = similarWords.Select(w => w.Item2.Id);
                collection.RemoveAll(w => idsToRemove.Contains(w.Id));

                // Add similar words to list with main word.
                var newWordList = Tuple.Create(score, new List<Word> { word });
                newWordList.Item2.AddRange(similarWords.Select(w => w.Item2));

                // Insert at correct place in list.
                var i = wordLists.FindIndex(pair => score <= pair.Item1);
                if (i == -1)
                {
                    wordLists.Add(newWordList);
                }
                else
                {
                    wordLists.Insert(i, newWordList);
                }

                // If list is now too long, boot the last one, recycling its similar words.
                if (wordLists.Count == _maxLists + 1)
                {
                    var toRecycle = wordLists.Last().Item2;
                    toRecycle.RemoveAt(0);
                    foreach (var simWord in toRecycle)
                    {
                        collection.Add(simWord);
                    }
                    wordLists.RemoveAt(_maxLists);
                    currentMax = wordLists.Last().Item1;
                }
            }
            return wordLists.Select(list => list.Item2).ToList();
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

        /// <summary> Get from specified List a sublist of elements similar to specified <see cref="Word"/>. </summary>
        /// <returns> List of similar <see cref="Word"/>s, ordered by similarity with most similar first. </returns>
        private List<Tuple<double, Word>> GetSimilarToWord(Word word, List<Word> collection)
        {
            // If the number of similar words exceeds the max allowable (i.e., .Count = _maxInList),
            // then the currentMaxScore will be decreased.
            var similarWords = new List<Tuple<double, Word>> { Capacity = _maxInList };
            double currentMaxScore = _maxScore;

            foreach (var other in collection)
            {
                // Add the word if the score is low enough.
                var score = GetWordScore(word, other);
                if (score > currentMaxScore || (similarWords.Count >= _maxInList - 1 && score >= currentMaxScore))
                {
                    continue;
                }

                // Insert at correct place in List.
                var i = similarWords.FindIndex(pair => score <= pair.Item1);
                var newWord = Tuple.Create(score, other.Clone());
                if (i == -1)
                {
                    similarWords.Add(newWord);
                }
                else
                {
                    similarWords.Insert(i, newWord);
                }

                // Check if list is now 1 too large.
                if (similarWords.Count == _maxInList)
                {
                    similarWords.RemoveAt(_maxInList - 1);
                    currentMaxScore = similarWords.Last().Item1;
                }

                // If we've maxed out with identical words, stop.
                if (similarWords.Count == _maxInList - 1 && similarWords.Last().Item1 == 0)
                {
                    break;
                }
            }
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
