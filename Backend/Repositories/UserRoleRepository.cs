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
    /// <summary> Atomic database functions for <see cref="UserRole"/>s. </summary>
    [ExcludeFromCodeCoverage]
    public class UserRoleRepository : IUserRoleRepository
    {
        private readonly IUserRoleContext _userRoleDatabase;

        public UserRoleRepository(IUserRoleContext collectionSettings)
        {
            _userRoleDatabase = collectionSettings;
        }

        /// <summary> Finds all <see cref="UserRole"/>s with specified projectId </summary>
        public async Task<List<UserRole>> GetAllEntries(string projectId)
        {
            return await _userRoleDatabase.UserRoles.Find(u => u.ProjectId == projectId).ToListAsync();
        }

        /// <summary> Removes all <see cref="UserRole"/>s for specified <see cref="Project"/> </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> DeleteAll(string projectId)
        {
            var deleted = await _userRoleDatabase.UserRoles.DeleteManyAsync(u => u.ProjectId == projectId);
            return deleted.DeletedCount != 0;
        }

        /// <summary> Finds <see cref="UserRole"/> with specified entryId and projectId </summary>
        public async Task<UserRole?> GetEntry(string projectId, string entryId)
        {
            var filterDef = new FilterDefinitionBuilder<UserRole>();
            var filter = filterDef.And(filterDef.Eq(
                x => x.ProjectId, projectId), filterDef.Eq(x => x.Id, entryId));

            var userRoleList = await _userRoleDatabase.UserRoles.FindAsync(filter);
            try
            {
                return await userRoleList.FirstAsync();
            }
            catch (InvalidOperationException)
            {
                return null;
            }
        }

        /// <summary> Adds a <see cref="UserRole"/> </summary>
        /// <returns> The UserRole created </returns>
        public async Task<UserRole> Create(UserRole entry)
        {
            await _userRoleDatabase.UserRoles.InsertOneAsync(entry);
            return entry;
        }

        /// <summary> Removes <see cref="UserRole"/> with specified entryId and projectId </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> Delete(string projectId, string entryId)
        {
            var filterDef = new FilterDefinitionBuilder<UserRole>();
            var filter = filterDef.And(filterDef.Eq(
                x => x.ProjectId, projectId), filterDef.Eq(x => x.Id, entryId));

            var deleted = await _userRoleDatabase.UserRoles.DeleteOneAsync(filter);
            return deleted.DeletedCount > 0;
        }

        /// <summary> Updates permissions of <see cref="UserRole"/> with specified entryId </summary>
        /// <returns> A <see cref="ResultOfUpdate"/> enum: success of operation </returns>
        public async Task<ResultOfUpdate> Update(string entryId, UserRole entry)
        {
            var filter = Builders<UserRole>.Filter.Eq(x => x.Id, entryId);
            var updateDef = Builders<UserRole>.Update.Set(x => x.Role, entry.Role);
            var updateResult = await _userRoleDatabase.UserRoles.UpdateOneAsync(filter, updateDef);

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
