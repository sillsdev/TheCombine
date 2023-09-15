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
    /// <summary> Atomic database functions for <see cref="MergeWordSetEntry"/>s. </summary>
    [ExcludeFromCodeCoverage]
    public class MergeGraylistRepository : IMergeWordSetRepository
    {
        private readonly IMergeWordSetContext _mergeGraylistDatabase;

        public MergeGraylistRepository(IMergeWordSetContext collectionSettings)
        {
            _mergeGraylistDatabase = collectionSettings;
        }

        /// <summary> Finds all <see cref="MergeWordSetEntry"/>s for specified <see cref="Project"/>. </summary>
        public async Task<List<MergeWordSetEntry>> GetAllEntries(string projectId, string? userId = null)
        {
            var listFind = userId is null ?
                _mergeGraylistDatabase.MergeWordSet.Find(e => e.ProjectId == projectId) :
                _mergeGraylistDatabase.MergeWordSet.Find(e => e.ProjectId == projectId && e.UserId == userId);
            return await listFind.ToListAsync();
        }

        /// <summary> Removes all <see cref="MergeWordSetEntry"/>s for specified <see cref="Project"/>. </summary>
        /// <returns> A bool: success of operation. </returns>
        public async Task<bool> DeleteAllEntries(string projectId)
        {
            var deleted = await _mergeGraylistDatabase.MergeWordSet.DeleteManyAsync(u => u.ProjectId == projectId);
            return deleted.DeletedCount != 0;
        }

        /// <summary> Finds specified <see cref="MergeWordSetEntry"/> for specified <see cref="Project"/>. </summary>
        public async Task<MergeWordSetEntry?> GetEntry(string projectId, string entryId)
        {
            var filterDef = new FilterDefinitionBuilder<MergeWordSetEntry>();
            var filter = filterDef.And(
                filterDef.Eq(x => x.ProjectId, projectId),
                filterDef.Eq(x => x.Id, entryId));

            var graylistEntryList = await _mergeGraylistDatabase.MergeWordSet.FindAsync(filter);
            try
            {
                return await graylistEntryList.FirstAsync();
            }
            catch (InvalidOperationException)
            {
                return null;
            }
        }

        /// <summary> Adds a <see cref="MergeWordSetEntry"/>. </summary>
        /// <returns> The MergeWordSetEntry created. </returns>
        public async Task<MergeWordSetEntry> Create(MergeWordSetEntry wordSetEntry)
        {
            await _mergeGraylistDatabase.MergeWordSet.InsertOneAsync(wordSetEntry);
            return wordSetEntry;
        }

        /// <summary> Removes specified <see cref="MergeWordSetEntry"/> for specified <see cref="Project"/>. </summary>
        /// <returns> A bool: success of operation. </returns>
        public async Task<bool> Delete(string projectId, string entryId)
        {
            var filterDef = new FilterDefinitionBuilder<MergeWordSetEntry>();
            var filter = filterDef.And(
                filterDef.Eq(x => x.ProjectId, projectId),
                filterDef.Eq(x => x.Id, entryId));
            var deleted = await _mergeGraylistDatabase.MergeWordSet.DeleteOneAsync(filter);
            return deleted.DeletedCount > 0;
        }

        /// <summary> Updates specified <see cref="MergeWordSetEntry"/>. </summary>
        /// <returns> A <see cref="ResultOfUpdate"/> enum: success of operation. </returns>
        public async Task<ResultOfUpdate> Update(MergeWordSetEntry wordSetEntry)
        {
            var filter = Builders<MergeWordSetEntry>.Filter.Eq(x => x.Id, wordSetEntry.Id);
            var updateDef = Builders<MergeWordSetEntry>.Update
                .Set(x => x.ProjectId, wordSetEntry.ProjectId)
                .Set(x => x.UserId, wordSetEntry.UserId)
                .Set(x => x.WordIds, wordSetEntry.WordIds);

            var updateResult = await _mergeGraylistDatabase.MergeWordSet.UpdateOneAsync(filter, updateDef);
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
