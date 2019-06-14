/* Mark Fuller
 * Mongo to c# api. 
 */

using System.Collections.Generic;
using System.Linq;
using BackendFramework.ValueModels;
using BackendFramework.Interfaces;
using MongoDB.Driver;
using System.Threading.Tasks;
using System;
using BackendFramework.Helper;
using Microsoft.Extensions.Options;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;


namespace BackendFramework.Services
{


    public class UserService : IUserService
    {

        private readonly IUserContext _userDatabase;
        private readonly AppSettings _appSettings;

        public UserService(IUserContext collectionSettings, IOptions<AppSettings> appSettings)
        {
            _userDatabase = collectionSettings;
            _appSettings = appSettings.Value;
        }
        

       
        public async Task<User> Authenticate(string username, string password)
        {
            try
            {
                var user = await _userDatabase.Users.FindAsync(x => (x.Username == username &&  x.Password == password));
                User foundUser = user.Single();

                // return null if user not found
                if (foundUser == null)
                {
                    return null;
                }

                // authentication successful so generate jwt token
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(_appSettings.Secret);
                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(new Claim[]
                    {
                    new Claim(ClaimTypes.Name, foundUser.Id)
                    }),
                    Expires = DateTime.UtcNow.AddDays(365),
                    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
                };
                var token = tokenHandler.CreateToken(tokenDescriptor);
                foundUser.Token = tokenHandler.WriteToken(token);

                // remove password before returning
                if(!await Update(foundUser.Id, foundUser))
                {
                    throw (new KeyNotFoundException());
                }
                foundUser.Password = null;

                return foundUser;
            }
            catch (InvalidOperationException)
            {
                return null;
            }
            catch (MongoInternalException)
            {
                return null;
            }
                }

                // authentication successful so generate jwt token
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(_appSettings.Secret);
                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(new Claim[]
                    {
                    new Claim(ClaimTypes.Name, foundUser.Id)
                    }),
                    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
                };
                var token = tokenHandler.CreateToken(tokenDescriptor);
                foundUser.Token = tokenHandler.WriteToken(token);

                // remove password before returning
                if(!await Update(foundUser.Id, foundUser))
                {
                    throw (new KeyNotFoundException());
                }
                foundUser.Password = null;

                return foundUser;
            }
            catch (InvalidOperationException)
            {
                return null;
            }
            catch (MongoInternalException)
            {
                return null;
            }
        }


        public async Task<List<User>> GetAllUsers()
        {
            return await _userDatabase.Users.Find(_ => true).ToListAsync();
        }

        public async Task<bool> DeleteAllUsers()
        {
            var deleted = await _userDatabase.Users.DeleteManyAsync(_ => true);
            if (deleted.DeletedCount != 0)
            {
                return true;
            }
            return false;
        }

        public async Task<List<User>> GetUsers(List<string> Ids)
        {
            var filterDef = new FilterDefinitionBuilder<User>();
            var filter = filterDef.In(x => x.Id, Ids);
            var userList = await _userDatabase.Users.Find(filter).ToListAsync();

            return userList;
        }

        public async Task<User> Create(User user)
        {
            try
            {
                //check if collection is not empty
                var users = await GetAllUsers();
                if (users.Count == 0)
                {
                //    throw new InvalidOperationException();
                }


                //ckeck to see if username is taken
                if (_userDatabase.Users.Find(x => x.Username == user.Username).ToList().Count > 0)
                {
                    throw new InvalidCastException();
                }

                //insert user
                await _userDatabase.Users.InsertOneAsync(user);
  
                return user;
            }
            catch (Exception)
            {
                return null;
            }

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
                .Set(x => x.Username, user.Username)
                .Set(x => x.UILang, user.UILang)
                .Set(x => x.Token, user.Token);

            var updateResult = await _userDatabase.Users.UpdateOneAsync(filter, updateDef);

            return updateResult.IsAcknowledged && updateResult.ModifiedCount > 0;

        }

        
    }


}