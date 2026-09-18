using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Interfaces
{
    /// <summary>
    /// Database functions for cached per-project semantic domain sense counts
    /// (see <see cref="ProjectSemanticDomainCount"/>).
    /// </summary>
    /// <remarks>
    /// Writes take an <see cref="IClientSessionHandle"/> so they can run inside the same transaction as the
    /// word write that changed the Frontier, keeping the counts atomically in sync. Reads run outside any
    /// transaction (used by the statistics and word-count endpoints).
    /// </remarks>
    public interface ISemanticDomainCountRepository
    {
        /// <summary> Gets the cached count for a single semantic domain in a project (0 when absent). </summary>
        Task<int> GetCount(string projectId, string domainId);

        /// <summary> Gets all cached semantic domain counts for a project. </summary>
        Task<List<ProjectSemanticDomainCount>> GetAllCounts(string projectId);

        /// <summary>
        /// Applies signed per-domain deltas to a project's cached counts within a transaction, upserting as needed.
        /// </summary>
        /// <param name="session">Mongo transaction session.</param>
        /// <param name="projectId">Id of the project whose counts are updated.</param>
        /// <param name="domainDeltas">Map of semantic domain id to the signed amount to add (may be negative).</param>
        Task ApplyDeltas(IClientSessionHandle session, string projectId, IReadOnlyDictionary<string, int> domainDeltas);

        /// <summary> Removes all cached counts for a project within a transaction. </summary>
        /// <param name="session">Mongo transaction session.</param>
        /// <param name="projectId">Id of the project whose counts are removed.</param>
        Task DeleteAllCounts(IClientSessionHandle session, string projectId);
    }
}
