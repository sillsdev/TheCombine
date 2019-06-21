using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using MongoDB.Driver;
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

        public async Task<List<UserRole>> GetAllUserRoles()
        {
            return await _userRoleDatabase.UserRoles.Find(_ => true).ToListAsync();
        }

        public async Task<bool> DeleteAllUserRoles()
        {
            var deleted = await _userRoleDatabase.UserRoles.DeleteManyAsync(_ => true);
            if(deleted.DeletedCount != 0)
            {
                return true;
            }
            return false;
        }

        public async Task<UserRole> GetUserRole(string Id)
        {
            var filterDef = new FilterDefinitionBuilder<UserRole>();
            var filter = filterDef.Eq(x => x.Id, Id);

            var userRoleList = await _userRoleDatabase.UserRoles.FindAsync(filter);
                        
            return userRoleList.FirstOrDefault();
        }

        public async Task<UserRole> Create(UserRole userRole)
        {
            await _userRoleDatabase.UserRoles.InsertOneAsync(userRole);
            return userRole;
        }

        public async Task<bool> Delete(string Id)
        {
            var deleted = await _userRoleDatabase.UserRoles.DeleteManyAsync(x => x.Id == Id);
            return deleted.DeletedCount > 0;
        }

        public async Task<bool> Update(string Id, UserRole userRole)
        {
            FilterDefinition<UserRole> filter = Builders<UserRole>.Filter.Eq(x => x.Id, Id);

            UserRole updatedUserRole = new UserRole();

            //Note: Nulls out values not in update body
            var updateDef = Builders<UserRole>.Update
                .Set(x => x.Permission, userRole.Permission)
                .Set(x => x.History, userRole.History);

            var updateResult = await _userRoleDatabase.UserRoles.UpdateOneAsync(filter, updateDef);

            return updateResult.IsAcknowledged && updateResult.ModifiedCount > 0;
           
        }
    }


}