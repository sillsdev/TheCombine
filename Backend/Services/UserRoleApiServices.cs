using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BackendFramework.Services
{
    public class UserRoleService : IUserRoleService
    {
        private readonly IUserRoleContext _userRoleDatabase;

        public UserRoleService(IUserRoleContext collectionSettings)
        {
            _userRoleDatabase = collectionSettings;
        }

        public async Task<List<UserRole>> GetAllUserRoles(string projectId)
        {
            return await _userRoleDatabase.UserRoles.Find(u => u.ProjectId == projectId).ToListAsync();
        }

        public async Task<bool> DeleteAllUserRoles(string projectId)
        {
            var deleted = await _userRoleDatabase.UserRoles.DeleteManyAsync(u => u.ProjectId == projectId);
            if (deleted.DeletedCount != 0)
            {
                return true;
            }
            return false;
        }

        public async Task<UserRole> GetUserRole(string projectId, string userRoleId)
        {
            var filterDef = new FilterDefinitionBuilder<UserRole>();
            var filter = filterDef.And(filterDef.Eq(x => x.ProjectId, projectId), filterDef.Eq(x => x.Id, userRoleId));

            var userRoleList = await _userRoleDatabase.UserRoles.FindAsync(filter);

            return userRoleList.FirstOrDefault();
        }

        public async Task<UserRole> Create(UserRole userRole)
        {
            await _userRoleDatabase.UserRoles.InsertOneAsync(userRole);
            return userRole;
        }

        public async Task<bool> Delete(string projectId, string userRoleId)
        {
            var filterDef = new FilterDefinitionBuilder<UserRole>();
            var filter = filterDef.And(filterDef.Eq(x => x.ProjectId, projectId), filterDef.Eq(x => x.Id, userRoleId));

            var deleted = await _userRoleDatabase.UserRoles.DeleteManyAsync(filter);
            return deleted.DeletedCount > 0;
        }

        public async Task<bool> Update(string userRoleId, UserRole userRole)
        {
            FilterDefinition<UserRole> filter = Builders<UserRole>.Filter.Eq(x => x.Id, userRoleId);

            UserRole updatedUserRole = new UserRole();

            var updateDef = Builders<UserRole>.Update.Set(x => x.Permissions, userRole.Permissions);

            var updateResult = await _userRoleDatabase.UserRoles.UpdateOneAsync(filter, updateDef);

            if (!updateResult.IsAcknowledged)
            {
                throw new Exception("User not found");
            }

            return updateResult.ModifiedCount > 0;
        }
    }
}