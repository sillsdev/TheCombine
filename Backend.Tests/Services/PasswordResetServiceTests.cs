using System;
using Backend.Tests.Mocks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Services;
using NUnit.Framework;

namespace Backend.Tests.Services
{
    public class PasswordResetServiceTests
    {
        private PasswordResetContextMock _passwordResets = null!;
        private IUserRepository _userRepo = null!;
        private IPasswordResetService _passwordResetService = null!;
        private const string Email = "user@domain.com";
        private const string Password = "PasswordResetServiceTestPassword";

        [SetUp]
        public void Setup()
        {
            _userRepo = new UserRepositoryMock();
            _passwordResets = new PasswordResetContextMock();
            _passwordResetService = new PasswordResetService(_passwordResets, _userRepo);
        }

        [Test]
        public void CreateRequest()
        {
            // test we can successfully create a request
            var user = new User { Email = Email };
            _userRepo.Create(user);

            var res = _passwordResetService.CreatePasswordReset(Email).Result;
            Assert.Contains(res, _passwordResets.GetResets());
        }

        [Test]
        public void ResetSuccess()
        {
            var user = new User { Email = Email };
            _userRepo.Create(user);

            var request = _passwordResetService.CreatePasswordReset(Email).Result;
            Assert.IsTrue(_passwordResetService.ResetPassword(request.Token, Password).Result);
            Assert.IsEmpty(_passwordResets.GetResets());
        }

        [Test]
        public void ResetExpired()
        {
            var user = new User { Email = Email };
            _userRepo.Create(user);

            var request = _passwordResetService.CreatePasswordReset(Email).Result;
            request.ExpireTime = DateTime.Now.AddMinutes(-1);

            Assert.IsFalse(_passwordResetService.ResetPassword(request.Token, Password).Result);
        }

        [Test]
        public void ResetBadToken()
        {
            var user = new User { Email = Email };
            _userRepo.Create(user);

            var request = _passwordResetService.CreatePasswordReset(Email).Result;
            Assert.That(request.Email == Email);
            var task = _passwordResetService.ResetPassword("NotARealToken", Password);
            Assert.IsFalse(task.Result);
        }
    }
}
