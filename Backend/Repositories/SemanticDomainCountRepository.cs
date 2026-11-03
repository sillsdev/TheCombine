using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Otel;
using MongoDB.Driver;

namespace BackendFramework.Repositories
{
    /// <summary> Atomic database functions for cached <see cref="ProjectSemanticDomainCount"/>s. </summary>
    public class SemanticDomainCountRepository : ISemanticDomainCountRepository
    {
        private readonly IMongoCollection<ProjectSemanticDomainCount> _counts;

        private const string otelTagName = "otel.SemanticDomainCountRepository";

        public SemanticDomainCountRepository(IMongoDbContext dbContext)
        {
            _counts = dbContext.Db.GetCollection<ProjectSemanticDomainCount>("SemanticDomainCountCollection");

            // The unique compound index enforces one document per (project, domain). Creating it here also
            // guarantees the collection exists before any transactional upsert touches it.
            var keys = Builders<ProjectSemanticDomainCount>.IndexKeys
                .Ascending(c => c.ProjectId)
                .Ascending(c => c.DomainId);
            _counts.Indexes.CreateOne(
                new CreateIndexModel<ProjectSemanticDomainCount>(keys, new CreateIndexOptions { Unique = true }));
        }

        /// <summary> Gets the cached count for a single semantic domain in a project (0 when absent). </summary>
        public async Task<int> GetCount(string projectId, string domainId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting a semantic domain count");

            var count = await _counts.Find(ProjectDomainFilter(projectId, domainId)).FirstOrDefaultAsync();
            return count?.Count ?? 0;
        }

        /// <summary> Gets all cached semantic domain counts for a project. </summary>
        public async Task<List<ProjectSemanticDomainCount>> GetAllCounts(string projectId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting all semantic domain counts");

            return await _counts.Find(c => c.ProjectId == projectId).ToListAsync();
        }

        /// <summary>
        /// Applies signed per-domain deltas to a project's cached counts within a transaction, upserting as needed.
        /// </summary>
        /// <param name="session">Mongo transaction session.</param>
        /// <param name="projectId">Id of the project whose counts are updated.</param>
        /// <param name="domainDeltas">Map of semantic domain id to the signed amount to add (may be negative).</param>
        public async Task ApplyDeltas(
            IClientSessionHandle session, string projectId, IReadOnlyDictionary<string, int> domainDeltas)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "applying semantic domain count deltas");

            var models = new List<WriteModel<ProjectSemanticDomainCount>>();
            foreach (var (domainId, delta) in domainDeltas)
            {
                if (delta == 0)
                {
                    continue;
                }

                var update = Builders<ProjectSemanticDomainCount>.Update.Inc(c => c.Count, delta);
                models.Add(new UpdateOneModel<ProjectSemanticDomainCount>(ProjectDomainFilter(projectId, domainId),
                    update)
                { IsUpsert = true });
            }

            if (models.Count == 0)
            {
                return;
            }

            await _counts.BulkWriteAsync(session, models);
        }

        /// <summary> Removes all cached counts for a project within a transaction. </summary>
        /// <param name="session">Mongo transaction session.</param>
        /// <param name="projectId">Id of the project whose counts are removed.</param>
        public async Task DeleteAllCounts(IClientSessionHandle session, string projectId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "deleting all semantic domain counts");

            await _counts.DeleteManyAsync(session, c => c.ProjectId == projectId);
        }

        /// <summary>
        /// Tallies, per semantic domain id, how many sense-occurrences of that domain appear across the given words.
        /// A word with two senses in the same domain contributes 2, matching the historical per-sense statistics.
        /// </summary>
        public static Dictionary<string, int> CountDomains(IEnumerable<Word> words)
        {
            var counts = new Dictionary<string, int>();
            foreach (var word in words)
            {
                foreach (var sense in word.Senses)
                {
                    foreach (var domain in sense.SemanticDomains)
                    {
                        counts[domain.Id] = counts.GetValueOrDefault(domain.Id) + 1;
                    }
                }
            }

            return counts;
        }

        /// <summary> Tallies semantic domain sense-occurrences for a single word. </summary>
        public static Dictionary<string, int> CountDomains(Word word)
        {
            return CountDomains([word]);
        }

        private static FilterDefinition<ProjectSemanticDomainCount> ProjectDomainFilter(
            string projectId, string domainId)
        {
            var filterDef = new FilterDefinitionBuilder<ProjectSemanticDomainCount>();
            return filterDef.And(filterDef.Eq(c => c.ProjectId, projectId), filterDef.Eq(c => c.DomainId, domainId));
        }
    }
}
