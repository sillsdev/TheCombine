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

            var emailToken = _passwordResetService.CreateEmailToken(Email).Result;
            Assert.That(_passwordResets.GetResets(), Does.Contain(emailToken).UsingPropertiesComparer());
        }

        [Test]
        public void ResetSuccess()
        {
            var user = new User { Email = Email };
            _userRepo.Create(user);

            var emailToken = _passwordResetService.CreateEmailToken(Email).Result;
            Assert.That(_passwordResetService.ResetPassword(emailToken.Token, Password).Result, Is.True);
            Assert.That(_passwordResets.GetResets(), Is.Empty);
        }

        [Test]
        public void ResetExpired()
        {
            var user = new User { Email = Email };
            _userRepo.Create(user);

            var emailToken = _passwordResetService.CreateEmailToken(Email).Result;
            emailToken.ExpireTime = DateTime.Now.AddMinutes(-1);

            Assert.That(_passwordResetService.ResetPassword(emailToken.Token, Password).Result, Is.False);
        }

        [Test]
        public void ResetBadToken()
        {
            var user = new User { Email = Email };
            _userRepo.Create(user);

            var emailToken = _passwordResetService.CreateEmailToken(Email).Result;
            Assert.That(emailToken.Email == Email, Is.True);
            var task = _passwordResetService.ResetPassword("NotARealToken", Password);
            Assert.That(task.Result, Is.False);
        }
    }
}
