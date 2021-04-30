using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Repositories
{
    /// <summary> Atomic database functions for <see cref="MergeBlacklistEntry"/>s. </summary>
    public class MergeBlacklistRepository : IMergeBlacklistRepository
    {
        private readonly IMergeBlacklistContext _mergeBlacklistDatabase;

        public MergeBlacklistRepository(IMergeBlacklistContext collectionSettings)
        {
            _mergeBlacklistDatabase = collectionSettings;
        }

        /// <summary> Finds all <see cref="MergeBlacklistEntry"/>s for specified <see cref="Project"/>. </summary>
        public async Task<List<MergeBlacklistEntry>> GetAll(string projectId, string? userId = null)
        {
            var listFind = userId is null ?
                _mergeBlacklistDatabase.MergeBlacklist.Find(e => e.ProjectId == projectId) :
                _mergeBlacklistDatabase.MergeBlacklist.Find(e => e.ProjectId == projectId && e.UserId == userId);
            return await listFind.ToListAsync();
        }

        /// <summary> Removes all <see cref="MergeBlacklistEntry"/>s for specified <see cref="Project"/>. </summary>
        /// <returns> A bool: success of operation. </returns>
        public async Task<bool> DeleteAll(string projectId)
        {
            var deleted = await _mergeBlacklistDatabase.MergeBlacklist.DeleteManyAsync(u => u.ProjectId == projectId);
            return deleted.DeletedCount != 0;
        }

        /// <summary> Finds specified <see cref="MergeBlacklistEntry"/> for specified <see cref="Project"/>. </summary>
        public async Task<MergeBlacklistEntry?> Get(string projectId, string entryId)
        {
            var filterDef = new FilterDefinitionBuilder<MergeBlacklistEntry>();
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

        /// <summary> Adds a <see cref="MergeBlacklistEntry"/>. </summary>
        /// <returns> The MergeBlacklistEntry created. </returns>
        public async Task<MergeBlacklistEntry> Create(MergeBlacklistEntry blacklistEntry)
        {
            await _mergeBlacklistDatabase.MergeBlacklist.InsertOneAsync(blacklistEntry);
            return blacklistEntry;
        }

        /// <summary> Removes specified <see cref="MergeBlacklistEntry"/> for specified <see cref="Project"/>. </summary>
        /// <returns> A bool: success of operation. </returns>
        public async Task<bool> Delete(string projectId, string entryId)
        {
            var filterDef = new FilterDefinitionBuilder<MergeBlacklistEntry>();
            var filter = filterDef.And(
                filterDef.Eq(x => x.ProjectId, projectId),
                filterDef.Eq(x => x.Id, entryId));
            var deleted = await _mergeBlacklistDatabase.MergeBlacklist.DeleteOneAsync(filter);
            return deleted.DeletedCount > 0;
        }

        /// <summary> Updates specified <see cref="MergeBlacklistEntry"/>. </summary>
        /// <returns> A <see cref="ResultOfUpdate"/> enum: success of operation. </returns>
        public async Task<ResultOfUpdate> Update(MergeBlacklistEntry blacklistEntry)
        {
            var filter = Builders<MergeBlacklistEntry>.Filter.Eq(x => x.Id, blacklistEntry.Id);
            var updateDef = Builders<MergeBlacklistEntry>.Update
                .Set(x => x.ProjectId, blacklistEntry.ProjectId)
                .Set(x => x.UserId, blacklistEntry.UserId)
                .Set(x => x.WordIds, blacklistEntry.WordIds);

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
