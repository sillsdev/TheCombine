using System;
using Backend.Tests.Mocks;
using BackendFramework;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Services;
using Microsoft.Extensions.Options;
using NUnit.Framework;

namespace Backend.Tests.Services
{
    internal sealed class PasswordResetServiceTests
    {
        private PasswordResetRepositoryMock _passwordResetRepo = null!;
        private IUserRepository _userRepo = null!;
        private PasswordResetService _passwordResetService = null!;
        private const string Email = "user@domain.com";
        private const string Password = "PasswordResetServiceTestPassword";
        private readonly TimeSpan _expireTime = TimeSpan.FromMinutes(60);

        [SetUp]
        public void Setup()
        {
            var options = Options.Create(new Startup.Settings { ExpireTimePasswordReset = _expireTime });
            _passwordResetRepo = new PasswordResetRepositoryMock();
            _userRepo = new UserRepositoryMock();
            _passwordResetService = new PasswordResetService(
                options, _passwordResetRepo, _userRepo, new EmailServiceMock());
        }

        [Test]
        public void TestCreatePasswordReset()
        {
            _userRepo.Create(new User { Email = Email }).Wait();

            var request = _passwordResetService.CreatePasswordReset(Email).Result;
            Assert.That(_passwordResetRepo.GetResets(), Does.Contain(request).UsingPropertiesComparer());
        }

        [Test]
        public void TestResetPasswordSuccess()
        {
            _userRepo.Create(new User { Email = Email }).Wait();

            var request = _passwordResetService.CreatePasswordReset(Email).Result;
            Assert.That(_passwordResetService.ResetPassword(request.Token, Password).Result, Is.True);
            Assert.That(_passwordResetRepo.GetResets(), Is.Empty);
        }

        [Test]
        public void TestResetPasswordExpired()
        {
            _userRepo.Create(new User { Email = Email }).Wait();

            var request = _passwordResetService.CreatePasswordReset(Email).Result;
            request.Created = DateTime.UtcNow.Subtract(_expireTime).AddMinutes(-1);

            Assert.That(_passwordResetService.ResetPassword(request.Token, Password).Result, Is.False);
        }

        [Test]
        public void TestResetPasswordFuture()
        {
            _userRepo.Create(new User { Email = Email }).Wait();

            var request = _passwordResetService.CreatePasswordReset(Email).Result;
            request.Created = DateTime.UtcNow.AddDays(1);

            Assert.That(_passwordResetService.ResetPassword(request.Token, Password).Result, Is.False);
        }

        [Test]
        public void TestResetPasswordBadToken()
        {
            _userRepo.Create(new User { Email = Email }).Wait();

            var request = _passwordResetService.CreatePasswordReset(Email).Result;
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

            var user = _userRepo.Create(new() { Username = "Imarealboy" }).Result;
            Assert.That(user, Is.Not.Null);
            var yesUserResult = _passwordResetService.ResetPasswordRequest(user.Username).Result;
            Assert.That(yesUserResult, Is.True);
        }

        [Test]
        public void TestValidateTokenExpired()
        {
            var token = new EmailToken(Email)
            {
                Created = DateTime.UtcNow.Subtract(_expireTime).AddMinutes(-1)
            };
            _passwordResetRepo.Insert(token).Wait();
            Assert.That(_passwordResetService.ValidateToken(token.Token).Result, Is.False);
        }

        [Test]
        public void TestValidateTokenNone()
        {
            Assert.That(_passwordResetService.ValidateToken("NotARealToken").Result, Is.False);
        }

        [Test]
        public void TestValidateTokenValid()
        {
            var token = new EmailToken(Email);
            _passwordResetRepo.Insert(token).Wait();
            Assert.That(_passwordResetService.ValidateToken(token.Token).Result, Is.True);
        }
    }
}
