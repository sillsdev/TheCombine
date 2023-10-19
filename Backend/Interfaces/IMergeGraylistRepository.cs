using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IMergeGraylistRepository : IRepositoryByProjectId<MergeWordSet>
    {
        Task<List<MergeWordSet>> GetAllEntries(string projectId, string userId);
        Task<ResultOfUpdate> Update(MergeWordSet entry);
    }
}
