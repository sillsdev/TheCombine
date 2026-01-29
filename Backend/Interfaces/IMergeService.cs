using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IMergeService
    {
        Task<List<Word>> Merge(string projectId, string userId, List<MergeWords> mergeWordsList);
        Task<bool> UndoMerge(string projectId, string userId, MergeUndoIds ids);
        Task<MergeWordSet> AddToMergeBlacklist(string projectId, string userId, List<string> wordIds);
        Task<MergeWordSet> AddToMergeGraylist(string projectId, string userId, List<string> wordIds);
        Task<bool> RemoveFromMergeGraylist(string projectId, string userId, List<string> wordIds);
        Task<bool> IsInMergeBlacklist(string projectId, List<string> wordIds, string? userId = null);
        Task<bool> IsInMergeGraylist(string projectId, List<string> wordIds, string? userId = null);
        Task<int> UpdateMergeBlacklist(string projectId);
        Task<int> UpdateMergeGraylist(string projectId);
        Task<bool> GetAndStorePotentialDuplicates(
            string projectId, int maxInList, int maxLists, string userId, bool ignoreProtected = false);
        List<List<Word>>? RetrieveDups(string userId);
        Task<bool> HasGraylistEntries(string projectId, string? userId = null);
        Task<List<List<Word>>> GetGraylistEntries(string projectId, int maxLists, string? userId = null);
    }
}
