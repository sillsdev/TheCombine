using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Repositories
{
    /// <summary> Atomic database functions for <see cref="MergeWordSet"/>s. </summary>
    [ExcludeFromCodeCoverage]
    public class MergeBlacklistRepository : IMergeBlacklistRepository
    {
        private readonly IMergeBlacklistContext _mergeBlacklistDatabase;

        public MergeBlacklistRepository(IMergeBlacklistContext collectionSettings)
        {
            _mergeBlacklistDatabase = collectionSettings;
        }

        /// <summary> Finds all <see cref="MergeWordSet"/>s for specified project. </summary>
        public async Task<List<MergeWordSet>> GetAllEntries(string projectId)
        {
            return await _mergeBlacklistDatabase.MergeBlacklist.Find(e => e.ProjectId == projectId).ToListAsync();
        }

        /// <summary> Finds all <see cref="MergeWordSet"/>s for specified project and user. </summary>
        public async Task<List<MergeWordSet>> GetAllEntries(string projectId, string userId)
        {
            return await _mergeBlacklistDatabase.MergeBlacklist
                .Find(e => e.ProjectId == projectId && e.UserId == userId).ToListAsync();
        }

        /// <summary> Removes all <see cref="MergeWordSet"/>s for specified <see cref="Project"/>. </summary>
        /// <returns> A bool: success of operation. </returns>
        public async Task<bool> DeleteAll(string projectId)
        {
            var deleted = await _mergeBlacklistDatabase.MergeBlacklist.DeleteManyAsync(u => u.ProjectId == projectId);
            return deleted.DeletedCount != 0;
        }

        /// <summary> Finds specified <see cref="MergeWordSet"/> for specified <see cref="Project"/>. </summary>
        public async Task<MergeWordSet?> GetEntry(string projectId, string entryId)
        {
            var filterDef = new FilterDefinitionBuilder<MergeWordSet>();
            var filter = filterDef.And(
                filterDef.Eq(x => x.ProjectId, projectId),
                filterDef.Eq(x => x.Id, entryId));

            var blacklistEntryList = await _mergeBlacklistDatabase.MergeBlacklist.FindAsync(filter);
            try
            {
                return await blacklistEntryList.FirstAsync();
            }
            catch (InvalidOperationException)
            {
                return null;
            }
        }

        /// <summary> Adds a <see cref="MergeWordSet"/>. </summary>
        /// <returns> The MergeWordSet created. </returns>
        public async Task<MergeWordSet> Create(MergeWordSet entry)
        {
            await _mergeBlacklistDatabase.MergeBlacklist.InsertOneAsync(entry);
            return entry;
        }

        /// <summary> Removes specified <see cref="MergeWordSet"/> for specified <see cref="Project"/>. </summary>
        /// <returns> A bool: success of operation. </returns>
        public async Task<bool> Delete(string projectId, string entryId)
        {
            var filterDef = new FilterDefinitionBuilder<MergeWordSet>();
            var filter = filterDef.And(
                filterDef.Eq(x => x.ProjectId, projectId),
                filterDef.Eq(x => x.Id, entryId));
            var deleted = await _mergeBlacklistDatabase.MergeBlacklist.DeleteOneAsync(filter);
            return deleted.DeletedCount > 0;
        }

        /// <summary> Updates specified <see cref="MergeWordSet"/>. </summary>
        /// <returns> A <see cref="ResultOfUpdate"/> enum: success of operation. </returns>
        public async Task<ResultOfUpdate> Update(MergeWordSet entry)
        {
            var filter = Builders<MergeWordSet>.Filter.Eq(x => x.Id, entry.Id);
            var updateDef = Builders<MergeWordSet>.Update
                .Set(x => x.ProjectId, entry.ProjectId)
                .Set(x => x.UserId, entry.UserId)
                .Set(x => x.WordIds, entry.WordIds);

            var updateResult = await _mergeBlacklistDatabase.MergeBlacklist.UpdateOneAsync(filter, updateDef);
            if (!updateResult.IsAcknowledged)
            {
                return ResultOfUpdate.NotFound;
            }
            if (updateResult.ModifiedCount > 0)
            {
                return ResultOfUpdate.Updated;
            }
            return ResultOfUpdate.NoChange;
        }
    }
}
