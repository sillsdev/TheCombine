using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IStatisticsService
    {
        Task<List<KeyValuePair<SemanticDomainTreeNode, int>>> GetAllStatisticsKeyPair(string projectId, string lang);
    }

}