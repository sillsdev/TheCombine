using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Bson;
using MongoDB.Driver;

namespace BackendFramework.Services
{
    /// <summary> All application logic for <see cref="User"/>s </summary>
    public class UserService : IUserService
    {
        private const int SaltLength = 16;
        private const int HashLength = 20;

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
            // Fetch the stored user
            var userList = await _userDatabase.Users.FindAsync(x => x.Username == username);
            User foundUser = userList.FirstOrDefault();

            // Return null if user with specified username not found
            if (foundUser == null)
            {
                return null;
            }

            // Extract the bytes from password
            var hashBytes = Convert.FromBase64String(foundUser.Password);
            // Get the salt from the first part of stored value
            var salt = new byte[SaltLength];
            Array.Copy(hashBytes, 0, salt, 0, SaltLength);
            // Compute the hash on the password the user entered
            var rfc = new Rfc2898DeriveBytes(password, salt, 10000);
            var hash = rfc.GetBytes(HashLength);

            // Check if the password given to us matches the hash we have stored (after the salt)
            for (var i = 0; i < HashLength; i++)
            {
                if (hashBytes[i + SaltLength] != hash[i])
                {
                    return null;
                }
            }

            // Authentication successful so generate jwt token
            return await MakeJwt(foundUser);
        }

        public async Task<User> MakeJwt(User user)
        {
            const int tokenExpirationMinutes = 60 * 4;
            var tokenHandler = new JwtSecurityTokenHandler();
            string secretKey = Environment.GetEnvironmentVariable("ASPNETCORE_JWT_SECRET_KEY");
            var key = Encoding.ASCII.GetBytes(secretKey);

            // Fetch the projects Id and the roles for each Id
            var projectPermissionMap = new List<ProjectPermissions>();

            foreach (var projectRolePair in user.ProjectRoles)
            {
                // Convert each userRoleId to its respective role and add to the mapping
                var permissions = _userRole.GetUserRole(projectRolePair.Key, projectRolePair.Value).Result.Permissions;
                var validEntry = new ProjectPermissions(projectRolePair.Key, permissions);
                projectPermissionMap.Add(validEntry);
            }

            string claimString = projectPermissionMap.ToJson();
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim("UserId", user.Id),
                    new Claim("UserRoleInfo", claimString)
                }),

                Expires = DateTime.UtcNow.AddMinutes(tokenExpirationMinutes),

                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            SecurityToken token = tokenHandler.CreateToken(tokenDescriptor);
            user.Token = tokenHandler.WriteToken(token);

            if (await Update(user.Id, user) != ResultOfUpdate.Updated)
            {
                return null;
            }

            // Remove password and avatar filepath before returning
            user.Password = "";
            user.Avatar = "";

            return user;
        }

        /// <summary> Finds all <see cref="User"/>s </summary>
        public async Task<List<User>> GetAllUsers()
        {
            var users = await _userDatabase.Users.Find(_ => true).ToListAsync();
            return users.Select(c => { c.Avatar = ""; c.Password = ""; c.Token = ""; return c; }).ToList();
        }

        /// <summary> Removes all <see cref="User"/>s </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> DeleteAllUsers()
        {
            DeleteResult deleted = await _userDatabase.Users.DeleteManyAsync(_ => true);
            return deleted.DeletedCount != 0;
        }

        /// <summary> Finds <see cref="User"/> with specified userId </summary>
        public async Task<User> GetUser(string userId)
        {
            var filterDef = new FilterDefinitionBuilder<User>();
            var filter = filterDef.Eq(x => x.Id, userId);

            var userList = await _userDatabase.Users.FindAsync(filter);

            var user = userList.FirstOrDefault();
            user.Avatar = "";
            user.Password = "";
            user.Token = "";
            return user;
        }

        /// <summary> Finds <see cref="User"/> with specified userId and returns avatar filepath </summary>
        public async Task<string> GetUserAvatar(string userId)
        {
            var filterDef = new FilterDefinitionBuilder<User>();
            var filter = filterDef.Eq(x => x.Id, userId);

            var userList = await _userDatabase.Users.FindAsync(filter);

            User user = userList.FirstOrDefault();
            return string.IsNullOrEmpty(user?.Avatar) ? null : user.Avatar;
        }

        /// <summary> Adds a <see cref="User"/> </summary>
        /// <returns> The user created </returns>
        public async Task<User> Create(User user)
        {
            //check if collection is not empty
            var users = await GetAllUsers();

            //check to see if username or email address is taken
            if (users.Count != 0 && _userDatabase.Users.Find(
                x => (x.Username == user.Username || x.Email == user.Email)).ToList().Count > 0)
            {
                return null;
            }

            // Create cryptographically-secure randomized salt
            byte[] salt;
            new RNGCryptoServiceProvider().GetBytes(salt = new byte[SaltLength]);

            // Hash the password along with the salt
            var pbkdf2 = new Rfc2898DeriveBytes(user.Password, salt, 10000);
            var hash = pbkdf2.GetBytes(20);

            // Combine salt and hashed password for storage
            var hashBytes = new byte[SaltLength + HashLength];
            Array.Copy(salt, 0, hashBytes, 0, SaltLength);
            Array.Copy(hash, 0, hashBytes, SaltLength, HashLength);

            // Replace password with hashed password
            user.Password = Convert.ToBase64String(hashBytes);
            await _userDatabase.Users.InsertOneAsync(user);
            user.Password = "";
            user.Avatar = "";

            return user;
        }

        /// <summary> Removes <see cref="User"/> with specified userId </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> Delete(string userId)
        {
            DeleteResult deleted = await _userDatabase.Users.DeleteOneAsync(x => x.Id == userId);
            return deleted.DeletedCount > 0;
        }

        /// <summary> Updates <see cref="User"/> with specified userId </summary>
        /// <returns> A <see cref="ResultOfUpdate"/> enum: success of operation </returns>
        public async Task<ResultOfUpdate> Update(string userId, User user)
        {
            var filter = Builders<User>.Filter.Eq(x => x.Id, userId);

            // Note: Nulls out values not in update body
            var updateDef = Builders<User>.Update
                .Set(x => x.Name, user.Name)
                .Set(x => x.Email, user.Email)
                .Set(x => x.Phone, user.Phone)
                .Set(x => x.OtherConnectionField, user.OtherConnectionField)
                .Set(x => x.WorkedProjects, user.WorkedProjects)
                .Set(x => x.ProjectRoles, user.ProjectRoles)
                .Set(x => x.Agreement, user.Agreement)
                .Set(x => x.Username, user.Username)
                .Set(x => x.UILang, user.UILang);

            if (!string.IsNullOrEmpty(user.Avatar))
                updateDef = updateDef.Set(x => x.Avatar, user.Avatar);

            if (!string.IsNullOrEmpty(user.Token))
                updateDef = updateDef.Set(x => x.Token, user.Token);

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
