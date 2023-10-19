using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IMergeService
    {
        Task<List<Word>> Merge(string projectId, List<MergeWords> mergeWordsList);
        Task<bool> UndoMerge(string projectId, MergeUndoIds ids);
        Task<MergeWordSet> AddToMergeBlacklist(string projectId, string userId, List<string> wordIds);
        Task<MergeWordSet> AddToMergeGraylist(string projectId, string userId, List<string> wordIds);
        Task<bool> RemoveFromMergeGraylist(string projectId, string userId, List<string> wordIds);
        Task<bool> IsInMergeBlacklist(string projectId, string userId, List<string> wordIds);
        Task<bool> IsInMergeGraylist(string projectId, string userId, List<string> wordIds);
        Task<int> UpdateMergeBlacklist(string projectId);
        Task<int> UpdateMergeGraylist(string projectId);
        Task<List<List<Word>>> GetPotentialDuplicates(string projectId, string userId, int maxInList, int maxLists);
        Task<List<List<Word>>> GetGraylistEntries(string projectId, string userId, int maxLists);
    }
}
