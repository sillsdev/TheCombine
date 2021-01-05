using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;

namespace Backend.Tests.Mocks
{
    public class UserServiceMock : IUserService
    {
        private readonly List<User> _users;

        public UserServiceMock()
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

        public Task<string?> GetUserAvatar(string id)
        {
            var foundUser = _users.Single(user => user.Id == id);
            return Task.FromResult<string?>(foundUser.Clone().Avatar);
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

        public Task<string?> GetUserIdByEmail(string email)
        {
            var user = _users.Find(u => u.Email.ToLowerInvariant() == email.ToLowerInvariant());
            return Task.FromResult(user?.Id);
        }

        public Task<string?> GetUserIdByUsername(string username)
        {
            var user = _users.Find(u => u.Username.ToLowerInvariant() == username.ToLowerInvariant());
            return Task.FromResult(user?.Id);
        }

        public Task<ResultOfUpdate> Update(string id, User user, bool updateIsAdmin = false)
        {
            var foundUser = _users.Single(u => u.Id == id);

            if (!updateIsAdmin)
            {
                user.IsAdmin = foundUser.IsAdmin;
            }

            var success = _users.Remove(foundUser);
            if (success)
            {
                _users.Add(user.Clone());
                return Task.FromResult(ResultOfUpdate.Updated);
            }
            return Task.FromResult(ResultOfUpdate.NotFound);
        }

        public Task<User?> Authenticate(string username, string password)
        {
            try
            {
                var foundUser = _users.Single(
                    u => u.Username.ToLowerInvariant() == username.ToLowerInvariant() && u.Password == password);
                if (foundUser is null)
                {
                    return Task.FromResult<User?>(null);
                }

                foundUser = MakeJwt(foundUser).Result;
                return Task.FromResult(foundUser);
            }
            catch (InvalidOperationException)
            {
                return Task.FromResult<User?>(null);
            }
        }

        public Task<User?> MakeJwt(User user)
        {
            // The JWT Token below is generated here if you need to change its contents
            // https://jwt.io/#debugger-io?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOiIxMjM0MzQ1NiIsIlBlcm1pc3Npb25zIjp7IlByb2plY3RJZCI6IiIsIlBlcm1pc3Npb24iOlsiMSIsIjIiLCIzIiwiNCIsIjUiXX19.nK2zBCYYlvoIkkfq5XwArEUewiDRz0kpPwP9NaacDLk
            user.Token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOiIxMjM0MzQ1NiIsIlBlcm1pc3Npb25zIjp7IlByb2plY3RJZCI6IiIsIlBlcm1pc3Npb24iOlsiMSIsIjIiLCIzIiwiNCIsIjUiXX19.nK2zBCYYlvoIkkfq5XwArEUewiDRz0kpPwP9NaacDLk";
            Update(user.Id, user);
            user.Password = "";
            return Task.FromResult<User?>(user);
        }

        public Task<ResultOfUpdate> ChangePassword(string userId, string password)
        {
            // TODO: more sophisticated mock
            return Task.FromResult(ResultOfUpdate.Updated);
        }
    }
}
