using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Otel;
using MongoDB.Driver;

namespace BackendFramework.Repositories
{
    /// <summary> Atomic database functions for <see cref="ProjectSemanticDomainCount"/>s. </summary>
    [ExcludeFromCodeCoverage]
    public class SemanticDomainCountRepository(IMongoDbContext dbContext) : ISemanticDomainCountRepository
    {
        private readonly IMongoCollection<ProjectSemanticDomainCount> _counts =
            dbContext.Db.GetCollection<ProjectSemanticDomainCount>("SemanticDomainCountCollection");

        private const string otelTagName = "otel.SemanticDomainCountRepository";

        private static FilterDefinition<ProjectSemanticDomainCount> ProjectFilter(string projectId)
        {
            var filterDef = new FilterDefinitionBuilder<ProjectSemanticDomainCount>();
            return filterDef.Eq(c => c.ProjectId, projectId);
        }

        private static FilterDefinition<ProjectSemanticDomainCount> ProjectDomainFilter(string projectId, string domainId)
        {
            var filterDef = new FilterDefinitionBuilder<ProjectSemanticDomainCount>();
            return filterDef.And(filterDef.Eq(c => c.ProjectId, projectId), filterDef.Eq(c => c.DomainId, domainId));
        }

        /// <summary> Gets the count for a specific semantic domain in a project </summary>
        public async Task<int> GetCount(string projectId, string domainId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting semantic domain count");

            var result = await _counts.FindAsync(ProjectDomainFilter(projectId, domainId));
            return (await result.FirstOrDefaultAsync())?.Count ?? 0;
        }

        /// <summary> Gets all counts for a project </summary>
        public async Task<List<ProjectSemanticDomainCount>> GetAllCounts(string projectId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting all semantic domain counts");

            return await _counts.Find(ProjectFilter(projectId)).ToListAsync();
        }

        /// <summary> Increments (or decrements if negative) the count for a semantic domain </summary>
        /// <returns> the new count after incrementing </returns>
        public async Task<int> Increment(string projectId, string domainId, int amount = 1)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "incrementing semantic domain count");

            var filter = ProjectDomainFilter(projectId, domainId);

            var updateDef = new UpdateDefinitionBuilder<ProjectSemanticDomainCount>();
            var update = updateDef.Inc(c => c.Count, amount);

            var options = new FindOneAndUpdateOptions<ProjectSemanticDomainCount>
            {
                IsUpsert = true,
                ReturnDocument = ReturnDocument.After
            };

            var result = await _counts.FindOneAndUpdateAsync(filter, update, options);
            return result?.Count ?? 0;
        }

        /// <summary> Deletes all counts for a project </summary>
        public async Task<bool> DeleteAllCounts(string projectId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "deleting all semantic domain counts");

            var result = await _counts.DeleteManyAsync(ProjectFilter(projectId));
            return result.DeletedCount > 0;
        }
    }
}
