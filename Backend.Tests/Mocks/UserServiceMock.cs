using System;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;

namespace Backend.Tests.Mocks
{
    public class UserServiceMock : IUserService
    {
        private readonly IUserRepository _userRepo;

        public UserServiceMock(IUserRepository? userRepo = null)
        {
            _userRepo = userRepo ?? new UserRepositoryMock();
        }

        public Task<string?> GetUserIdByEmail(string email)
        {
            var user = _userRepo.GetUserByEmail(email).Result;
            return Task.FromResult(user?.Id);
        }

        public Task<string?> GetUserIdByUsername(string username)
        {
            var user = _userRepo.GetUserByUsername(username).Result;
            return Task.FromResult(user?.Id);
        }

        public Task<User?> Authenticate(string username, string password)
        {
            try
            {
                var user = _userRepo.GetUserByUsername(username).Result;
                if (user is null)
                {
                    return Task.FromResult<User?>(null);
                }

                user = MakeJwt(user).Result;
                return Task.FromResult(user);
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
            _userRepo.Update(user.Id, user);
            user.Password = "";
            return Task.FromResult<User?>(user);
        }
    }
}
