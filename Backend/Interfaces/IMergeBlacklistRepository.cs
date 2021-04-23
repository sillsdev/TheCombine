using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IMergeBlacklistRepository
    {
        Task<List<MergeBlacklistEntry>> GetAll(string projectId);
        Task<MergeBlacklistEntry?> Get(string projectId, string entryId);
        Task<MergeBlacklistEntry> Create(MergeBlacklistEntry mergeBlacklistEntry);
        Task<bool> Delete(string projectId, string entryId);
        Task<bool> DeleteAll(string projectId);
        Task<ResultOfUpdate> Update(string entryId, MergeBlacklistEntry mergeBlacklistEntry);
        Task<bool> Replace(string projectId, List<MergeBlacklistEntry> blacklist);
    }
}
