using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Tests.Mocks;
using BackendFramework.Controllers;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using NUnit.Framework;

namespace Backend.Tests.Controllers
{
    internal sealed class AuthControllerTests : IDisposable
    {
        private LexboxAuthServiceMock _lexboxAuthService = null!;
        private PermissionServiceMock _permissionService = null!;
        private AuthController _controller = null!;

        public void Dispose()
        {
            _controller?.Dispose();
            GC.SuppressFinalize(this);
        }

        [SetUp]
        public void Setup()
        {
            _lexboxAuthService = new LexboxAuthServiceMock();
            _permissionService = new PermissionServiceMock();
            var configValues = new Dictionary<string, string?> { { "LexboxAuth:PostLoginRedirect", "/" } };
            var configuration = new ConfigurationBuilder().AddInMemoryCollection(configValues).Build();
            _controller = new AuthController(_lexboxAuthService, _permissionService, configuration);
        }

        [Test]
        public void GetAuthStatusUnauthorizedReturnsForbid()
        {
            _controller.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            var result = _controller.GetAuthStatus();

            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public void GetAuthStatusReturnsLexboxUserWhenLoggedIn()
        {
            var context = PermissionServiceMock.HttpContextWithUserId("user-1");
            context.Request.Headers["Cookie"] = "lexbox_session_id=session-1";
            _controller.ControllerContext.HttpContext = context;
            _lexboxAuthService.LoggedInUser = new LexboxAuthUser { UserId = "lex-1", DisplayName = "Lex User" };

            var result = _controller.GetAuthStatus();

            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var payload = ((OkObjectResult)result).Value as AuthStatus;
            Assert.That(payload, Is.Not.Null);
            Assert.That(payload!.LoggedIn, Is.True);
            Assert.That(payload.LoggedInAs, Is.EqualTo("Lex User"));
            Assert.That(payload.UserId, Is.EqualTo("lex-1"));
        }

        [Test]
        public void CompleteLexboxLoginRedirectsWhenReturnUrlPresent()
        {
            _controller.ControllerContext.HttpContext = PermissionServiceMock.HttpContextWithUserId("user-1");
            _lexboxAuthService.CompleteResult = new LexboxAuthResult
            {
                User = new LexboxAuthUser { UserId = "lex-1", DisplayName = "Lex User" },
                ReturnUrl = "/after-login",
            };

            var result = _controller.CompleteLexboxLogin("code", "state").Result;

            Assert.That(result, Is.InstanceOf<LocalRedirectResult>());
            Assert.That(((LocalRedirectResult)result).Url, Is.EqualTo("/after-login"));
        }

        private sealed class LexboxAuthServiceMock : ILexboxAuthService
        {
            public LexboxAuthUser? LoggedInUser { get; set; }
            public LexboxAuthResult? CompleteResult { get; set; }

            public LexboxLoginUrl CreateLoginUrl(HttpRequest request, string sessionId, string? returnUrl)
            {
                return new LexboxLoginUrl { Url = "not-a-valid-url" };
            }

            public Task<LexboxAuthResult?> CompleteLoginAsync(HttpRequest request, string code, string state)
            {
                return Task.FromResult(CompleteResult);
            }

            public LexboxAuthUser? GetLoggedInUser(string? sessionId)
            {
                return LoggedInUser;
            }
        }
    }
}
