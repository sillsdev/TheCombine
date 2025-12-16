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

        /// <summary> Gets the count for a specific semantic domain in a project </summary>
        public async Task<ProjectSemanticDomainCount?> GetCount(string projectId, string domainId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting semantic domain count");

            var filterDef = new FilterDefinitionBuilder<ProjectSemanticDomainCount>();
            var filter = filterDef.And(
                filterDef.Eq(c => c.ProjectId, projectId),
                filterDef.Eq(c => c.DomainId, domainId));

            var result = await _counts.FindAsync(filter);
            return await result.FirstOrDefaultAsync();
        }

        /// <summary> Gets all counts for a project </summary>
        public async Task<List<ProjectSemanticDomainCount>> GetAllCounts(string projectId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting all semantic domain counts");

            var filterDef = new FilterDefinitionBuilder<ProjectSemanticDomainCount>();
            var filter = filterDef.Eq(c => c.ProjectId, projectId);

            return await _counts.Find(filter).ToListAsync();
        }

        /// <summary> Creates a new semantic domain count entry </summary>
        public async Task<ProjectSemanticDomainCount> Create(ProjectSemanticDomainCount count)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "creating semantic domain count");

            await _counts.InsertOneAsync(count);
            return count;
        }

        /// <summary> Increments (or decrements if negative) the count for a semantic domain </summary>
        /// <returns> true if the count was updated, false if it doesn't exist </returns>
        public async Task<bool> Increment(string projectId, string domainId, int amount = 1)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "incrementing semantic domain count");

            var filterDef = new FilterDefinitionBuilder<ProjectSemanticDomainCount>();
            var filter = filterDef.And(
                filterDef.Eq(c => c.ProjectId, projectId),
                filterDef.Eq(c => c.DomainId, domainId));

            var updateDef = new UpdateDefinitionBuilder<ProjectSemanticDomainCount>();
            var update = updateDef.Inc(c => c.Count, amount);

            var options = new FindOneAndUpdateOptions<ProjectSemanticDomainCount>
            {
                IsUpsert = true,
                ReturnDocument = ReturnDocument.After
            };

            var result = await _counts.FindOneAndUpdateAsync(filter, update, options);
            return result is not null;
        }

        /// <summary> Deletes all counts for a project </summary>
        public async Task<bool> DeleteAllCounts(string projectId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "deleting all semantic domain counts");

            var filterDef = new FilterDefinitionBuilder<ProjectSemanticDomainCount>();
            var filter = filterDef.Eq(c => c.ProjectId, projectId);

            var result = await _counts.DeleteManyAsync(filter);
            return result.DeletedCount > 0;
        }
    }
}
