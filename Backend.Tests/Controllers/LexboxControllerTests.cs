using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Backend.Tests.Mocks;
using BackendFramework.Controllers;
using BackendFramework.Models;
using BackendFramework.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using Moq.Protected;
using NUnit.Framework;

namespace Backend.Tests.Controllers
{
    internal sealed class LexboxControllerTests : IDisposable
    {
        private LexboxAuthService _lexboxAuthService = null!;
        private PermissionServiceMock _permissionService = null!;
        private ProjectRepositoryMock _projRepo = null!;
        private WordRepositoryMock _wordRepo = null!;
        private LexboxController _lexboxController = null!;
        /// <summary> What Lexbox returns for any request. </summary>
        private string _lexboxResponseJson = "[]";

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
            _lexboxResponseJson = "[]";
            var handler = new Mock<HttpMessageHandler>();
            handler.Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync", ItExpr.IsAny<HttpRequestMessage>(), ItExpr.IsAny<CancellationToken>())
                .ReturnsAsync(() => new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = new StringContent(_lexboxResponseJson)
                });
            var httpClientFactory = new Mock<IHttpClientFactory>();
            httpClientFactory.Setup(x => x.CreateClient(It.IsAny<string>()))
                .Returns(() => new HttpClient(handler.Object));
            var lexboxQueryService = new LexboxQueryService(httpClientFactory.Object);
            _permissionService = new PermissionServiceMock();
            _projRepo = new ProjectRepositoryMock();
            _wordRepo = new WordRepositoryMock();
            _lexboxController = new LexboxController(_lexboxAuthService, lexboxQueryService, _permissionService,
                _projRepo, new WordService(_wordRepo));
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

            var result = await _lexboxController.GenerateLogin(ticket);

            Assert.That(result, Is.InstanceOf<EmptyResult>());
            Assert.That(authService.ChallengeCallCount, Is.EqualTo(1));
            var properties = authService.LastChallengeProperties;
            Assert.That(properties, Is.Not.Null);
            Assert.That(properties.RedirectUri, Does.EndWith(LexboxAuthService.LoginCompletePath));

            // The ticket's Combine user ends up on the principal the Lexbox cookie will hold.
            var principal = new ClaimsPrincipal(new ClaimsIdentity());
            Assert.That(LexboxAuthService.AddCombineUserClaim(principal, properties), Is.True);
            Assert.That(principal.FindFirst(LexboxAuthService.CombineUserIdClaimType)?.Value,
                Is.EqualTo(OtherUserId));
        }

        [Test]
        public async Task TestGenerateLoginRejectsInvalidOrReusedTicket()
        {
            var authService = new AuthenticationServiceMock(AuthenticateResult.NoResult());
            _lexboxController.ControllerContext.HttpContext = GetAuthContext(authService);
            var ticket = _lexboxAuthService.CreateLoginTicket(UserId);

            Assert.That(await _lexboxController.GenerateLogin(null), Is.InstanceOf<ForbidResult>());
            Assert.That(await _lexboxController.GenerateLogin("not-a-ticket"), Is.InstanceOf<ForbidResult>());
            Assert.That(await _lexboxController.GenerateLogin(ticket), Is.InstanceOf<EmptyResult>());
            Assert.That(await _lexboxController.GenerateLogin(ticket), Is.InstanceOf<ForbidResult>());
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
        public async Task TestGetProjectsWithOtherCombineUsersCookieReturnsNotLoggedIn()
        {
            _lexboxController.ControllerContext.HttpContext = GetAuthContext(LexboxSessionResult(OtherUserId));

            var result = await _lexboxController.GetProjects() as ObjectResult;

            // Not a 401, which the frontend treats as a Combine logout.
            Assert.That(result?.StatusCode, Is.EqualTo(StatusCodes.Status403Forbidden));
            Assert.That((result.Value as ProblemDetails)?.Title, Is.EqualTo("Not logged in to Lexbox"));
        }

        private static LexboxImportRequest ImportRequest() => new() { ProjectCode = "lex-code", AnalysisLangs = ["en"] };

        private async Task<Project> CreateProject(Action<Project>? modify = null)
        {
            var project = new Project { Name = "Lexbox import", VernacularWritingSystem = new("es") };
            project.AnalysisWritingSystems.Add(new());
            modify?.Invoke(project);
            return await _projRepo.Create(project) ?? throw new AssertionException("Failed to create project");
        }

        [Test]
        public async Task TestImportEntriesUnauthorizedReturnsForbid()
        {
            _lexboxController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            var result = await _lexboxController.ImportEntries("projId", ImportRequest());

            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestImportEntriesWithoutLexboxSessionReturnsNotLoggedIn()
        {
            var project = await CreateProject();
            _lexboxController.ControllerContext.HttpContext = GetAuthContext(AuthenticateResult.NoResult());

            var result = await _lexboxController.ImportEntries(project.Id, ImportRequest()) as ObjectResult;

            Assert.That(result, Is.Not.Null);
            Assert.That(result.StatusCode, Is.EqualTo(StatusCodes.Status403Forbidden));
        }

        [Test]
        public async Task TestImportEntriesMissingProjectReturnsNotFound()
        {
            _lexboxController.ControllerContext.HttpContext = GetAuthContext(LexboxSessionResult());

            var result = await _lexboxController.ImportEntries("missing", ImportRequest());

            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [TestCase(true, null)]
        [TestCase(false, "other-code")]
        public async Task TestImportEntriesIntoImportedProjectReturnsBadRequest(bool liftImported, string? lexboxCode)
        {
            var project = await CreateProject(p =>
            {
                p.LiftImported = liftImported;
                p.LexboxProjectCode = lexboxCode;
            });
            _lexboxController.ControllerContext.HttpContext = GetAuthContext(LexboxSessionResult());

            var result = await _lexboxController.ImportEntries(project.Id, ImportRequest());

            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
            Assert.That(await _wordRepo.GetAllFrontier(project.Id), Is.Empty);
        }

        [Test]
        public async Task TestImportEntriesSavesWordsAndUpdatesProject()
        {
            var project = await CreateProject();
            _lexboxResponseJson = """
                [
                    {
                        "id": "00000000-0000-0000-0000-000000000001",
                        "lexemeForm": { "es": "hola" },
                        "senses": [{
                            "id": "00000000-0000-0000-0000-000000000002",
                            "definition": { "en": { "spans": [{ "text": "greeting" }] } },
                            "gloss": { "en": "hi" },
                            "partOfSpeech": { "id": "00000000-0000-0000-0000-000000000003", "name": { "en": "Noun" } }
                        }]
                    },
                    {
                        "id": "00000000-0000-0000-0000-000000000004",
                        "lexemeForm": { "fr": "salut" }
                    }
                ]
                """;
            _lexboxController.ControllerContext.HttpContext = GetAuthContext(LexboxSessionResult());
            var request = new LexboxImportRequest { ProjectCode = "lex-code", AnalysisLangs = ["en", "ru", "en"] };

            var result = await _lexboxController.ImportEntries(project.Id, request) as OkObjectResult;

            // The entry without an "es" form is skipped.
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Value, Is.EqualTo(1));
            var words = await _wordRepo.GetAllFrontier(project.Id);
            Assert.That(words, Has.Count.EqualTo(1));
            Assert.That(words[0].Vernacular, Is.EqualTo("hola"));
            Assert.That(words[0].Created, Is.Not.Empty);

            var updated = await _projRepo.GetProject(project.Id);
            Assert.That(updated, Is.Not.Null);
            Assert.That(updated.LexboxProjectCode, Is.EqualTo("lex-code"));
            Assert.That(updated.LiftImported, Is.False);
            Assert.That(updated.AnalysisWritingSystems.Select(ws => ws.Bcp47), Is.EqualTo(new List<string> { "en", "ru" }));
            Assert.That(updated.DefinitionsEnabled, Is.True);
            Assert.That(updated.GrammaticalInfoEnabled, Is.True);
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

        /// <summary> A Lexbox cookie with an access token, stamped with the given Combine user. </summary>
        private static AuthenticateResult LexboxSessionResult(string combineUserId = UserId)
        {
            var properties = new AuthenticationProperties();
            properties.StoreTokens([new AuthenticationToken { Name = "access_token", Value = "token" }]);
            var principal = LexboxAuthResult([new("sub", "lex-1")], combineUserId).Principal!;
            return AuthenticateResult.Success(new AuthenticationTicket(principal, properties, "LexboxCookie"));
        }

        private static HttpContext GetAuthContext(AuthenticateResult authenticateResult)
            => GetAuthContext(new AuthenticationServiceMock(authenticateResult));

        private static HttpContext GetAuthContext(IAuthenticationService authenticationService)
        {
            var context = PermissionServiceMock.HttpContextWithUserId(UserId);
            var services = new ServiceCollection();
            services.AddSingleton(authenticationService);
            services.AddMvcCore();
            context.RequestServices = services.BuildServiceProvider();
            return context;
        }
    }
}
