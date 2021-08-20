using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IMergeService
    {
        Task<List<Word>> Merge(string projectId, List<MergeWords> mergeWordsList);
        Task<bool> UndoMerge(string projectId, MergeUndoIds ids);
        Task<MergeBlacklistEntry> AddToMergeBlacklist(string projectId, string userId, List<string> wordIds);
        Task<bool> IsInMergeBlacklist(string projectId, List<string> wordIds, string? userId = null);
        Task<int> UpdateMergeBlacklist(string projectId);
        Task<List<List<Word>>> GetPotentialDuplicates(
            string projectId, int maxInList, int maxLists, string? userId = null);
    }
}
