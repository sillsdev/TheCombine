using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IStatisticsService
    {
        Task<List<SemanticDomainCount>> GetSemanticDomainCounts(string projectId, string lang);
        Task<List<WordsPerDayUserChartJSCount>> GetWordsPerDayUserChartJSCounts(string projectId);
        Task<ChartJsRootData> GetWordsPerDayUserLineChartData(string projectId);
        Task<List<SemanticDomainUserCount>> GetSemanticDomainUserCounts(string projectId);
    }

}
