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
    /// <summary> Atomic database functions for Graylist <see cref="MergeWordSet"/>s. </summary>
    [ExcludeFromCodeCoverage]
    public class MergeGraylistRepository(IMongoDbContext dbContext) : IMergeGraylistRepository
    {
        private readonly IMongoCollection<MergeWordSet> _mergeGraylist =
            dbContext.Db.GetCollection<MergeWordSet>("MergeGraylistCollection");

        /// <summary> Finds all <see cref="MergeWordSet"/>s for specified <see cref="Project"/>. </summary>
        public async Task<List<MergeWordSet>> GetAllSets(string projectId, string? userId = null)
        {
            var listFind = userId is null ?
                _mergeGraylist.Find(e => e.ProjectId == projectId) :
                _mergeGraylist.Find(e => e.ProjectId == projectId && e.UserId == userId);
            return await listFind.ToListAsync();
        }

        /// <summary> Removes all <see cref="MergeWordSet"/>s for specified <see cref="Project"/>. </summary>
        /// <returns> A bool: success of operation. </returns>
        public async Task<bool> DeleteAllSets(string projectId)
        {
            var deleted = await _mergeGraylist.DeleteManyAsync(u => u.ProjectId == projectId);
            return deleted.DeletedCount != 0;
        }

        /// <summary> Finds specified <see cref="MergeWordSet"/> for specified <see cref="Project"/>. </summary>
        public async Task<MergeWordSet?> GetSet(string projectId, string entryId)
        {
            var filterDef = new FilterDefinitionBuilder<MergeWordSet>();
            var filter = filterDef.And(
                filterDef.Eq(x => x.ProjectId, projectId),
                filterDef.Eq(x => x.Id, entryId));

            var graylistEntryList = await _mergeGraylist.FindAsync(filter);
            try
            {
                return await graylistEntryList.FirstAsync();
            }
            catch (InvalidOperationException)
            {
                return null;
            }
        }

        /// <summary> Adds a <see cref="MergeWordSet"/>. </summary>
        /// <returns> The MergeWordSet created. </returns>
        public async Task<MergeWordSet> Create(MergeWordSet wordSetEntry)
        {
            await _mergeGraylist.InsertOneAsync(wordSetEntry);
            return wordSetEntry;
        }

        /// <summary> Removes specified <see cref="MergeWordSet"/> for specified <see cref="Project"/>. </summary>
        /// <returns> A bool: success of operation. </returns>
        public async Task<bool> Delete(string projectId, string entryId)
        {
            var filterDef = new FilterDefinitionBuilder<MergeWordSet>();
            var filter = filterDef.And(
                filterDef.Eq(x => x.ProjectId, projectId),
                filterDef.Eq(x => x.Id, entryId));
            var deleted = await _mergeGraylist.DeleteOneAsync(filter);
            return deleted.DeletedCount > 0;
        }

        /// <summary> Updates specified <see cref="MergeWordSet"/>. </summary>
        /// <returns> A <see cref="ResultOfUpdate"/> enum: success of operation. </returns>
        public async Task<ResultOfUpdate> Update(MergeWordSet wordSetEntry)
        {
            var filter = Builders<MergeWordSet>.Filter.Eq(x => x.Id, wordSetEntry.Id);
            var updateDef = Builders<MergeWordSet>.Update
                .Set(x => x.ProjectId, wordSetEntry.ProjectId)
                .Set(x => x.UserId, wordSetEntry.UserId)
                .Set(x => x.WordIds, wordSetEntry.WordIds);

            var updateResult = await _mergeGraylist.UpdateOneAsync(filter, updateDef);
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
