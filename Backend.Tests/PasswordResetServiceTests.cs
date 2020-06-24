using BackendFramework.Models;
using BackendFramework.Interfaces;
using BackendFramework.Services;
using NUnit.Framework;
using System;

namespace Backend.Tests {
    public class PasswordResetServiceTests {
        private IUserService _userService;
        private PasswordResetContextMock _passwordResets;
        private IPasswordResetService _passwordResetService;

        [SetUp]
        public void Setup(){
            _userService = new UserServiceMock();
            _passwordResets = new PasswordResetContextMock();
            _passwordResetService = new PasswordResetService(_passwordResets, _userService);
        }

        [Test]
        public void CreateRequest(){
            // test we can successfully create a request
            var user = new User();
            user.Email = "user@domain.com";
            _userService.Create(user);

            var res = _passwordResetService.CreatePasswordReset("user@domain.com").Result;
            Assert.Contains(res, _passwordResets.GetResets());
        }

        [Test]
        public void ResetSuccess(){
            var user = new User();
            user.Email = "user@domain.com";
            _userService.Create(user);

            var request = _passwordResetService.CreatePasswordReset("user@domain.com").Result;
            Assert.IsTrue(_passwordResetService.ResetPassword("user@domain.com", request.Token, "newPassword").Result);
            Assert.IsEmpty(_passwordResets.GetResets());
        }

        [Test]
        public void ResetExpired(){
            var user = new User();
            user.Email = "user@domain.com";
            _userService.Create(user);

            var request = _passwordResetService.CreatePasswordReset("user@domain.com").Result;
            request.ExpireTime = DateTime.Now.AddMinutes(-1);

            Assert.IsFalse(_passwordResetService.ResetPassword("user@domain.com", request.Token, "newPassword").Result);
        }

        [Test]
        public void ResetBadToken(){
            return;
        }
    }
}
