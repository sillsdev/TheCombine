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
        private readonly IMergeGraylistRepository _mergeGraylistRepo;
        private readonly IWordRepository _wordRepo;
        private readonly IWordService _wordService;

        public MergeService(IMergeBlacklistRepository mergeBlacklistRepo, IMergeGraylistRepository mergeGraylistRepo,
            IWordRepository wordRepo, IWordService wordService)
        {
            _mergeBlacklistRepo = mergeBlacklistRepo;
            _mergeGraylistRepo = mergeGraylistRepo;
            _wordRepo = wordRepo;
            _wordService = wordService;
        }

        /// <summary> Prepares a merge parent to be added to the database. </summary>
        /// <returns> Word to add. </returns>
        private async Task<Word> MergePrepParent(string projectId, MergeWords mergeWords)
        {
            var parent = mergeWords.Parent.Clone();
            parent.ProjectId = projectId;
            parent.History = new List<string>();

            foreach (var childSource in mergeWords.Children)
            {
                // Add child to history.
                parent.History.Add(childSource.SrcWordId);

                if (childSource.GetAudio)
                {
                    // Add child's audio.
                    var child = await _wordRepo.GetWord(projectId, childSource.SrcWordId)
                        ?? throw new KeyNotFoundException($"Unable to locate word: ${childSource.SrcWordId}");
                    child.Audio.ForEach(pro =>
                    {
                        if (parent.Audio.All(p => p.FileName != pro.FileName))
                        {
                            parent.Audio.Add(pro);
                        }
                    });
                }
            }

            // Remove history duplicates.
            parent.History = parent.History.Distinct().ToList();
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
        public async Task<List<Word>> Merge(string projectId, string userId, List<MergeWords> mergeWordsList)
        {
            var keptWords = mergeWordsList.Where(m => !m.DeleteOnly);
            var newWords = keptWords.Select(m => MergePrepParent(projectId, m).Result).ToList();
            await Task.WhenAll(mergeWordsList.Select(m => MergeDeleteChildren(projectId, m)));
            return await _wordService.Create(userId, newWords);
        }

        /// <summary> Undo merge </summary>
        /// <returns> True if merge was successfully undone </returns>
        public async Task<bool> UndoMerge(string projectId, string userId, MergeUndoIds ids)
        {
            foreach (var parentId in ids.ParentIds)
            {
                var parentWord = (await _wordRepo.GetWord(projectId, parentId))?.Clone();
                if (parentWord is null)
                {
                    return false;
                }
            }

            // If children are not restorable, return without any undo.
            if (!await _wordService.RestoreFrontierWords(projectId, ids.ChildIds))
            {
                return false;
            }
            foreach (var parentId in ids.ParentIds)
            {
                await _wordService.DeleteFrontierWord(projectId, userId, parentId);
            }
            return true;
        }

        /// <summary> Adds a List of wordIds to MergeBlacklist of specified <see cref="Project"/>. </summary>
        /// <exception cref="InvalidMergeWordSetException"> Throws when wordIds has count less than 2. </exception>
        /// <returns> The <see cref="MergeWordSet"/> created. </returns>
        public async Task<MergeWordSet> AddToMergeBlacklist(
            string projectId, string userId, List<string> wordIds)
        {
            if (wordIds.Count < 2)
            {
                throw new InvalidMergeWordSetException("Cannot blacklist a list of fewer than 2 wordIds.");
            }

            // It's possible to add a superset of an existing blacklist entry,
            // so we cleanup by removing all entries fully contained in the new entry.
            var blacklist = await _mergeBlacklistRepo.GetAllSets(projectId, userId);
            foreach (var entry in blacklist)
            {
                if (entry.WordIds.All(wordIds.Contains))
                {
                    await _mergeBlacklistRepo.Delete(projectId, entry.Id);
                }
            }
            await RemoveFromMergeGraylist(projectId, userId, wordIds);
            var newEntry = new MergeWordSet { ProjectId = projectId, UserId = userId, WordIds = wordIds };
            return await _mergeBlacklistRepo.Create(newEntry);
        }

        /// <summary> Adds a List of wordIds to MergeGraylist of specified <see cref="Project"/>. </summary>
        /// <exception cref="InvalidMergeWordSetException"> Throws when wordIds has count less than 2. </exception>
        /// <returns> The <see cref="MergeWordSet"/> created. </returns>
        public async Task<MergeWordSet> AddToMergeGraylist(
            string projectId, string userId, List<string> wordIds)
        {
            wordIds = wordIds.Distinct().ToList();
            if (wordIds.Count < 2)
            {
                throw new InvalidMergeWordSetException("Cannot graylist a list of fewer than 2 wordIds.");
            }

            // It's possible to add a superset of an existing graylist entry,
            // so we cleanup by removing all entries fully contained in the new entry.
            var graylist = await _mergeGraylistRepo.GetAllSets(projectId, userId);
            foreach (var entry in graylist)
            {
                if (entry.WordIds.All(wordIds.Contains))
                {
                    await _mergeGraylistRepo.Delete(projectId, entry.Id);
                }
            }
            var newEntry = new MergeWordSet { ProjectId = projectId, UserId = userId, WordIds = wordIds };
            return await _mergeGraylistRepo.Create(newEntry);
        }

        /// <summary> Remove a List of wordIds from MergeGraylist of specified <see cref="Project"/>. </summary>
        /// <exception cref="InvalidMergeWordSetException"> Throws when wordIds has count less than 2. </exception>
        /// <returns> Boolean indicating whether anything was removed. </returns>
        public async Task<bool> RemoveFromMergeGraylist(
            string projectId, string userId, List<string> wordIds)
        {
            wordIds = wordIds.Distinct().ToList();
            if (wordIds.Count < 2)
            {
                throw new InvalidMergeWordSetException("Cannot have a graylist entry with fewer than 2 wordIds.");
            }

            // Remove only the set of wordIds, if in graylist (not any subsets)
            var graylist = await _mergeGraylistRepo.GetAllSets(projectId, userId);
            foreach (var entry in graylist)
            {
                if (entry.WordIds.All(wordIds.Contains) && wordIds.Count == entry.WordIds.Count)
                {
                    await _mergeGraylistRepo.Delete(projectId, entry.Id);
                    return true;
                }
            }
            return false;
        }

        /// <summary> Check if List of wordIds is in MergeBlacklist for specified <see cref="Project"/>. </summary>
        /// <exception cref="InvalidMergeWordSetException"> Throws when wordIds has count less than 2. </exception>
        /// <returns> A bool, true if in the blacklist. </returns>
        public async Task<bool> IsInMergeBlacklist(string projectId, List<string> wordIds, string? userId = null)
        {
            if (wordIds.Count < 2)
            {
                throw new InvalidMergeWordSetException("Cannot blacklist a list of fewer than 2 wordIds.");
            }
            var blacklist = await _mergeBlacklistRepo.GetAllSets(projectId, userId);
            foreach (var entry in blacklist)
            {
                if (wordIds.All(entry.WordIds.Contains))
                {
                    return true;
                }
            }
            return false;
        }

        /// <summary> Check if List of wordIds is in MergeGraylist for specified <see cref="Project"/>. </summary>
        /// <exception cref="InvalidMergeWordSetException"> Throws when wordIds has count less than 2. </exception>
        /// <returns> A bool, true if in the graylist. </returns>
        public async Task<bool> IsInMergeGraylist(string projectId, List<string> wordIds, string? userId = null)
        {
            if (wordIds.Count < 2)
            {
                throw new InvalidMergeWordSetException("Cannot graylist a list of fewer than 2 wordIds.");
            }
            var graylist = await _mergeGraylistRepo.GetAllSets(projectId, userId);
            foreach (var entry in graylist)
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
        /// <returns> Number of <see cref="MergeWordSet"/>s updated. </returns>
        public async Task<int> UpdateMergeBlacklist(string projectId)
        {
            var oldBlacklist = await _mergeBlacklistRepo.GetAllSets(projectId);
            if (oldBlacklist.Count == 0)
            {
                return 0;
            }
            var frontierWordIds = (await _wordRepo.GetFrontier(projectId)).Select(word => word.Id);
            var updateCount = 0;
            foreach (var entry in oldBlacklist)
            {
                var newIds = entry.WordIds.Where(id => frontierWordIds.Contains(id)).ToList();
                if (newIds.Count == entry.WordIds.Count)
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

        /// <summary>
        /// Update merge graylist for specified <see cref="Project"/> to current frontier.
        /// Remove from all graylist entries any ids for words no longer in the frontier
        /// and delete entries that no longer have at least two wordIds.
        /// </summary>
        /// <returns> Number of <see cref="MergeWordSet"/>s updated. </returns>
        public async Task<int> UpdateMergeGraylist(string projectId)
        {
            var oldGraylist = await _mergeGraylistRepo.GetAllSets(projectId);
            if (oldGraylist.Count == 0)
            {
                return 0;
            }
            var frontierWordIds = (await _wordRepo.GetFrontier(projectId)).Select(word => word.Id);
            var updateCount = 0;
            foreach (var entry in oldGraylist)
            {
                var newIds = entry.WordIds.Where(id => frontierWordIds.Contains(id)).ToList();
                if (newIds.Count == entry.WordIds.Count)
                {
                    continue;
                }

                updateCount++;
                if (newIds.Count > 1)
                {
                    entry.WordIds = newIds;
                    await _mergeGraylistRepo.Update(entry);
                }
                else
                {
                    await _mergeGraylistRepo.Delete(projectId, entry.Id);
                }
            }
            return updateCount;
        }

        /// <summary> Get Lists of entries in specified <see cref="Project"/>'s graylist. </summary>
        public async Task<List<List<Word>>> GetGraylistEntries(
            string projectId, int maxLists, string? userId = null)
        {
            var graylist = await _mergeGraylistRepo.GetAllSets(projectId, userId);
            var frontier = await _wordRepo.GetFrontier(projectId);
            var wordLists = new List<List<Word>> { Capacity = maxLists };
            foreach (var entry in graylist)
            {
                if (wordLists.Count == maxLists)
                {
                    break;
                }
                wordLists.Add(frontier.Where(w => entry.WordIds.Contains(w.Id)).ToList());
            }
            return wordLists;
        }

        /// <summary>
        /// Get Lists of potential duplicate <see cref="Word"/>s in specified <see cref="Project"/>'s frontier.
        /// </summary>
        public async Task<List<List<Word>>> GetPotentialDuplicates(
            string projectId, int maxInList, int maxLists, string? userId = null)
        {
            var dupFinder = new DuplicateFinder(maxInList, maxLists, 3);

            var collection = await _wordRepo.GetFrontier(projectId);
            async Task<bool> isUnavailableSet(List<string> wordIds) =>
                (await IsInMergeBlacklist(projectId, wordIds, userId)) ||
                (await IsInMergeGraylist(projectId, wordIds, userId));

            // First pass, only look for words with identical vernacular.
            var wordLists = await dupFinder.GetIdenticalVernWords(collection, isUnavailableSet);

            // If no such sets found, look for similar words.
            if (wordLists.Count == 0)
            {
                collection = await _wordRepo.GetFrontier(projectId);
                wordLists = await dupFinder.GetSimilarWords(collection, isUnavailableSet);
            }

            return wordLists;
        }

        public sealed class InvalidMergeWordSetException : Exception
        {
            public InvalidMergeWordSetException() { }

            public InvalidMergeWordSetException(string message) : base(message) { }
        }
    }
}
