using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace BackendFramework.Services
{
    public class UserService : IUserService
    {
        private readonly IUserContext _userDatabase;
        private readonly AppSettings _jwtsettings;

        public UserService(IUserContext collectionSettings, IOptions<AppSettings> appSettings)
        {
            _userDatabase = collectionSettings;
            _jwtsettings = appSettings.Value;
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
                var key = Encoding.ASCII.GetBytes(_jwtsettings.Secret);
                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(new Claim[]
                    {
                    new Claim(ClaimTypes.Name, foundUser.Id)
                    }),

                    //This line here will cause serious debugging problems if not kept in mind
                    Expires = DateTime.UtcNow.AddMinutes(30),

                    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
                };
                var token = tokenHandler.CreateToken(tokenDescriptor);
                foundUser.Token = tokenHandler.WriteToken(token);

                // remove password before returning
                if(!await Update(foundUser.Id, foundUser))
                {
                    throw (new KeyNotFoundException());
                }
                foundUser.Password = "";

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

        public async Task<User> GetUser(string Id)
        {
            var filterDef = new FilterDefinitionBuilder<User>();
            var filter = filterDef.Eq(x => x.Id, Id);

            var userList = await _userDatabase.Users.FindAsync(filter);

            return userList.FirstOrDefault();
        }

        public async Task<User> Create(User user)
        {
            try
            {
                //check if collection is not empty
                var users = await GetAllUsers();
                
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
                .Set(x => x.Phone, user.Phone)
                .Set(x => x.OtherConnectionField, user.OtherConnectionField)
                .Set(x => x.WorkedProjects, user.WorkedProjects)
                .Set(x => x.Agreement, user.Agreement)
                .Set(x => x.Username, user.Username)
                .Set(x => x.UILang, user.UILang)
                .Set(x => x.Token, user.Token);

            var updateResult = await _userDatabase.Users.UpdateOneAsync(filter, updateDef);

            return updateResult.IsAcknowledged && updateResult.ModifiedCount > 0;

        }

        
    }


}