using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IMergeWordSetRepository
    {
        Task<List<MergeWordSet>> GetAllSets(string projectId, string? userId = null);
        Task<MergeWordSet?> GetSet(string projectId, string entryId);
        Task<MergeWordSet> Create(MergeWordSet wordSetEntry);
        Task<bool> Delete(string projectId, string entryId);
        Task<bool> DeleteAllEntries(string projectId);
        Task<ResultOfUpdate> Update(MergeWordSet wordSetEntry);
    }
}
