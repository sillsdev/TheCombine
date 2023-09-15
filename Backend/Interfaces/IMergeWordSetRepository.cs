using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IMergeWordSetRepository
    {
        Task<List<MergeWordSetEntry>> GetAllEntries(string projectId, string? userId = null);
        Task<MergeWordSetEntry?> GetEntry(string projectId, string entryId);
        Task<MergeWordSetEntry> Create(MergeWordSetEntry wordSetEntry);
        Task<bool> Delete(string projectId, string entryId);
        Task<bool> DeleteAllEntries(string projectId);
        Task<ResultOfUpdate> Update(MergeWordSetEntry wordSetEntry);
    }
}
