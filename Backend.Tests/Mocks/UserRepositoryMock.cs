using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;

namespace Backend.Tests.Mocks
{
    internal sealed class UserRepositoryMock : IUserRepository
    {
        private readonly List<User> _users;

        public UserRepositoryMock()
        {
            _users = new List<User>();
        }

        public Task<List<User>> GetAllUsers()
        {
            return Task.FromResult(_users.Select(user => user.Clone()).ToList());
        }

        public Task<User?> GetUser(string userId, bool sanitize = true)
        {
            try
            {
                var foundUser = _users.Single(user => user.Id == userId);
                return Task.FromResult<User?>(foundUser.Clone());
            }
            catch (InvalidOperationException)
            {
                return Task.FromResult<User?>(null);
            }
        }

        public Task<User?> Create(User user)
        {
            user.Id = Guid.NewGuid().ToString();
            _users.Add(user.Clone());
            return Task.FromResult<User?>(user.Clone());
        }

        public Task<bool> DeleteAllUsers()
        {
            _users.Clear();
            return Task.FromResult(true);
        }

        public Task<bool> Delete(string userId)
        {
            var rmCount = _users.RemoveAll(user => user.Id == userId);
            return Task.FromResult(rmCount > 0);
        }

        public Task<User?> GetUserByEmail(string email, bool sanitize = true)
        {
            var user = _users.Find(u => u.Email.Equals(email, StringComparison.OrdinalIgnoreCase));
            return Task.FromResult(user);
        }

        public Task<User?> GetUserByEmailOrUsername(string emailOrUsername, bool sanitize = true)
        {
            var user = _users.Find(u =>
                u.Email.Equals(emailOrUsername, StringComparison.OrdinalIgnoreCase) ||
                u.Username.Equals(emailOrUsername, StringComparison.OrdinalIgnoreCase));
            return Task.FromResult(user);
        }

        public Task<User?> GetUserByUsername(string username, bool sanitize = true)
        {
            var user = _users.Find(u => u.Username.Equals(username, StringComparison.OrdinalIgnoreCase));
            return Task.FromResult(user);
        }

        public Task<ResultOfUpdate> Update(string userId, User user, bool updateIsAdmin = false)
        {
            var foundUser = _users.SingleOrDefault(u => u.Id == userId);
            if (foundUser is null)
            {
                return Task.FromResult(ResultOfUpdate.NotFound);
            }

            if (!updateIsAdmin)
            {
                user.IsAdmin = foundUser.IsAdmin;
            }

            _users.RemoveAll(u => u.Id == userId);
            _users.Add(user.Clone());
            return Task.FromResult(ResultOfUpdate.Updated);
        }

        public Task<ResultOfUpdate> ChangePassword(string userId, string password)
        {
            // TODO: more sophisticated mock
            return Task.FromResult(ResultOfUpdate.Updated);
        }
    }

    internal sealed class UserCreationException : Exception;
}
