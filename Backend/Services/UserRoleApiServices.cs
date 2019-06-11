/* Mark Fuller
 * Mongo to c# api. 
 */

using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using BackendFramework.ValueModels;
using BackendFramework.Interfaces;
using Microsoft.Extensions.Configuration;
using MongoDB.Driver;
using BackendFramework.Context;
using BackendFramework.Services;
using System.Threading.Tasks;
using MongoDB.Bson;
using System;

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

        public async Task<List<UserRole>> GetUserRoles(List<string> Ids)
        {
            var filterDef = new FilterDefinitionBuilder<UserRole>();
            var filter = filterDef.In(x=>x.Id , Ids);
            var userRoleList = await _userRoleDatabase.UserRoles.Find(filter).ToListAsync();
                        
            return userRoleList;
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