using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Security.Claims;
using System.Threading.Tasks;
using Backend.Tests.Mocks;
using BackendFramework.Controllers;
using BackendFramework.Models;
using BackendFramework.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using NUnit.Framework;

namespace Backend.Tests.Controllers
{
    internal sealed class LexboxControllerTests : IDisposable
    {
        private PermissionServiceMock _permissionService = null!;
        private LexboxController _lexboxController = null!;

        private const string UserId = "LexboxControllerTestsUserId";

        public void Dispose()
        {
            _lexboxController?.Dispose();
            GC.SuppressFinalize(this);
        }

        [SetUp]
        public void Setup()
        {
            var configValues = new Dictionary<string, string?> { { "LexboxAuth:PostLoginRedirect", "/" } };
            var configuration = new ConfigurationBuilder().AddInMemoryCollection(configValues).Build();
            var lexboxAuthService = new LexboxAuthService(configuration);
            var httpClient = new HttpClient(new Mock<HttpMessageHandler>().Object);
            var httpClientFactory = new Mock<IHttpClientFactory>();
            httpClientFactory.Setup(x => x.CreateClient(It.IsAny<string>())).Returns(httpClient);
            var lexboxQueryService = new LexboxQueryService(httpClientFactory.Object);
            _permissionService = new PermissionServiceMock();
            _lexboxController = new LexboxController(lexboxAuthService, lexboxQueryService, _permissionService);
        }

        [Test]
        public async Task TestGetAuthStatusUnauthorizedReturnsForbid()
        {
            _lexboxController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            var result = await _lexboxController.GetAuthStatus();

            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestGetAuthStatusReturnsLexboxUserWhenLoggedIn()
        {
            var claims = new List<Claim> { new("sub", "lex-1"), new("name", "Lex Name"), new("user", "Lex User") };
            var authResult = AuthenticateResult.Success(new AuthenticationTicket(
                new ClaimsPrincipal(new ClaimsIdentity(claims, "LexboxCookie")), "LexboxCookie"));
            _lexboxController.ControllerContext.HttpContext = GetAuthContext(authResult);

            var result = await _lexboxController.GetAuthStatus() as OkObjectResult;

            Assert.That(result, Is.Not.Null);
            var authStatus = result.Value as LexboxAuthStatus;
            Assert.That(authStatus, Is.Not.Null);
            Assert.That(authStatus.IsLoggedIn, Is.True);
            Assert.That(authStatus.LoggedInAs, Is.EqualTo("Lex User"));
            Assert.That(authStatus.UserId, Is.EqualTo("lex-1"));
        }

        [Test]
        public async Task TestGetAuthStatusReturnsLoggedOutWhenNotAuthenticatedByLexboxCookie()
        {
            _lexboxController.ControllerContext.HttpContext = GetAuthContext(AuthenticateResult.NoResult());

            var result = await _lexboxController.GetAuthStatus() as OkObjectResult;

            Assert.That(result, Is.Not.Null);
            var authStatus = result.Value as LexboxAuthStatus;
            Assert.That(authStatus, Is.Not.Null);
            Assert.That(authStatus.IsLoggedIn, Is.False);
            Assert.That(authStatus.LoggedInAs, Is.Null);
            Assert.That(authStatus.UserId, Is.Null);
        }

        [Test]
        public void TestGetAuthStatusThrowsWhenSubClaimMissing()
        {
            var claims = new List<Claim> { new("user", "Lex User") };
            var authResult = AuthenticateResult.Success(new AuthenticationTicket(
                new ClaimsPrincipal(new ClaimsIdentity(claims, "LexboxCookie")), "LexboxCookie"));
            _lexboxController.ControllerContext.HttpContext = GetAuthContext(authResult);

            Assert.ThrowsAsync<InvalidOperationException>(_lexboxController.GetAuthStatus);
        }

        [Test]
        public async Task TestGetAuthStatusFallsBackToUserIdWhenDisplayNameClaimsMissing()
        {
            var claims = new List<Claim> { new("sub", "lex-1") };
            var authResult = AuthenticateResult.Success(new AuthenticationTicket(
                new ClaimsPrincipal(new ClaimsIdentity(claims, "LexboxCookie")), "LexboxCookie"));
            _lexboxController.ControllerContext.HttpContext = GetAuthContext(authResult);

            var result = await _lexboxController.GetAuthStatus() as OkObjectResult;

            Assert.That(result, Is.Not.Null);
            var authStatus = result.Value as LexboxAuthStatus;
            Assert.That(authStatus, Is.Not.Null);
            Assert.That(authStatus.IsLoggedIn, Is.True);
            Assert.That(authStatus.LoggedInAs, Is.EqualTo("lex-1"));
            Assert.That(authStatus.UserId, Is.EqualTo("lex-1"));
        }

        [Test]
        public async Task TestGetAuthStatusUsesNameClaimWhenUserClaimMissing()
        {
            var claims = new List<Claim> { new("sub", "lex-1"), new("name", "Lex Name") };
            var authResult = AuthenticateResult.Success(new AuthenticationTicket(
                new ClaimsPrincipal(new ClaimsIdentity(claims, "LexboxCookie")), "LexboxCookie"));
            _lexboxController.ControllerContext.HttpContext = GetAuthContext(authResult);

            var result = await _lexboxController.GetAuthStatus() as OkObjectResult;

            Assert.That(result, Is.Not.Null);
            var authStatus = result.Value as LexboxAuthStatus;
            Assert.That(authStatus, Is.Not.Null);
            Assert.That(authStatus.IsLoggedIn, Is.True);
            Assert.That(authStatus.LoggedInAs, Is.EqualTo("Lex Name"));
            Assert.That(authStatus.UserId, Is.EqualTo("lex-1"));
        }

        [Test]
        public async Task TestGenerateLoginChallengesAndReturnsEmpty()
        {
            var authService = new AuthenticationServiceMock(AuthenticateResult.NoResult());
            _lexboxController.ControllerContext.HttpContext = GetAuthContext(authService);
            Assert.That(authService.ChallengeCallCount, Is.Zero);

            var result = await _lexboxController.GenerateLogin();

            Assert.That(result, Is.InstanceOf<EmptyResult>());
            Assert.That(authService.ChallengeCallCount, Is.EqualTo(1));
        }

        [Test]
        public async Task TestLogOutReturnsNoContent()
        {
            var claims = new List<Claim> { new("sub", "lex-1"), new("user", "Lex User") };
            var authResult = AuthenticateResult.Success(new AuthenticationTicket(
                new ClaimsPrincipal(new ClaimsIdentity(claims, "LexboxCookie")), "LexboxCookie"));
            _lexboxController.ControllerContext.HttpContext = GetAuthContext(authResult);

            var result = await _lexboxController.LogOut();

            Assert.That(result, Is.InstanceOf<NoContentResult>());
        }

        private static HttpContext GetAuthContext(AuthenticateResult authenticateResult)
            => GetAuthContext(new AuthenticationServiceMock(authenticateResult));

        private static HttpContext GetAuthContext(IAuthenticationService authenticationService)
        {
            var context = PermissionServiceMock.HttpContextWithUserId(UserId);
            var services = new ServiceCollection();
            services.AddSingleton(authenticationService);
            context.RequestServices = services.BuildServiceProvider();
            return context;
        }
    }
}
