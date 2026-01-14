using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;

namespace Backend.Tests.Mocks
{
    internal sealed class StatisticsServiceMock : IStatisticsService
    {
        public Task<List<SemanticDomainCount>> GetSemanticDomainCounts(string projectId, string lang)
        {
            return Task.FromResult(new List<SemanticDomainCount>());
        }
        public Task<List<WordsPerDayPerUserCount>> GetWordsPerDayPerUserCounts(string projectId)
        {
            return Task.FromResult(new List<WordsPerDayPerUserCount>());
        }
        public Task<ChartRootData> GetProgressEstimationLineChartRoot(string projectId, List<DateTime> schedule)
        {
            return Task.FromResult(new ChartRootData());
        }
        public Task<ChartRootData> GetLineChartRootData(string projectId)
        {
            return Task.FromResult(new ChartRootData());
        }
        public Task<List<SemanticDomainUserCount>> GetSemanticDomainUserCounts(string projectId)
        {
            return Task.FromResult(new List<SemanticDomainUserCount>());
        }
        public Task<double> GetDomainProgressProportion(string projectId, string domainId)
        {
            return Task.FromResult(0.0);
        }
    }
}
