using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;

namespace Backend.Tests.Mocks
{
    public class UserRepositoryMock : IUserRepository
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

        public Task<User?> GetUser(string id, bool sanitize = true)
        {
            try
            {
                var foundUser = _users.Single(user => user.Id == id);
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

        public Task<bool> Delete(string id)
        {
            var foundUser = _users.Single(user => user.Id == id);
            var success = _users.Remove(foundUser);
            return Task.FromResult(success);
        }

        public Task<User?> GetUserByEmail(string email)
        {
            var user = _users.Find(u => u.Email.ToLowerInvariant() == email.ToLowerInvariant());
            return Task.FromResult(user);
        }

        public Task<User?> GetUserByUsername(string username)
        {
            var user = _users.Find(u => u.Username.ToLowerInvariant() == username.ToLowerInvariant());
            return Task.FromResult(user);
        }

        public Task<ResultOfUpdate> Update(string id, User user, bool updateIsAdmin = false)
        {
            var foundUser = _users.Single(u => u.Id == id);

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
}
