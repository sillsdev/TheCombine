using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;

namespace Backend.Tests.Mocks
{
    public sealed class SemanticDomainCountRepositoryMock : ISemanticDomainCountRepository
    {
        private readonly List<ProjectSemanticDomainCount> _counts;

        public SemanticDomainCountRepositoryMock()
        {
            _counts = new List<ProjectSemanticDomainCount>();
        }

        public Task<int> GetCount(string projectId, string domainId)
        {
            var count = _counts.FirstOrDefault(c => c.ProjectId == projectId && c.DomainId == domainId);
            return Task.FromResult(count?.Count ?? 0);
        }

        public Task<List<ProjectSemanticDomainCount>> GetAllCounts(string projectId)
        {
            var counts = _counts.Where(c => c.ProjectId == projectId).ToList();
            return Task.FromResult(counts);
        }

        public Task<ProjectSemanticDomainCount> Create(ProjectSemanticDomainCount count)
        {
            count.Id = Util.RandString();
            _counts.Add(count);
            return Task.FromResult(count);
        }

        public Task<bool> Increment(string projectId, string domainId, int amount = 1)
        {
            var count = _counts.FirstOrDefault(c => c.ProjectId == projectId && c.DomainId == domainId);
            if (count is null)
            {
                count = new ProjectSemanticDomainCount(projectId, domainId, amount)
                {
                    Id = Util.RandString()
                };
                _counts.Add(count);
            }
            else
            {
                count.Count += amount;
            }
            return Task.FromResult(true);
        }

        public Task<bool> DeleteAllCounts(string projectId)
        {
            var removed = _counts.RemoveAll(c => c.ProjectId == projectId);
            return Task.FromResult(removed > 0);
        }
    }
}
