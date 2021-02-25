using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using BackendFramework.Helper;
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
        private readonly IUserContext _userDatabase;
        private readonly IUserRoleService _userRole;

        public UserService(IUserContext collectionSettings, IUserRoleService userRole)
        {
            _userDatabase = collectionSettings;
            _userRole = userRole;
        }

        /// <summary> Password hashing and validation. </summary>
        private static class PasswordHash
        {
            private const int SaltLength = 16;

            /// <summary> Use SHA256 length. </summary>
            private const int HashLength = 256 / 8;

            /// <summary> Hash iterations to slow down brute force password cracking. </summary>
            /// It's important that this value is not too low, or password cracking is made easier.
            /// Value selected from default Django 3.1 iteration count (appropriate as of August 2020).
            /// https://docs.djangoproject.com/en/dev/releases/3.1/#django-contrib-auth
            private const int HashIterations = 216000;

            /// <summary>
            /// Hash a password with a generated salt and return the combined bytes suitable for storage.
            /// </summary>
            public static byte[] HashPassword(string password)
            {
                var salt = CreateSalt();

                // Hash the password along with the salt
                var hash = HashPassword(password, salt);

                // Combine salt and hashed password for storage
                var hashBytes = new byte[SaltLength + HashLength];
                Array.Copy(salt, 0, hashBytes, 0, SaltLength);
                Array.Copy(hash, 0, hashBytes, SaltLength, HashLength);

                return hashBytes;
            }

            /// <summary>
            /// Validate that a user-supplied password matches a previously hashed password.
            /// </summary>
            /// <param name="storedHash"> Stored password hash for a user. </param>
            /// <param name="password"> The password that a user supplied to be validated. </param>
            public static bool ValidatePassword(byte[] storedHash, string password)
            {
                // Get the salt from the first part of stored value.
                var salt = new byte[SaltLength];
                Array.Copy(storedHash, 0, salt, 0, SaltLength);

                // Compute the hash on the password the user entered.
                var computedHash = HashPassword(password, salt);

                // Check if the password given to us matches the hash we have stored (after the salt).
                for (var i = 0; i < computedHash.Length; i++)
                {
                    if (computedHash[i] != storedHash[i + SaltLength])
                    {
                        return false;
                    }
                }
                return true;
            }

            /// <summary> Hash a password and salt using PBKDF2. </summary>
            private static byte[] HashPassword(string password, byte[] salt)
            {
                // SHA256 is the recommended PBKDF2 hash algorithm.
                using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, HashIterations, HashAlgorithmName.SHA256);
                return pbkdf2.GetBytes(HashLength);
            }

            /// <summary> Create cryptographically-secure randomized salt. </summary>
            private static byte[] CreateSalt()
            {
                byte[] salt;
                using var crypto = new RNGCryptoServiceProvider();
                crypto.GetBytes(salt = new byte[SaltLength]);
                return salt;
            }
        }

        /// <summary> Confirms login credentials are valid. </summary>
        /// <returns> User when credentials are correct, null otherwise. </returns>
        public async Task<User?> Authenticate(string username, string password)
        {
            // Fetch the stored user.
            var userList = await _userDatabase.Users.FindAsync(x =>
                x.Username.ToLowerInvariant() == username.ToLowerInvariant());
            var foundUser = userList.FirstOrDefault();

            // Return null if user with specified username not found.
            if (foundUser is null)
            {
                return null;
            }

            // Extract the bytes from encoded password.
            var hashedPassword = Convert.FromBase64String(foundUser.Password);

            // If authentication is successful, generate jwt token.
            return PasswordHash.ValidatePassword(hashedPassword, password) ? await MakeJwt(foundUser) : null;
        }

        public async Task<User?> MakeJwt(User user)
        {
            const int tokenExpirationMinutes = 60 * 4;
            var tokenHandler = new JwtSecurityTokenHandler();
            var secretKey = Environment.GetEnvironmentVariable("COMBINE_JWT_SECRET_KEY")!;
            var key = Encoding.ASCII.GetBytes(secretKey);

            // Fetch the projects Id and the roles for each Id
            var projectPermissionMap = new List<ProjectPermissions>();

            foreach (var (projectRoleKey, projectRoleValue) in user.ProjectRoles)
            {
                // Convert each userRoleId to its respective role and add to the mapping
                var userRole = await _userRole.GetUserRole(projectRoleKey, projectRoleValue);
                if (userRole is null)
                {
                    return null;
                }

                var validEntry = new ProjectPermissions(projectRoleKey, userRole.Permissions);
                projectPermissionMap.Add(validEntry);
            }

            var claimString = projectPermissionMap.ToJson();
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim("UserId", user.Id),
                    new Claim("UserRoleInfo", claimString)
                }),

                Expires = DateTime.UtcNow.AddMinutes(tokenExpirationMinutes),

                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);

            // Sanitize user to remove password, avatar path, and old token
            // Then add updated token.
            Sanitize(user);
            user.Token = tokenHandler.WriteToken(token);

            if (await Update(user.Id, user) != ResultOfUpdate.Updated)
            {
                return null;
            }

            return user;
        }

        /// <summary> Finds all <see cref="User"/>s </summary>
        public async Task<List<User>> GetAllUsers()
        {
            var users = await _userDatabase.Users.Find(_ => true).ToListAsync();
            users.ForEach(Sanitize);
            return users;
        }

        /// <summary> Removes all <see cref="User"/>s </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> DeleteAllUsers()
        {
            var deleted = await _userDatabase.Users.DeleteManyAsync(_ => true);
            return deleted.DeletedCount != 0;
        }

        /// <summary> Finds <see cref="User"/> with specified userId </summary>
        /// <param name="userId"> User ID to retrieve. </param>
        /// <param name="sanitize"> Whether to sanitize (remove) sensitive information for the User instance. </param>
        public async Task<User?> GetUser(string userId, bool sanitize = true)
        {
            var filterDef = new FilterDefinitionBuilder<User>();
            var filter = filterDef.Eq(x => x.Id, userId);

            var userList = await _userDatabase.Users.FindAsync(filter);

            try
            {
                var user = await userList.FirstAsync();
                if (sanitize)
                {
                    Sanitize(user);
                }
                return user;
            }
            catch (InvalidOperationException)
            {
                return null;
            }
        }

        /// <summary> Finds <see cref="User"/> with specified userId and returns avatar filepath </summary>
        public async Task<string?> GetUserAvatar(string userId)
        {
            var user = await GetUser(userId, false);
            return string.IsNullOrEmpty(user?.Avatar) ? null : user.Avatar;
        }

        /// <summary> Finds <see cref="User"/> with specified userId and changes it's password </summary>
        public async Task<ResultOfUpdate> ChangePassword(string userId, string password)
        {
            var hash = PasswordHash.HashPassword(password);

            var filter = Builders<User>.Filter.Eq(x => x.Id, userId);
            var updateDef = Builders<User>.Update
                .Set(x => x.Password, Convert.ToBase64String(hash));

            var updateResult = await _userDatabase.Users.UpdateOneAsync(filter, updateDef);
            if (!updateResult.IsAcknowledged)
            {
                return ResultOfUpdate.NotFound;
            }

            if (updateResult.ModifiedCount > 0)
            {
                return ResultOfUpdate.Updated;
            }

            return ResultOfUpdate.NoChange;
        }

        /// <summary> Adds a <see cref="User"/> </summary>
        /// <returns> The <see cref="User"/> created, or null if the user could not be created. </returns>
        public async Task<User?> Create(User user)
        {
            // Confirm that email and username aren't empty and aren't taken
            if (string.IsNullOrEmpty(user.Email) || string.IsNullOrEmpty(user.Username) ||
                await GetUserIdByEmail(user.Email) != null ||
                await GetUserIdByUsername(user.Username) != null)
            {
                return null;
            }

            var hash = PasswordHash.HashPassword(user.Password);

            // Replace password with encoded, hashed password.
            user.Password = Convert.ToBase64String(hash);
            await _userDatabase.Users.InsertOneAsync(user);
            Sanitize(user);
            return user;
        }

        /// <summary> Removes <see cref="User"/> with specified userId </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> Delete(string userId)
        {
            var deleted = await _userDatabase.Users.DeleteOneAsync(x => x.Id == userId);
            return deleted.DeletedCount > 0;
        }

        /// <summary> Removes avatar path, password, and token from <see cref="User"/> </summary>
        private static void Sanitize(User user)
        {
            // .Avatar or .Token set to "" or null will not be updated in the database
            user.Avatar = "";
            user.Password = "";
            user.Token = "";
        }

        /// <summary> Gets userid for specified email </summary>
        /// <returns> A string with the userid, or null if not found </returns>
        public async Task<string?> GetUserIdByEmail(string email)
        {
            var user = (await GetAllUsers()).Find(x =>
                x.Email.ToLowerInvariant() == email.ToLowerInvariant());
            return user?.Id;
        }

        /// <summary> Gets userid for specified username </summary>
        /// <returns> A string with the userid, or null if not found </returns>
        public async Task<string?> GetUserIdByUsername(string username)
        {
            var user = (await GetAllUsers()).Find(x =>
                x.Username.ToLowerInvariant() == username.ToLowerInvariant());
            return user?.Id;
        }

        /// <summary> Updates <see cref="User"/> with specified userId </summary>
        /// <returns> A <see cref="ResultOfUpdate"/> enum: success of operation </returns>
        public async Task<ResultOfUpdate> Update(string userId, User user, bool updateIsAdmin = false)
        {
            // Confirm user exists.
            var oldUser = await GetUser(userId);
            if (oldUser is null)
            {
                return ResultOfUpdate.NotFound;
            }

            // Confirm that email and username aren't empty and aren't taken by another user.
            if (string.IsNullOrEmpty(user.Email) || string.IsNullOrEmpty(user.Username))
            {
                return ResultOfUpdate.Failed;
            }
            if (user.Email.ToLowerInvariant() != oldUser.Email.ToLowerInvariant()
                && await GetUserIdByEmail(user.Email) != null)
            {
                return ResultOfUpdate.Failed;
            }
            if (user.Username.ToLowerInvariant() != oldUser.Username.ToLowerInvariant()
                && await GetUserIdByUsername(user.Username) != null)
            {
                return ResultOfUpdate.Failed;
            }

            var filter = Builders<User>.Filter.Eq(x => x.Id, userId);

            // Note: Nulls out values not in update body
            var updateDef = Builders<User>.Update
                .Set(x => x.HasAvatar, user.HasAvatar)
                .Set(x => x.Name, user.Name)
                .Set(x => x.Email, user.Email)
                .Set(x => x.Phone, user.Phone)
                .Set(x => x.OtherConnectionField, user.OtherConnectionField)
                .Set(x => x.WorkedProjects, user.WorkedProjects)
                .Set(x => x.ProjectRoles, user.ProjectRoles)
                .Set(x => x.Agreement, user.Agreement)
                .Set(x => x.Username, user.Username)
                .Set(x => x.UILang, user.UILang);

            // If .Avatar or .Token has been set to null or "",
            // this prevents it from being erased in the database
            if (!string.IsNullOrEmpty(user.Avatar))
            {
                updateDef = updateDef.Set(x => x.Avatar, user.Avatar);
            }
            if (!string.IsNullOrEmpty(user.Token))
            {
                updateDef = updateDef.Set(x => x.Token, user.Token);
            }

            // Do not allow updating admin privileges unless explicitly allowed
            //     (e.g. admin creation CLI).
            // This prevents a user from modifying this field and privilege escalating.
            if (updateIsAdmin)
            {
                updateDef = updateDef.Set(x => x.IsAdmin, user.IsAdmin);
            }

            var updateResult = await _userDatabase.Users.UpdateOneAsync(filter, updateDef);
            if (!updateResult.IsAcknowledged)
            {
                return ResultOfUpdate.NotFound;
            }

            if (updateResult.ModifiedCount > 0)
            {
                return ResultOfUpdate.Updated;
            }

            return ResultOfUpdate.NoChange;
        }
    }

    public class ProjectPermissions
    {
        public ProjectPermissions(string projectId, List<int> permissions)
        {
            ProjectId = projectId;
            Permissions = permissions;
        }
        public string ProjectId { get; }
        public List<int> Permissions { get; }
    }
}
