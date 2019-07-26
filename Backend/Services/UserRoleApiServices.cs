using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BackendFramework.Services
{
    /// <summary> Atomic database functions for <see cref="UserRole"/>s </summary>
    public class UserRoleService : IUserRoleService
    {
        private readonly IUserRoleContext _userRoleDatabase;

        public UserRoleService(IUserRoleContext collectionSettings)
        {
            _userRoleDatabase = collectionSettings;
        }

        /// <summary> Finds all <see cref="UserRole"/>s with specified projectId </summary>
        public async Task<List<UserRole>> GetAllUserRoles(string projectId)
        {
            return await _userRoleDatabase.UserRoles.Find(u => u.ProjectId == projectId).ToListAsync();
        }

        /// <summary> Removes all <see cref="UserRole"/>s for specified <see cref="Project"/> </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> DeleteAllUserRoles(string projectId)
        {
            var deleted = await _userRoleDatabase.UserRoles.DeleteManyAsync(u => u.ProjectId == projectId);
            if (deleted.DeletedCount != 0)
            {
                return true;
            }
            return false;
        }

        /// <summary> Finds <see cref="UserRole"/> with specified userRoleId and projectId </summary>
        public async Task<UserRole> GetUserRole(string projectId, string userRoleId)
        {
            var filterDef = new FilterDefinitionBuilder<UserRole>();
            var filter = filterDef.And(filterDef.Eq(x => x.ProjectId, projectId), filterDef.Eq(x => x.Id, userRoleId));

            var userRoleList = await _userRoleDatabase.UserRoles.FindAsync(filter);

            return userRoleList.FirstOrDefault();
        }

        /// <summary> Adds a <see cref="UserRole"/> </summary>
        /// <returns> The UserRole created </returns>
        public async Task<UserRole> Create(UserRole userRole)
        {
            await _userRoleDatabase.UserRoles.InsertOneAsync(userRole);
            return userRole;
        }

        /// <summary> Removes <see cref="UserRole"/> with specified userRoleId and projectId </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> Delete(string projectId, string userRoleId)
        {
            var filterDef = new FilterDefinitionBuilder<UserRole>();
            var filter = filterDef.And(filterDef.Eq(x => x.ProjectId, projectId), filterDef.Eq(x => x.Id, userRoleId));

            var deleted = await _userRoleDatabase.UserRoles.DeleteOneAsync(filter);
            return deleted.DeletedCount > 0;
        }

        /// <summary> Updates permissions of <see cref="UserRole"/> with specified userRoleId </summary>
        /// <returns> A <see cref="ResultOfUpdate"/> enum: success of operation </returns>
        public async Task<ResultOfUpdate> Update(string userRoleId, UserRole userRole)
        {
            FilterDefinition<UserRole> filter = Builders<UserRole>.Filter.Eq(x => x.Id, userRoleId);

            var updateDef = Builders<UserRole>.Update.Set(x => x.Permissions, userRole.Permissions);

            var updateResult = await _userRoleDatabase.UserRoles.UpdateOneAsync(filter, updateDef);

            if (!updateResult.IsAcknowledged)
            {
                return ResultOfUpdate.NotFound;
            }
            else if (updateResult.ModifiedCount > 0)
            {
                return ResultOfUpdate.Updated;
            }
            else
            {
                return ResultOfUpdate.NoChange;
            }
        }
    }
}