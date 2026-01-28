using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface ISemanticDomainCountRepository
    {
        Task<int> GetCount(string projectId, string domainId);
        Task<List<ProjectSemanticDomainCount>> GetAllCounts(string projectId);
        Task<int> Increment(string projectId, string domainId, int amount = 1);
        Task<int> DeleteAllCounts(string projectId);
    }
}
