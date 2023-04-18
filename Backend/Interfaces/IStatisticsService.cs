using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IStatisticsService
    {
        Task<List<SemanticDomainCount>> GetSemanticDomainCounts(string projectId, string lang);
        Task<List<WordsPerDayPerUserCount>> GetWordsPerDayPerUserCounts(string projectId);
        Task<ChartRootData> GetProgressEstimationLineChartRoot(string projectId, List<DateTime> schedule);
        Task<ChartRootData> GetLineChartRootData(string projectId);
        Task<List<SemanticDomainUserCount>> GetSemanticDomainUserCounts(string projectId);
    }

}
