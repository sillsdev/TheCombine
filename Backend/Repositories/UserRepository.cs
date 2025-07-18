using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Repositories
{
    /// <summary> Atomic database functions for <see cref="User"/>s. </summary>
    [ExcludeFromCodeCoverage]
    public class UserRepository : IUserRepository
    {
        private readonly IUserContext _userDatabase;

        public UserRepository(IUserContext collectionSettings)
        {
            _userDatabase = collectionSettings;
        }

        /// <summary> Finds all <see cref="User"/>s </summary>
        public async Task<List<User>> GetAllUsers()
        {
            var users = await _userDatabase.Users.Find(_ => true).ToListAsync();
            users.ForEach(u => u.Sanitize());
            return users;
        }

        /// <summary> Finds all <see cref="User"/>s matching a given filter </summary>
        public async Task<List<User>> GetAllUsersByFilter(string filter)
        {
            return (await GetAllUsers()).Where(u =>
                u.Email.Contains(filter, StringComparison.OrdinalIgnoreCase) ||
                u.Name.Contains(filter, StringComparison.OrdinalIgnoreCase) ||
                u.Username.Contains(filter, StringComparison.OrdinalIgnoreCase)).ToList();
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
        /// <param name="sanitize"> Whether to sanitize (remove) sensitive information from the User instance. </param>
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
                    user.Sanitize();
                }
                return user;
            }
            catch (InvalidOperationException)
            {
                return null;
            }
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
                await GetUserByEmailOrUsername(user.Email) is not null ||
                await GetUserByEmailOrUsername(user.Username) is not null)
            {
                return null;
            }

            var hash = PasswordHash.HashPassword(user.Password);

            // Replace password with encoded, hashed password.
            user.Password = Convert.ToBase64String(hash);
            await _userDatabase.Users.InsertOneAsync(user);
            user.Sanitize();
            return user;
        }

        /// <summary> Removes <see cref="User"/> with specified userId </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> Delete(string userId)
        {
            var deleted = await _userDatabase.Users.DeleteOneAsync(x => x.Id == userId);
            return deleted.DeletedCount > 0;
        }

        /// <summary> Gets userid for specified email </summary>
        /// <returns> A string with the userid, or null if not found </returns>
        public async Task<User?> GetUserByEmail(string email, bool sanitize = true)
        {
            var user = (await _userDatabase.Users.FindAsync(
                x => x.Email.Equals(email, StringComparison.OrdinalIgnoreCase))).FirstOrDefault();
            if (sanitize && user is not null)
            {
                user.Sanitize();
            }
            return user;
        }

        /// <summary> Gets userid for specified email/username </summary>
        /// <returns> A string with the userid, or null if not found </returns>
        public async Task<User?> GetUserByEmailOrUsername(string emailOrUsername, bool sanitize = true)
        {
            var user = (await _userDatabase.Users.FindAsync(u =>
                u.Username.Equals(emailOrUsername, StringComparison.OrdinalIgnoreCase) ||
                u.Email.Equals(emailOrUsername, StringComparison.OrdinalIgnoreCase))).FirstOrDefault();
            if (sanitize && user is not null)
            {
                user.Sanitize();
            }
            return user;
        }

        /// <summary> Gets userid for specified username </summary>
        /// <returns> A string with the userid, or null if not found </returns>
        public async Task<User?> GetUserByUsername(string username, bool sanitize = true)
        {
            var user = (await _userDatabase.Users.FindAsync(
                x => x.Username.Equals(username, StringComparison.OrdinalIgnoreCase))).FirstOrDefault();
            if (sanitize && user is not null)
            {
                user.Sanitize();
            }
            return user;
        }

        /// <summary> Updates <see cref="User"/> with specified userId </summary>
        /// <returns> A <see cref="ResultOfUpdate"/> enum: success of operation </returns>
        public async Task<ResultOfUpdate> Update(string userId, User user, bool updateIsAdmin = false)
        {
            // Confirm user exists.
            var oldUser = await GetUser(userId, false);
            if (oldUser is null)
            {
                return ResultOfUpdate.NotFound;
            }

            // Confirm that email and username aren't empty.
            if (string.IsNullOrEmpty(user.Email) || string.IsNullOrEmpty(user.Username))
            {
                return ResultOfUpdate.Failed;
            }

            // Confirm that email and username aren't taken by another user.
            // Allow for user updating their username to match their own email or vice-versa.
            if (!user.Email.Equals(oldUser.Email, StringComparison.OrdinalIgnoreCase))
            {
                var otherUser = await GetUserByEmailOrUsername(user.Email);
                if (otherUser is not null && !otherUser.Id.Equals(userId, StringComparison.Ordinal))
                {
                    return ResultOfUpdate.Failed;
                }
            }
            if (!user.Username.Equals(oldUser.Username, StringComparison.OrdinalIgnoreCase))
            {
                var otherUser = await GetUserByEmailOrUsername(user.Username);
                if (otherUser is not null && !otherUser.Id.Equals(userId, StringComparison.Ordinal))
                {
                    return ResultOfUpdate.Failed;
                }
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
                .Set(x => x.AnalyticsOn, user.AnalyticsOn)
                .Set(x => x.AnsweredConsent, user.AnsweredConsent)
                .Set(x => x.UILang, user.UILang)
                .Set(x => x.GlossSuggestion, user.GlossSuggestion);

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
}
