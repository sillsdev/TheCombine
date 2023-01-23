using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IStatisticsService
    {
        Task<List<KeyValuePair<SemanticDomainTreeNode, int>>> GetSemanticDomainCounts(string projectId, string lang);
    }
}
