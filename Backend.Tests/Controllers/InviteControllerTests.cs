using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Tests.Mocks;
using BackendFramework;
using BackendFramework.Controllers;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using NUnit.Framework;

namespace Backend.Tests.Controllers
{
    internal sealed class InviteControllerTests : IDisposable
    {
        private IProjectRepository _projRepo = null!;
        private IUserRepository _userRepo = null!;
        private InviteController _inviteController = null!;

        public void Dispose()
        {
            _inviteController?.Dispose();
            GC.SuppressFinalize(this);
        }

        private string _projId = null!;
        private string _tokenActive = null!;
        private string _tokenExpired = null!;
        private string _tokenFuture = null!;
        private const string EmailActive = "active@token.email"; // Test email for an invite with an active token.
        private const string EmailExpired = "expired@token.email"; // Test email for an invite with an expired token.
        private const string EmailFuture = "dr@who.email"; // Test email for an invite with a future token.
        private const string MissingId = "MISSING_ID";
        private const string ProjectName = "InviteControllerTests";

        [SetUp]
        public async Task Setup()
        {
            var inviteRepo = new InviteRepositoryMock();
            _projRepo = new ProjectRepositoryMock();
            _userRepo = new UserRepositoryMock();
            var permissionService = new PermissionServiceMock();
            var inviteService = new InviteService(Options.Create(new Startup.Settings()), inviteRepo, _userRepo,
                new UserRoleRepositoryMock(), new EmailServiceMock(), permissionService);
            _inviteController = new InviteController(_projRepo, inviteService, permissionService);

            var _userId = (await _userRepo.Create(new() { Name = "Signore Inviter", Username = "inviter" }))!.Id;
            _inviteController.ControllerContext.HttpContext = PermissionServiceMock.HttpContextWithUserId(_userId);

            _projId = (await _projRepo.Create(new Project { Name = ProjectName }))!.Id;
            var inviteActive =
                new ProjectInvite(_projId, EmailActive, Role.Harvester) { Created = DateTime.UtcNow };
            await inviteRepo.Insert(inviteActive);
            _tokenActive = inviteActive.Token;
            var inviteExpired =
                new ProjectInvite(_projId, EmailExpired, Role.Harvester) { Created = DateTime.UtcNow.AddYears(-1) };
            await inviteRepo.Insert(inviteExpired);
            _tokenExpired = inviteExpired.Token;
            var inviteFuture =
                new ProjectInvite(_projId, EmailFuture, Role.Harvester) { Created = DateTime.UtcNow.AddYears(1) };
            await inviteRepo.Insert(inviteFuture);
            _tokenFuture = inviteFuture.Token;
        }

        [Test]
        public void TestEmailInviteToProject()
        {
            var data = new EmailInviteData { ProjectId = _projId };
            var result = _inviteController.EmailInviteToProject(data).Result as OkObjectResult;
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Value, Is.Not.Empty);
        }

        [Test]
        public void TestEmailInviteToProjectUnauthorized()
        {
            _inviteController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = _inviteController.EmailInviteToProject(new EmailInviteData()).Result;
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public void TestEmailInviteToProjectNoProject()
        {
            var data = new EmailInviteData { ProjectId = MissingId };
            var result = _inviteController.EmailInviteToProject(data).Result;
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public void TestValidateInviteTokenNoTokenNoUser()
        {
            var result = _inviteController.ValidateInviteToken(_projId, "not-a-token").Result as OkObjectResult;
            Assert.That(result, Is.Not.Null);

            var status = result.Value as EmailInviteStatus;
            Assert.That(status, Is.Not.Null);
            Assert.That(status.IsTokenValid, Is.False);
            Assert.That(status.IsUserValid, Is.False);
        }

        [Test]
        public void TestValidateInviteTokenExpiredTokenNoUser()
        {
            var result = _inviteController.ValidateInviteToken(_projId, _tokenExpired).Result as OkObjectResult;
            Assert.That(result, Is.Not.Null);

            var status = result.Value as EmailInviteStatus;
            Assert.That(status, Is.Not.Null);
            Assert.That(status.IsTokenValid, Is.False);
            Assert.That(status.IsUserValid, Is.False);
        }

        [Test]
        public void TestValidateInviteTokenFutureTokenNoUser()
        {
            var result = _inviteController.ValidateInviteToken(_projId, _tokenFuture).Result as OkObjectResult;
            Assert.That(result, Is.Not.Null);

            var status = result.Value as EmailInviteStatus;
            Assert.That(status, Is.Not.Null);
            Assert.That(status.IsTokenValid, Is.False);
            Assert.That(status.IsUserValid, Is.False);
        }

        [Test]
        public void TestValidateInviteTokenValidTokenNoUser()
        {
            var result = _inviteController.ValidateInviteToken(_projId, _tokenActive).Result as OkObjectResult;
            Assert.That(result, Is.Not.Null);

            var status = result.Value as EmailInviteStatus;
            Assert.That(status, Is.Not.Null);
            Assert.That(status.IsTokenValid, Is.True);
            Assert.That(status.IsUserValid, Is.False);
        }

        [Test]
        public void TestValidateInviteTokenValidTokenUserAlreadyInProject()
        {
            var roles = new Dictionary<string, string> { [_projId] = "role-id" };
            _userRepo.Create(new() { Email = EmailActive, ProjectRoles = roles }).Wait();

            var result = _inviteController.ValidateInviteToken(_projId, _tokenActive).Result as OkObjectResult;
            Assert.That(result, Is.Not.Null);

            var status = result.Value as EmailInviteStatus;
            Assert.That(status, Is.Not.Null);
            Assert.That(status.IsTokenValid, Is.True);
            Assert.That(status.IsUserValid, Is.False);
        }

        [Test]
        public void TestValidateInviteTokenExpiredTokenUserAvailable()
        {
            _userRepo.Create(new() { Id = "other-user" }).Wait();
            // User with an email address matching an invite with an expired token.
            _userRepo.Create(new() { Id = "invitee", Email = EmailExpired }).Wait();

            var result = _inviteController.ValidateInviteToken(_projId, _tokenExpired).Result as OkObjectResult;
            Assert.That(result, Is.Not.Null);

            var status = result.Value as EmailInviteStatus;
            Assert.That(status, Is.Not.Null);
            Assert.That(status.IsTokenValid, Is.False);
            Assert.That(status.IsUserValid, Is.True);
        }

        [Test]
        public void TestValidateInviteTokenValidTokenUserAvailable()
        {
            // User with an email address matching an invite with an active token.
            _userRepo.Create(new() { Email = EmailActive }).Wait();

            // No permissions should be required to validate a token.
            _inviteController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            var result = _inviteController.ValidateInviteToken(_projId, _tokenActive).Result as OkObjectResult;
            Assert.That(result, Is.Not.Null);

            var status = result.Value as EmailInviteStatus;
            Assert.That(status, Is.Not.Null);
            Assert.That(status.IsTokenValid, Is.True);
            Assert.That(status.IsUserValid, Is.True);
        }
    }
}
