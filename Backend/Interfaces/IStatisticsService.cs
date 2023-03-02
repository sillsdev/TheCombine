using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IStatisticsService
    {
        Task<List<SemanticDomainCount>> GetSemanticDomainCounts(string projectId, string lang);
        Task<List<SemanticDomainTimestampNode>> GetSemanticDomainTimestampCounts(string projectId);

        Task<List<ChartTimestampNode>> GetChartTimestampNodeCounts(string projectId);
        Task<List<SemanticDomainUserCount>> GetSemanticDomainUserCounts(string projectId);
    }
}
