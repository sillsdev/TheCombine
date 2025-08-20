using System;
using Backend.Tests.Mocks;
using BackendFramework;
using BackendFramework.Models;
using BackendFramework.Services;
using Microsoft.Extensions.Options;
using NUnit.Framework;

namespace Backend.Tests.Services
{
    internal sealed class EmailVerifyServiceTests
    {
        private EmailVerifyRepositoryMock _emailVerifyRepo = null!;
        private EmailVerifyService _emailVerifyService = null!;
        private const string Email = "user@domain.com";
        private readonly TimeSpan _expireTime = TimeSpan.FromMinutes(60);

        [SetUp]
        public void Setup()
        {
            var options = Options.Create(new Startup.Settings { ExpireTimeEmailVerify = _expireTime });
            _emailVerifyRepo = new EmailVerifyRepositoryMock();
            var userRepo = new UserRepositoryMock();
            userRepo.Create(new() { Email = Email }).Wait();
            _emailVerifyService = new EmailVerifyService(
                options, _emailVerifyRepo, userRepo, new EmailServiceMock());
        }

        [Test]
        public void TestRequestEmailVerify()
        {
            var email = "any@e.mail";
            var result = _emailVerifyService.RequestEmailVerify(new() { Email = email }).Result;
            Assert.That(result, Is.True);

            var tokens = _emailVerifyRepo.GetEmailTokens();
            Assert.That(tokens, Is.Not.Empty);
            Assert.That(tokens[0].Email, Is.EqualTo(email));
        }

        [Test]
        public void TestValidateTokenValid()
        {
            var token = new EmailToken(Email);
            _emailVerifyRepo.Insert(token).Wait();

            var result = _emailVerifyService.ValidateToken(token.Token).Result;
            Assert.That(result, Is.True);
            Assert.That(_emailVerifyRepo.GetEmailTokens(), Is.Empty);
        }

        [Test]
        public void TestValidateTokenExpired()
        {
            var token = new EmailToken(Email)
            {
                Created = DateTime.UtcNow.Subtract(_expireTime).AddMinutes(-1)
            };
            _emailVerifyRepo.Insert(token).Wait();

            var result = _emailVerifyService.ValidateToken(token.Token).Result;
            Assert.That(result, Is.False);
        }

        [Test]
        public void TestValidateTokenFuture()
        {
            var token = new EmailToken(Email)
            {
                Created = DateTime.UtcNow.AddDays(1)
            };
            _emailVerifyRepo.Insert(token).Wait();

            var result = _emailVerifyService.ValidateToken(token.Token).Result;
            Assert.That(result, Is.False);
        }

        [Test]
        public void TestValidateTokenNone()
        {
            var result = _emailVerifyService.ValidateToken("NotARealToken").Result;
            Assert.That(result, Is.False);
        }
    }
}
