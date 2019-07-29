using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Bson;
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
    /// <summary> All application logic for <see cref="User"/>s </summary>
    public class UserService : IUserService
    {
        private readonly IUserContext _userDatabase;
        private readonly IUserRoleService _userRole;

        public UserService(IUserContext collectionSettings, IUserRoleService userRole)
        {
            _userDatabase = collectionSettings;
            _userRole = userRole;
        }

        /// <summary> Confirms login credentials are valid </summary>
        /// <returns> User when credentials are correct, null otherwise </returns>
        public async Task<User> Authenticate(string username, string password)
        {
            //fetch the stored user
            var userList = await _userDatabase.Users.FindAsync(x => x.Username == username);
            User foundUser = userList.FirstOrDefault();

            //return null if user wtih specified username not found
            if (foundUser == null)
            {
                return null;
            }

            int saltLength = 16;
            int hashLength = 20;

            //extract the bytes from password
            byte[] hashBytes = Convert.FromBase64String(foundUser.Password);
            //get the salt from the first part of stored value
            byte[] salt = new byte[saltLength];
            Array.Copy(hashBytes, 0, salt, 0, saltLength);
            //compute the hash on the password the user entered
            var rfc = new Rfc2898DeriveBytes(password, salt, 10000);
            byte[] hash = rfc.GetBytes(hashLength);

            //check if the password given to us matches the hash we have stored (after the salt)
            for (int i = 0; i < hashLength; i++)
            {
                if (hashBytes[i + saltLength] != hash[i])
                {
                    return null;
                }
            }

            // authentication successful so generate jwt token
            return await MakeJWT(foundUser);
        }

        public async Task<User> MakeJWT(User user)
        {
            const int tokenExpirationMinutes = 60 * 4;
            var tokenHandler = new JwtSecurityTokenHandler();
            var secretKey = Environment.GetEnvironmentVariable("ASPNETCORE_JWT_SECRET_KEY");
            var key = Encoding.ASCII.GetBytes(secretKey);

            //fetch the projects Id and the roles for each Id
            List<ProjectPermissions> projectPermissionMap = new List<ProjectPermissions>();

            foreach (var projectRolePair in user.ProjectRoles)
            {
                //convert each userRole ID to its respective role && add to the mapping
                var permissions = _userRole.GetUserRole(projectRolePair.Key, projectRolePair.Value).Result.Permissions;
                var validEntry = new ProjectPermissions(projectRolePair.Key, permissions);
                projectPermissionMap.Add(validEntry);
            }

            var claimString = projectPermissionMap.ToJson();

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim("UserId", user.Id),
                    new Claim("UserRoleInfo", claimString)
                }),
                
                Expires = DateTime.UtcNow.AddMinutes(tokenExpirationMinutes),

                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            user.Token = tokenHandler.WriteToken(token);

            if (await Update(user.Id, user) != ResultOfUpdate.Updated)
            {
                return null;
            }

            // remove password before returning
            user.Password = "";

            return user;
        }

        /// <summary> Finds all <see cref="User"/>s </summary>
        public async Task<List<User>> GetAllUsers()
        {
            return await _userDatabase.Users.Find(_ => true).ToListAsync();
        }

        /// <summary> Removes all <see cref="User"/>s </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> DeleteAllUsers()
        {
            var deleted = await _userDatabase.Users.DeleteManyAsync(_ => true);
            if (deleted.DeletedCount != 0)
            {
                return true;
            }
            return false;
        }

        /// <summary> Finds <see cref="User"/> with specified userId </summary>
        public async Task<User> GetUser(string userId)
        {
            var filterDef = new FilterDefinitionBuilder<User>();
            var filter = filterDef.Eq(x => x.Id, userId);

            var userList = await _userDatabase.Users.FindAsync(filter);

            return userList.FirstOrDefault();
        }

        /// <summary> Adds a <see cref="User"/> </summary>
        /// <returns> The user created </returns>
        public async Task<User> Create(User user)
        {
            //check if collection is not empty
            var users = await GetAllUsers();

            //check to see if username is taken
            if (users.Count != 0 && _userDatabase.Users.Find(x => x.Username == user.Username).ToList().Count > 0)
            {
                return null;
            }

            int saltLength = 16;
            int hashLength = 20;

            //create cryptographically-secure randomized salt 
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

        /// <summary> Removes <see cref="User"/> with specified userId </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> Delete(string userId)
        {
            var deleted = await _userDatabase.Users.DeleteOneAsync(x => x.Id == userId);
            return deleted.DeletedCount > 0;
        }

        /// <summary> Updates <see cref="User"/> with specified userId </summary>
        /// <returns> A <see cref="ResultOfUpdate"/> enum: success of operation </returns>
        public async Task<ResultOfUpdate> Update(string userId, User user)
        {
            FilterDefinition<User> filter = Builders<User>.Filter.Eq(x => x.Id, userId);

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

            //do not update admin privilages

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
    public class ProjectPermissions
    {
        public ProjectPermissions(string projectId, List<int> permissions)
        {
            ProjectId = projectId;
            Permissions = permissions;
        }
        public string ProjectId { get; set; }
        public List<int> Permissions { get; set; }
    }
}