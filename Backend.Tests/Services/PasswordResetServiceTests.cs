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
        private PasswordResetContextMock _passwordResetContext = null!;
        private IUserRepository _userRepo = null!;
        private IPasswordResetService _passwordResetService = null!;
        private const string Email = "user@domain.com";
        private const string Password = "PasswordResetServiceTestPassword";

        [SetUp]
        public void Setup()
        {
            _passwordResetContext = new PasswordResetContextMock();
            _userRepo = new UserRepositoryMock();
            _passwordResetService = new PasswordResetService(_passwordResetContext, _userRepo, new EmailServiceMock());
        }

        [Test]
        public void TestCreatePasswordReset()
        {
            // test we can successfully create a request
            var user = new User { Email = Email };
            _userRepo.Create(user);

            var res = ((PasswordResetService)_passwordResetService).CreatePasswordReset(Email).Result;
        }

        [Test]
        public void TestResetPasswordSuccess()
        {
            var user = new User { Email = Email };
            _userRepo.Create(user);

            var request = ((PasswordResetService)_passwordResetService).CreatePasswordReset(Email).Result;
            Assert.That(_passwordResetService.ResetPassword(request.Token, Password).Result, Is.True);
            Assert.That(_passwordResetContext.GetResets(), Is.Empty);
        }

        [Test]
        public void TestResetPasswordExpired()
        {
            var user = new User { Email = Email };
            _userRepo.Create(user);

            var request = ((PasswordResetService)_passwordResetService).CreatePasswordReset(Email).Result;
            request.Created = DateTime.Now.Subtract(_passwordResetContext.ExpireTime).AddMinutes(-1);

            Assert.That(_passwordResetService.ResetPassword(request.Token, Password).Result, Is.False);
        }

        [Test]
        public void TestResetPasswordBadToken()
        {
            var user = new User { Email = Email };
            _userRepo.Create(user);

            var request = ((PasswordResetService)_passwordResetService).CreatePasswordReset(Email).Result;
            Assert.That(request.Email == Email, Is.True);
            var task = _passwordResetService.ResetPassword("NotARealToken", Password);
            Assert.That(task.Result, Is.False);
        }

        [Test]
        public void TestResetPasswordRequest()
        {
            // Returns Ok regardless of if user exists.
            var noUserResult = _passwordResetService.ResetPasswordRequest("fake-username").Result;
            Assert.That(noUserResult, Is.True);

            var username = _userRepo.Create(new() { Username = "Imarealboy" }).Result!.Username;
            var yesUserResult = _passwordResetService.ResetPasswordRequest(username).Result;
            Assert.That(yesUserResult, Is.True);
        }
    }
}
