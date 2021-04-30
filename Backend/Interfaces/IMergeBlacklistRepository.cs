using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IMergeBlacklistRepository
    {
        Task<List<MergeBlacklistEntry>> GetAll(string projectId, string? userId = null);
        Task<MergeBlacklistEntry?> Get(string projectId, string entryId);
        Task<MergeBlacklistEntry> Create(MergeBlacklistEntry mergeBlacklistEntry);
        Task<bool> Delete(string projectId, string entryId);
        Task<bool> DeleteAll(string projectId);
        Task<ResultOfUpdate> Update(MergeBlacklistEntry mergeBlacklistEntry);
    }
}
