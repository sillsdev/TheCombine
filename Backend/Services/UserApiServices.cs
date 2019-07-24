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
using System.Security.Cryptography;
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
            const int tokenExpirationMinutes = 60 * 4;
            try
            {
                // Fetch the stored user
                var user = await _userDatabase.Users.FindAsync(x => x.Username == username);
                User foundUser = user.Single();

                // return null if user not found
                if (foundUser == null)
                {
                    return null;
                }

                int saltLength = 16;
                int hashLength = 20;

                // Extract the bytes from password
                byte[] hashBytes = Convert.FromBase64String(foundUser.Password);
                // Get the salt
                byte[] salt = new byte[saltLength];
                Array.Copy(hashBytes, 0, salt, 0, saltLength);
                // Compute the hash on the password the user entered
                var rfc = new Rfc2898DeriveBytes(password, salt, 10000);
                byte[] hash = rfc.GetBytes(hashLength);

                // Check if the password given to us matches the hash we have stored (after the salt)
                for (int i = 0; i < hashLength; i++)
                {
                    if (hashBytes[i + saltLength] != hash[i])
                    {
                        throw new UnauthorizedAccessException();
                    }
                }

                // authentication successful so generate jwt token
                var tokenHandler = new JwtSecurityTokenHandler();
                var secretKey = Environment.GetEnvironmentVariable("ASPNETCORE_JWT_SECRET_KEY");
                var key = Encoding.ASCII.GetBytes(secretKey);
                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(new Claim[]
                    {
                    new Claim(ClaimTypes.Name, foundUser.Id)
                    }),

                    //This line here will cause serious debugging problems if not kept in mind
                    Expires = DateTime.UtcNow.AddMinutes(tokenExpirationMinutes),

                    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
                };
                var token = tokenHandler.CreateToken(tokenDescriptor);
                foundUser.Token = tokenHandler.WriteToken(token);

                // remove password before returning
                if (await Update(foundUser.Id, foundUser) != ResultOfUpdate.Updated)
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

                if (users.Count != 0)
                {
                    //check to see if username is taken
                    if (_userDatabase.Users.Find(x => x.Username == user.Username).ToList().Count > 0)
                    {
                        throw new InvalidCastException();
                    }
                }

                int saltLength = 16;
                int hashLength = 20;

                //create randomized salt 
                byte[] salt;
                new RNGCryptoServiceProvider().GetBytes(salt = new byte[saltLength]);

                //hash the password along with the salt
                var pbkdf2 = new Rfc2898DeriveBytes(user.Password, salt, 10000);
                byte[] hash = pbkdf2.GetBytes(20);

                //combine salt and hashed password for storage
                byte[] hashBytes = new byte[saltLength + hashLength];
                Array.Copy(salt, 0, hashBytes, 0, saltLength);
                Array.Copy(hash, 0, hashBytes, saltLength, hashLength);

                //replace pasword with hashed password
                user.Password = Convert.ToBase64String(hashBytes);
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
            var deleted = await _userDatabase.Users.DeleteOneAsync(x => x.Id == Id);
            return deleted.DeletedCount > 0;
        }

        public async Task<ResultOfUpdate> Update(string Id, User user)
        {
            FilterDefinition<User> filter = Builders<User>.Filter.Eq(x => x.Id, Id);

            //Note: Nulls out values not in update body
            var updateDef = Builders<User>.Update
                .Set(x => x.Avatar, user.Avatar)
                .Set(x => x.Name, user.Name)
                .Set(x => x.Email, user.Email)
                .Set(x => x.Phone, user.Phone)
                .Set(x => x.OtherConnectionField, user.OtherConnectionField)
                .Set(x => x.WorkedProjects, user.WorkedProjects)
                .Set(x => x.ProjectRoles, user.ProjectRoles)
                .Set(x => x.Agreement, user.Agreement)
                .Set(x => x.Username, user.Username)
                .Set(x => x.UILang, user.UILang)
                .Set(x => x.Token, user.Token);

            var updateResult = await _userDatabase.Users.UpdateOneAsync(filter, updateDef);

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