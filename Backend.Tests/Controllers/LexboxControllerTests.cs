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
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using NUnit.Framework;

namespace Backend.Tests.Controllers
{
    internal sealed class LexboxControllerTests : IDisposable
    {
        private LexboxAuthService _lexboxAuthService = null!;
        private PermissionServiceMock _permissionService = null!;
        private LexboxController _lexboxController = null!;

        private const string UserId = "LexboxControllerTestsUserId";
        private const string OtherUserId = "LexboxControllerTestsOtherUserId";

        public void Dispose()
        {
            _lexboxController?.Dispose();
            GC.SuppressFinalize(this);
        }

        [SetUp]
        public void Setup()
        {
            _lexboxAuthService = new LexboxAuthService(new MemoryCache(new MemoryCacheOptions()));
            var httpClient = new HttpClient(new Mock<HttpMessageHandler>().Object);
            var httpClientFactory = new Mock<IHttpClientFactory>();
            httpClientFactory.Setup(x => x.CreateClient(It.IsAny<string>())).Returns(httpClient);
            var lexboxQueryService = new LexboxQueryService(httpClientFactory.Object);
            _permissionService = new PermissionServiceMock();
            _lexboxController = new LexboxController(_lexboxAuthService, lexboxQueryService, _permissionService);
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
            var authResult = LexboxAuthResult(claims);
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
        public async Task TestGetAuthStatusThrowsWhenSubClaimMissing()
        {
            var claims = new List<Claim> { new("user", "Lex User") };
            var authResult = LexboxAuthResult(claims);
            _lexboxController.ControllerContext.HttpContext = GetAuthContext(authResult);

            await Assert.ThrowsAsync<InvalidOperationException>(_lexboxController.GetAuthStatus);
        }

        [Test]
        public async Task TestGetAuthStatusFallsBackToUserIdWhenDisplayNameClaimsMissing()
        {
            var claims = new List<Claim> { new("sub", "lex-1") };
            var authResult = LexboxAuthResult(claims);
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
            var authResult = LexboxAuthResult(claims);
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
        public async Task TestGetAuthStatusReturnsLoggedOutAndClearsCookieOfOtherCombineUser()
        {
            var claims = new List<Claim> { new("sub", "lex-1"), new("user", "Lex User") };
            var authService = new AuthenticationServiceMock(LexboxAuthResult(claims, OtherUserId));
            _lexboxController.ControllerContext.HttpContext = GetAuthContext(authService);
            _lexboxController.ControllerContext.HttpContext.Request.Headers.Cookie = "lexbox_auth=value";

            var result = await _lexboxController.GetAuthStatus() as OkObjectResult;

            Assert.That(result, Is.Not.Null);
            var authStatus = result.Value as LexboxAuthStatus;
            Assert.That(authStatus, Is.Not.Null);
            Assert.That(authStatus.IsLoggedIn, Is.False);
            Assert.That(authService.SignOutCallCount, Is.EqualTo(1));
        }

        [Test]
        public void TestCreateLoginTicketUnauthorizedReturnsForbid()
        {
            _lexboxController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            var result = _lexboxController.CreateLoginTicket();

            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public void TestCreateLoginTicketReturnsTicketForCurrentUser()
        {
            _lexboxController.ControllerContext.HttpContext = GetAuthContext(AuthenticateResult.NoResult());

            var result = _lexboxController.CreateLoginTicket() as OkObjectResult;

            Assert.That(result, Is.Not.Null);
            Assert.That(result.Value, Is.InstanceOf<string>());
            Assert.That(_lexboxAuthService.RedeemLoginTicket(result.Value as string), Is.EqualTo(UserId));
        }

        [Test]
        public async Task TestGenerateLoginChallengesForTicketUser()
        {
            var authService = new AuthenticationServiceMock(AuthenticateResult.NoResult());
            _lexboxController.ControllerContext.HttpContext = GetAuthContext(authService);
            var ticket = _lexboxAuthService.CreateLoginTicket(OtherUserId);

            var result = await _lexboxController.GenerateLogin(ticket, false);

            Assert.That(result, Is.InstanceOf<EmptyResult>());
            Assert.That(authService.ChallengeCallCount, Is.EqualTo(1));
            var properties = authService.LastChallengeProperties as OpenIdConnectChallengeProperties;
            Assert.That(properties, Is.Not.Null);
            Assert.That(properties.RedirectUri, Does.EndWith(LexboxAuthService.LoginCompletePath));
            Assert.That(properties.Prompt, Is.Null);

            // The ticket's Combine user ends up on the principal the Lexbox cookie will hold.
            var principal = new ClaimsPrincipal(new ClaimsIdentity());
            Assert.That(LexboxAuthService.AddCombineUserClaim(principal, properties), Is.True);
            Assert.That(principal.FindFirst(LexboxAuthService.CombineUserIdClaimType)?.Value,
                Is.EqualTo(OtherUserId));
        }

        [Test]
        public async Task TestGenerateLoginSwitchAccountPromptsLogin()
        {
            var authService = new AuthenticationServiceMock(AuthenticateResult.NoResult());
            _lexboxController.ControllerContext.HttpContext = GetAuthContext(authService);
            var ticket = _lexboxAuthService.CreateLoginTicket(UserId);

            await _lexboxController.GenerateLogin(ticket, true);

            var properties = authService.LastChallengeProperties as OpenIdConnectChallengeProperties;
            Assert.That(properties?.Prompt, Is.EqualTo("login"));
        }

        [Test]
        public async Task TestGenerateLoginRejectsInvalidOrReusedTicket()
        {
            var authService = new AuthenticationServiceMock(AuthenticateResult.NoResult());
            _lexboxController.ControllerContext.HttpContext = GetAuthContext(authService);
            var ticket = _lexboxAuthService.CreateLoginTicket(UserId);

            Assert.That(await _lexboxController.GenerateLogin(null, false), Is.InstanceOf<ForbidResult>());
            Assert.That(await _lexboxController.GenerateLogin("not-a-ticket", false), Is.InstanceOf<ForbidResult>());
            Assert.That(await _lexboxController.GenerateLogin(ticket, false), Is.InstanceOf<EmptyResult>());
            Assert.That(await _lexboxController.GenerateLogin(ticket, false), Is.InstanceOf<ForbidResult>());
            Assert.That(authService.ChallengeCallCount, Is.EqualTo(1));
        }

        [Test]
        public void TestAddCombineUserClaimFailsWithoutCombineUser()
        {
            var principal = new ClaimsPrincipal(new ClaimsIdentity());

            Assert.That(LexboxAuthService.AddCombineUserClaim(principal, new()), Is.False);
            Assert.That(principal.FindFirst(LexboxAuthService.CombineUserIdClaimType), Is.Null);
        }

        [Test]
        public async Task TestGetProjectsUnauthorizedReturnsForbid()
        {
            _lexboxController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            var result = await _lexboxController.GetProjects();

            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestGetProjectsWithOtherCombineUsersCookieReturnsUnauthorized()
        {
            var claims = new List<Claim> { new("sub", "lex-1") };
            var properties = new AuthenticationProperties();
            properties.StoreTokens([new AuthenticationToken { Name = "access_token", Value = "token" }]);
            var ticket = new AuthenticationTicket(
                LexboxAuthResult(claims, OtherUserId).Principal!, properties, "LexboxCookie");
            _lexboxController.ControllerContext.HttpContext = GetAuthContext(AuthenticateResult.Success(ticket));

            var result = await _lexboxController.GetProjects();

            Assert.That(result, Is.InstanceOf<UnauthorizedResult>());
        }

        [Test]
        public async Task TestGetEntriesUnauthorizedReturnsForbid()
        {
            _lexboxController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            var result = await _lexboxController.GetEntries("proj-code", "en", null);

            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestLogOutReturnsNoContent()
        {
            var claims = new List<Claim> { new("sub", "lex-1"), new("user", "Lex User") };
            var authResult = LexboxAuthResult(claims);
            _lexboxController.ControllerContext.HttpContext = GetAuthContext(authResult);

            var result = await _lexboxController.LogOut();

            Assert.That(result, Is.InstanceOf<NoContentResult>());
        }

        /// <summary> A successful Lexbox cookie authentication, stamped with the given Combine user. </summary>
        private static AuthenticateResult LexboxAuthResult(List<Claim> claims, string combineUserId = UserId)
        {
            claims = [.. claims, new(LexboxAuthService.CombineUserIdClaimType, combineUserId)];
            return AuthenticateResult.Success(new AuthenticationTicket(
                new ClaimsPrincipal(new ClaimsIdentity(claims, "LexboxCookie")), "LexboxCookie"));
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
