using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;

namespace BackendFramework.Services
{
    /// <summary> More complex functions and application logic for <see cref="Word"/>s </summary>
    public class MergeService : IMergeService
    {
        private readonly IMergeBlacklistRepository _mergeBlacklistRepo;
        private readonly IWordRepository _wordRepo;

        public MergeService(IMergeBlacklistRepository mergeBlacklistRepo, IWordRepository wordRepo)
        {
            _mergeBlacklistRepo = mergeBlacklistRepo;
            _wordRepo = wordRepo;
        }

        /// <summary> Prepares a merge parent to be added to the database. </summary>
        /// <returns> Word to add. </returns>
        private async Task<Word> MergePrepParent(string projectId, MergeWords mergeWords)
        {
            var parent = mergeWords.Parent.Clone();
            parent.ProjectId = projectId;
            parent.History = new List<string>();

            // Add child to history.
            foreach (var childSource in mergeWords.Children)
            {
                parent.History.Add(childSource.SrcWordId);
                if (childSource.GetAudio)
                {
                    var child = await _wordRepo.GetWord(projectId, childSource.SrcWordId);
                    if (child is null)
                    {
                        throw new KeyNotFoundException($"Unable to locate word: ${childSource.SrcWordId}");
                    }
                    parent.Audio.AddRange(child.Audio);
                }
            }

            // Remove duplicates.
            parent.Audio = parent.Audio.Distinct().ToList();
            parent.History = parent.History.Distinct().ToList();

            // Clear fields to be automatically regenerated.
            parent.Id = "";
            parent.Modified = "";

            return parent;
        }

        /// <summary> Deletes all the merge children from the frontier. </summary>
        /// <returns> Number of words deleted. </returns>
        private async Task<long> MergeDeleteChildren(string projectId, MergeWords mergeWords)
        {
            var childIds = mergeWords.Children.Select(c => c.SrcWordId).ToList();
            return await _wordRepo.DeleteFrontier(projectId, childIds);
        }

        /// <summary>
        /// Given a list of MergeWords, preps the words to be added, removes the children
        /// from the frontier, and adds the new words to the database.
        /// </summary>
        /// <returns> List of new words added. </returns>
        public async Task<List<Word>> Merge(string projectId, List<MergeWords> mergeWordsList)
        {
            var newWords = new List<Word>();
            await Task.WhenAll(mergeWordsList.Select(m => MergePrepParent(projectId, m)
                                             .ContinueWith(task => newWords.Add(task.Result))));
            await Task.WhenAll(mergeWordsList.Select(m => MergeDeleteChildren(projectId, m)));
            return await _wordRepo.Create(newWords);
        }

        /// <summary> Adds a List of wordIds to MergeBlacklist of specified <see cref="Project"/>. </summary>
        /// <exception cref="InvalidBlacklistEntryError"> Throws when wordIds has count less than 2. </exception>
        /// <returns> The <see cref="MergeBlacklistEntry"/> created. </returns>
        public async Task<MergeBlacklistEntry> AddToMergeBlacklist(
            string projectId, string userId, List<string> wordIds)
        {
            if (wordIds.Count < 2)
            {
                throw new InvalidBlacklistEntryError("Cannot blacklist a list of fewer than 2 wordIds.");
            }
            // When we switch from individual to common blacklist, the userId argument here should be removed.
            var blacklist = await _mergeBlacklistRepo.GetAll(projectId, userId);
            foreach (var entry in blacklist)
            {
                if (entry.WordIds.All(wordIds.Contains))
                {
                    await _mergeBlacklistRepo.Delete(projectId, entry.Id);
                }
            }
            var newEntry = new MergeBlacklistEntry { ProjectId = projectId, UserId = userId, WordIds = wordIds };
            return await _mergeBlacklistRepo.Create(newEntry);
        }

        /// <summary> Check if List of wordIds is in MergeBlacklist for specified <see cref="Project"/>. </summary>
        /// <exception cref="InvalidBlacklistEntryError"> Throws when wordIds has count less than 2. </exception>
        /// <returns> A bool, true if in the blacklist. </returns>
        public async Task<bool> IsInMergeBlacklist(string projectId, List<string> wordIds, string? userId = null)
        {
            if (wordIds.Count < 2)
            {
                throw new InvalidBlacklistEntryError("Cannot blacklist a list of fewer than 2 wordIds.");
            }
            var blacklist = await _mergeBlacklistRepo.GetAll(projectId, userId);
            foreach (var entry in blacklist)
            {
                if (wordIds.All(entry.WordIds.Contains))
                {
                    return true;
                }
            }
            return false;
        }

        /// <summary>
        /// Update merge blacklist for specified <see cref="Project"/> to current frontier.
        /// Remove from all blacklist entries any ids for words no longer in the frontier
        /// and delete entries that no longer have at least two wordIds.
        /// </summary>
        /// <returns> Updated List of <see cref="MergeBlacklistEntry"/>s, or null if nothing to update. </returns>
        public async Task<int> UpdateMergeBlacklist(string projectId)
        {
            var oldBlacklist = await _mergeBlacklistRepo.GetAll(projectId);
            if (oldBlacklist.Count == 0)
            {
                return 0;
            }
            var frontierWordIds = (await _wordRepo.GetFrontier(projectId)).Select(word => word.Id);
            var updateCount = 0;
            foreach (var entry in oldBlacklist)
            {
                var newIds = new List<string>(entry.WordIds.Where(id => frontierWordIds.Contains(id)));
                if (newIds.Count >= entry.WordIds.Count)
                {
                    continue;
                }

                updateCount++;
                if (newIds.Count > 1)
                {
                    entry.WordIds = newIds;
                    await _mergeBlacklistRepo.Update(entry);
                }
                else
                {
                    await _mergeBlacklistRepo.Delete(projectId, entry.Id);
                }
            }
            return updateCount;
        }

        public async Task<List<List<Word>>> GetPotentialDuplicates(string projectId, string? userId = null)
        {
            var collection = await _wordRepo.GetFrontier(projectId);
            var dupFinder = new DuplicateFinder(5, 10, 3);
            return await dupFinder.GetSimilarWords(collection, wordIds => IsInMergeBlacklist(projectId, wordIds, userId));
        }

        private class DuplicateFinder
        {
            private readonly IEditDistance _editDist;
            private readonly int _maxInList;
            private readonly int _maxLists;
            private readonly int _maxScore;
            //private const int _RefWordLength = 5;

            public DuplicateFinder(int maxInList, int maxLists, int maxScore)
            {
                _editDist = new LevenshteinDistance();
                _maxInList = maxInList;
                _maxLists = maxLists;
                _maxScore = maxScore;
            }

            async public Task<List<List<Word>>> GetSimilarWords(List<Word> collection, Func<List<string>, Task<bool>> isInBlacklist)
            {
                var currentMax = _maxScore;
                var wordLists = new List<List<Word>>() { Capacity = _maxLists + 1 };
                while (collection.Count > 0 && (wordLists.Count < _maxLists || currentMax > 0))
                {
                    var word = collection.First();
                    collection.RemoveAt(0);
                    var similarWords = GetSimilarToWord(word, collection);
                    if (similarWords.Count == 0)
                    {
                        continue;
                    }
                    var score = GetWordDistance(word, similarWords.First());
                    if (score > currentMax || (wordLists.Count >= _maxLists && score == currentMax))
                    {
                        continue;
                    }
                    var ids = new List<string> { word.Id };
                    ids.AddRange(similarWords.Select(w => w.Id));
                    if (await isInBlacklist(ids))
                    {
                        continue;
                    };
                    similarWords.ForEach(w => collection.Remove(w));
                    similarWords.Insert(0, word);
                    currentMax = AddListToLists(collection, similarWords, wordLists, score);
                }
                return wordLists;
            }

            private int AddListToLists(
                List<Word> collection, List<Word> newWordList, List<List<Word>> wordLists, int score)
            {
                for (int i = 0; i < wordLists.Count; i++)
                {
                    var oldList = wordLists.ElementAt(i);
                    var oldScore = GetWordDistance(oldList.First(), oldList.ElementAt(1));
                    if (score <= oldScore)
                    {
                        wordLists.Insert(i, newWordList);
                        break;
                    }
                }
                if (wordLists.Count == _maxLists + 1)
                {
                    var toRecycle = wordLists.Last();
                    toRecycle.RemoveAt(0);
                    foreach (var simWord in toRecycle)
                    {
                        collection.Add(simWord);
                    }
                    wordLists.RemoveAt(_maxLists);
                }
                var newLast = wordLists.Last();
                return GetWordDistance(newLast.First(), newLast.ElementAt(1));
            }

            List<Word> GetSimilarToWord(Word word, List<Word> collection)
            {
                // Similar words will be added at index equal to its distance from the specified word.
                var similarWords = new List<List<Word>>() { Capacity = _maxScore + 1 };
                int currentMaxScore = _maxScore;

                // We will collect fewer than _maxInList similar words to go with the specified word.
                int count = 0;
                int maxCount = _maxInList - 1;

                foreach (var other in collection)
                {
                    // Add the word if the score is low enough.
                    int score = GetWordDistance(word, other);
                    if (score > currentMaxScore || (count >= maxCount && score >= currentMaxScore))
                    {
                        continue;
                    }
                    while (score >= similarWords.Count)
                    {
                        similarWords.Add(new List<Word>());
                    }
                    similarWords.ElementAt(score).Add(other.Clone());
                    count++;

                    // If adding the word resulted in more than allowed, decrement currentMaxScore.
                    if (count > maxCount)
                    {
                        currentMaxScore = similarWords.Count - 1;
                        while (count > maxCount)
                        {
                            count -= similarWords.ElementAt(currentMaxScore).Count;
                            similarWords.RemoveAt(currentMaxScore);
                            currentMaxScore--;
                        }
                    }

                    // If we've maxed out with identical words, stop.
                    if (count == _maxInList && currentMaxScore == 0)
                    {
                        break;
                    }
                }
                return similarWords.SelectMany(i => i).ToList();
            }

            private int GetWordDistance(Word wordA, Word wordB)
            {
                // Just compare vernaculars for the moment.
                var vernDist = GetVernacularDistance(wordA, wordB);
                return vernDist;

                /* // Algorithm from the frontend doesn't give int scores:
                 * var vernScore = vernDist * 5.0 / wordA.Vernacular.Length;
                 * if (vernScore <= 1) { return vernScore; }
                 * glossDist = GetGlossDistance(wordA, wordB);
                 * if (glossDist == 0) { return 1; }
                 * return vernScore + 3 * glossDist; */
            }

            private int GetVernacularDistance(Word wordA, Word wordB)
            {
                return _editDist.GetDistance(wordA.Vernacular, wordB.Vernacular);
            }

            private int GetGlossDistance(Word wordA, Word wordB)
            {
                int minDist = _maxScore + 1;

                // Flatten all sense glosses.
                var glossesA = wordA.Senses.SelectMany(s => s.Glosses).ToList();
                if (glossesA.Count == 0)
                {
                    return minDist;
                }
                var glossesB = wordB.Senses.SelectMany(s => s.Glosses).ToList();
                if (glossesB.Count == 0)
                {
                    return minDist;
                }

                // Find most similar non-empty glosses of the same langauge.
                foreach (var gA in glossesA)
                {
                    if (gA.Def.Length == 0)
                    {
                        continue;
                    }
                    foreach (var gB in glossesB)
                    {
                        if (gB.Def.Length == 0 || gA.Language != gB.Language)
                        {
                            continue;
                        }
                        var glossDist = _editDist.GetDistance(gA.Def, gB.Def);
                        if (glossDist == 0)
                        {
                            return 0;
                        }
                        minDist = Math.Min(minDist, glossDist);
                    }
                }
                return minDist;
            }
        }

        [Serializable]
        public class InvalidBlacklistEntryError : Exception
        {
            public InvalidBlacklistEntryError() { }

            public InvalidBlacklistEntryError(string message) : base(message) { }

            public InvalidBlacklistEntryError(string message, Exception innerException) : base(message, innerException)
            { }
        }
    }
}
