﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;

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
            var foundUser = _users.Single(user => user.Id == id);
            return Task.FromResult(foundUser.Clone());
        }

        public Task<string> GetUserAvatar(string id)
        {
            User foundUser = _users.Single(user => user.Id == id);
            return Task.FromResult(foundUser.Clone().Avatar);
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

        public Task<bool> Delete(string id)
        {
            var foundUser = _users.Single(user => user.Id == id);
            var success = _users.Remove(foundUser);
            return Task.FromResult(success);
        }

        public Task<ResultOfUpdate> Update(string id, User user)
        {
            var foundUser = _users.Single(u => u.Id == id);
            var success = _users.Remove(foundUser);
            if (success)
            {
                _users.Add(user.Clone());
                return Task.FromResult(ResultOfUpdate.Updated);
            }
            return Task.FromResult(ResultOfUpdate.NotFound);
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

                foundUser = MakeJwt(foundUser).Result;
                return Task.FromResult(foundUser);
            }
            catch (InvalidOperationException)
            {
                return null;
            }
        }

        public Task<User> MakeJwt(User user)
        {
            // The JWT Token below is generated here if you need to change its contents
            // https://jwt.io/#debugger-io?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOiIxMjM0MzQ1NiIsIlBlcm1pc3Npb25zIjp7IlByb2plY3RJZCI6IiIsIlBlcm1pc3Npb24iOlsiMSIsIjIiLCIzIiwiNCIsIjUiXX19.nK2zBCYYlvoIkkfq5XwArEUewiDRz0kpPwP9NaacDLk
            user.Token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOiIxMjM0MzQ1NiIsIlBlcm1pc3Npb25zIjp7IlByb2plY3RJZCI6IiIsIlBlcm1pc3Npb24iOlsiMSIsIjIiLCIzIiwiNCIsIjUiXX19.nK2zBCYYlvoIkkfq5XwArEUewiDRz0kpPwP9NaacDLk";
            Update(user.Id, user);
            user.Password = "";
            return Task.FromResult(user);
        }
    }
}
