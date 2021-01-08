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
        private IUserService _userService = null!;
        private PasswordResetContextMock _passwordResets = null!;
        private IPasswordResetService _passwordResetService = null!;

        [SetUp]
        public void Setup()
        {
            _userService = new UserServiceMock();
            _passwordResets = new PasswordResetContextMock();
            _passwordResetService = new PasswordResetService(_passwordResets, _userService);
        }

        [Test]
        public void CreateRequest()
        {
            // test we can successfully create a request
            var user = new User { Email = "user@domain.com" };
            _userService.Create(user);

            var res = _passwordResetService.CreatePasswordReset("user@domain.com").Result;
            Assert.Contains(res, _passwordResets.GetResets());
        }

        [Test]
        public void ResetSuccess()
        {
            var user = new User { Email = "user@domain.com" };
            _userService.Create(user);

            var request = _passwordResetService.CreatePasswordReset("user@domain.com").Result;
            Assert.IsTrue(_passwordResetService.ResetPassword(request.Token, "newPassword").Result);
            Assert.IsEmpty(_passwordResets.GetResets());
        }

        [Test]
        public void ResetExpired()
        {
            var user = new User { Email = "user@domain.com" };
            _userService.Create(user);

            var request = _passwordResetService.CreatePasswordReset("user@domain.com").Result;
            request.ExpireTime = DateTime.Now.AddMinutes(-1);

            Assert.IsFalse(_passwordResetService.ResetPassword(request.Token, "newPassword").Result);
        }

        [Test]
        public void ResetBadToken()
        {
            const string email = "user@domain.com";
            var user = new User { Email = email };
            _userService.Create(user);

            var request = _passwordResetService.CreatePasswordReset("user@domain.com").Result;
            Assert.That(request.Email == email);
            var task = _passwordResetService.ResetPassword("NotARealToken", "newPassword");
            Assert.IsFalse(task.Result);
        }
    }
}
