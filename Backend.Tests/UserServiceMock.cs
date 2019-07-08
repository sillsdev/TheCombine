using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Tests
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

        public Task<User> GetUser(string id)
        {
            var foundUser = _users.Where(user => user.Id == id).Single();
            return Task.FromResult(foundUser.Clone());
        }

        public Task<User> Create(User user)
        {
            user.Id = Guid.NewGuid().ToString();
            _users.Add(user.Clone());
            return Task.FromResult(user.Clone());
        }

        public Task<bool> DeleteAllUsers()
        {
            _users.Clear();
            return Task.FromResult(true);
        }

        public Task<bool> Delete(string Id)
        {
            var foundUser = _users.Single(user => user.Id == Id);
            var success = _users.Remove(foundUser);
            return Task.FromResult(success);
        }

        public Task<bool> Update(string Id, User user)
        {
            var foundUser = _users.Single(u => u.Id == Id);
            var success = _users.Remove(foundUser);
            if (success)
            {
                _users.Add(user.Clone());
            }
            return Task.FromResult(success);
        }

        public Task<User> Authenticate(string username, string password)
        {
            try
            {
                var foundUser = _users.Single(u => u.Username == username && u.Password == password);

                if (foundUser == null)
                {
                    return null;
                }

                foundUser.Token = "thisIsAToken";
                Update(foundUser.Id, foundUser);
                foundUser.Password = "";
                return Task.FromResult(foundUser);
            }
            catch (InvalidOperationException)
            {
                return null;
            }            
        }
    }
}
