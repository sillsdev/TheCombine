using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IMergeService
    {
        Task<List<Word>> Merge(string projectId, List<MergeWords> mergeWordsList);
        Task<bool> UndoMerge(string projectId, MergeUndoIds ids);
        Task<MergeWordSetEntry> AddToMergeBlacklist(string projectId, string userId, List<string> wordIds);
        Task<MergeWordSetEntry> AddToMergeGraylist(string projectId, string userId, List<string> wordIds);
        Task<bool> IsInMergeBlacklist(string projectId, List<string> wordIds, string? userId = null);
        Task<bool> IsInMergeGraylist(string projectId, List<string> wordIds, string? userId = null);
        Task<int> UpdateMergeBlacklist(string projectId);
        Task<int> UpdateMergeGraylist(string projectId);
        Task<List<List<Word>>> GetPotentialDuplicates(
            string projectId, int maxInList, int maxLists, string? userId = null);
        Task<List<List<Word>>> GetGraylistEntries(string projectId, int maxLists, string? userId = null);
    }
}
