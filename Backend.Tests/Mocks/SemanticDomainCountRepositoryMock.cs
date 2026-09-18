using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using MongoDB.Driver;

namespace Backend.Tests.Mocks
{
    internal sealed class SemanticDomainCountRepositoryMock : ISemanticDomainCountRepository
    {
        private readonly List<ProjectSemanticDomainCount> _counts = [];

        public Task<int> GetCount(string projectId, string domainId)
        {
            var count = _counts
                .FirstOrDefault(c => c.ProjectId == projectId && c.DomainId == domainId)?.Count ?? 0;
            return Task.FromResult(count);
        }

        public Task<List<ProjectSemanticDomainCount>> GetAllCounts(string projectId)
        {
            return Task.FromResult(_counts.Where(c => c.ProjectId == projectId).Select(c => c.Clone()).ToList());
        }

        // The session is ignored: this mock does not simulate transactions.
        public Task ApplyDeltas(
            IClientSessionHandle session, string projectId, IReadOnlyDictionary<string, int> domainDeltas)
        {
            foreach (var (domainId, delta) in domainDeltas)
            {
                if (delta == 0)
                {
                    continue;
                }

                var existing = _counts.FirstOrDefault(c => c.ProjectId == projectId && c.DomainId == domainId);
                if (existing is null)
                {
                    _counts.Add(new ProjectSemanticDomainCount(projectId, domainId, delta));
                }
                else
                {
                    existing.Count += delta;
                }
            }

            return Task.CompletedTask;
        }

        public Task DeleteAllCounts(IClientSessionHandle session, string projectId)
        {
            _counts.RemoveAll(c => c.ProjectId == projectId);
            return Task.CompletedTask;
        }

        /// <summary> Test helper to seed a count directly, without a transaction. </summary>
        public void SetCount(string projectId, string domainId, int count)
        {
            var existing = _counts.FirstOrDefault(c => c.ProjectId == projectId && c.DomainId == domainId);
            if (existing is null)
            {
                _counts.Add(new ProjectSemanticDomainCount(projectId, domainId, count));
            }
            else
            {
                existing.Count = count;
            }
        }
    }
}
