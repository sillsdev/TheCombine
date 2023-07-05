using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IMergeBlacklistRepository
    {
        Task<List<MergeBlacklistEntry>> GetAllEntries(string projectId, string? userId = null);
        Task<MergeBlacklistEntry?> GetEntry(string projectId, string entryId);
        Task<MergeBlacklistEntry> Create(MergeBlacklistEntry blacklistEntry);
        Task<bool> Delete(string projectId, string entryId);
        Task<bool> DeleteAllEntries(string projectId);
        Task<ResultOfUpdate> Update(MergeBlacklistEntry blacklistEntry);
    }
}
