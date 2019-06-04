/* Mark Fuller
 * Mongo to c# api. 
 */

using System.Collections.Generic;
using System.Linq;
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


    public class UserService : IUserService
    {

        private readonly IUserContext _userDatabase;

        public UserService(IUserContext collectionSettings)
        {
            _userDatabase = collectionSettings;
        }

        public async Task<List<User>> GetAllUsers()
        {
            return await _userDatabase.Users.Find(_ => true).ToListAsync();
        }

        public async Task<bool> DeleteAllUsers()
        {
             var deleted = await _userDatabase.Users.DeleteManyAsync(_ => true);
            if(deleted.DeletedCount != 0)
            {
                return true;
            }
            return false;
        }

        public async Task<List<User>> GetUser(string identificaton)
        {
            var cursor = await _userDatabase.Users.FindAsync(x => x.Id == identificaton);
            return cursor.ToList();
        }

        public async Task<User> Create(User user)
        {
            await _userDatabase.Users.InsertOneAsync(user);
            return user;

        }

        public async Task<bool> Delete(string Id)
        {
            var deleted = await _userDatabase.Users.DeleteManyAsync(x => x.Id == Id);
            return deleted.DeletedCount > 0;
        }



        public async Task<bool> Update(string Id, User user)
        {
            FilterDefinition<User> filter = Builders<User>.Filter.Eq(x => x.Id, Id);

            User updatedUser = new User();

            //Note: Nulls out values not in update body
            var updateDef = Builders<User>.Update
                .Set(x => x.Avatar, user.Avatar)
                .Set(x => x.Name, user.Name)
                .Set(x => x.Email, user.Email)
                .Set(x => x.OtherConnectionField, user.OtherConnectionField)
                .Set(x => x.WorkedProjects, user.WorkedProjects)
                .Set(x => x.Agreement, user.Agreement)
                .Set(x => x.Password, user.Password)
                .Set(x => x.UserName, user.UserName)
                .Set(x => x.UILang, user.UILang);

            var updateResult = await _userDatabase.Users.UpdateOneAsync(filter, updateDef);

            return updateResult.IsAcknowledged && updateResult.ModifiedCount > 0;
           
        }
    }


}