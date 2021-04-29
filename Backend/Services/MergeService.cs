using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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
        /// <returns> The <see cref="MergeBlacklistEntry"/> created. </returns>
        public async Task<MergeBlacklistEntry> AddToMergeBlacklist(
            string projectId, string userId, List<string> wordIds)
        {
            if (wordIds.Count < 2)
            {
                throw new InvalidBlacklistEntryError("Cannot blacklist a list of fewer than 2 wordIds.");
            }
            var blacklist = await _mergeBlacklistRepo.GetAll(projectId);
            foreach (var entry in blacklist)
            {
                if (entry.WordIds.All(id => wordIds.Contains(id)))
                {
                    await _mergeBlacklistRepo.Delete(projectId, entry.Id);
                }
            }
            var newEntry = new MergeBlacklistEntry { ProjectId = projectId, UserId = userId, WordIds = wordIds };
            return await _mergeBlacklistRepo.Create(newEntry);
        }

        /// <summary> Check if List of wordIds is in MergeBlacklist for specified <see cref="Project"/>. </summary>
        /// <returns> A bool, true if in the blacklist. </returns>
        public async Task<bool> IsInMergeBlacklist(string projectId, List<string> wordIds)
        {
            if (wordIds.Count < 2)
            {
                throw new InvalidBlacklistEntryError("Cannot blacklist a list of fewer than 2 wordIds.");
            }
            var blacklist = await _mergeBlacklistRepo.GetAll(projectId);
            foreach (var entry in blacklist)
            {
                if (wordIds.All(id => entry.WordIds.Contains(id)))
                {
                    return true;
                }
            }
            return false;
        }

        /// <summary> Update merge blacklist for specified <see cref="Project"/> to current frontier. </summary>
        /// <returns> Updated List of <see cref="MergeBlacklistEntry"/>s, or null if nothing to update. </returns>
        public async Task<int> UpdateMergeBlacklist(string projectId)
        {
            var oldBlacklist = await _mergeBlacklistRepo.GetAll(projectId);
            if (oldBlacklist is null || oldBlacklist.Count == 0)
            {
                return 0;
            }
            var frontierWordIds = (await _wordRepo.GetFrontier(projectId)).Select(word => word.Id);
            var updateCount = 0;
            foreach (var entry in oldBlacklist)
            {
                var newIds = new List<string>(entry.WordIds.Where(id => frontierWordIds.Contains(id)));
                if (newIds.Count < entry.WordIds.Count)
                {
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
            }
            return updateCount;
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
