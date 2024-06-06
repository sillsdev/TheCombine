using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;

namespace Backend.Tests.Mocks
{
    sealed internal class UserRepositoryMock : IUserRepository
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
            var foundUser = _users.Single(user => user.Id == userId);
            var success = _users.Remove(foundUser);
            return Task.FromResult(success);
        }

        public Task<User?> GetUserByEmail(string email, bool sanitize = true)
        {
            var user = _users.Find(u => u.Email.ToLowerInvariant() == email.ToLowerInvariant());
            return Task.FromResult(user);
        }

        public Task<User?> GetUserByEmailOrUsername(string emailOrUsername, bool sanitize = true)
        {
            var user = _users.Find(u =>
                u.Email.ToLowerInvariant() == emailOrUsername.ToLowerInvariant() ||
                u.Username.ToLowerInvariant() == emailOrUsername.ToLowerInvariant());
            return Task.FromResult(user);
        }

        public Task<User?> GetUserByUsername(string username, bool sanitize = true)
        {
            var user = _users.Find(u => u.Username.ToLowerInvariant() == username.ToLowerInvariant());
            return Task.FromResult(user);
        }

        public Task<ResultOfUpdate> Update(string userId, User user, bool updateIsAdmin = false)
        {
            var foundUser = _users.Single(u => u.Id == userId);

            if (!updateIsAdmin)
            {
                user.IsAdmin = foundUser.IsAdmin;
            }

            var success = _users.Remove(foundUser);
            if (!success)
            {
                return Task.FromResult(ResultOfUpdate.NotFound);
            }

            _users.Add(user.Clone());
            return Task.FromResult(ResultOfUpdate.Updated);
        }

        public Task<ResultOfUpdate> ChangePassword(string userId, string password)
        {
            // TODO: more sophisticated mock
            return Task.FromResult(ResultOfUpdate.Updated);
        }
    }

    [Serializable]
    internal class UserCreationException : Exception
    {
        public UserCreationException() { }

        protected UserCreationException(SerializationInfo info, StreamingContext context) : base(info, context) { }
    }
}
