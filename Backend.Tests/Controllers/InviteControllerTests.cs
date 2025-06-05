using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Tests.Mocks;
using BackendFramework.Controllers;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Services;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;

namespace Backend.Tests.Controllers
{
    public class InviteControllerTests : IDisposable
    {
        private IProjectRepository _projRepo = null!;
        private IUserRepository _userRepo = null!;
        private IInviteService _inviteService = null!;
        private IPermissionService _permissionService = null!;
        private InviteController _inviteController = null!;

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (disposing)
            {
                _inviteController?.Dispose();
            }
        }

        private string _projId = null!;
        private string _tokenActive = null!;
        private string _tokenExpired = null!;
        // Test email for an invite that has an active token.
        private const string EmailActive = "active@token.email";
        // Test email for an invite that has an expired token.
        private const string EmailExpired = "expired@token.email";
        private const string MissingId = "MISSING_ID";

        [SetUp]
        public async Task Setup()
        {
            _projRepo = new ProjectRepositoryMock();
            _userRepo = new UserRepositoryMock();
            _permissionService = new PermissionServiceMock();
            _inviteService = new InviteService(
                _projRepo, _userRepo, _permissionService, new UserRoleRepositoryMock(), new EmailServiceMock());
            _inviteController = new InviteController(_inviteService, _projRepo, _userRepo, _permissionService);

            var tokenPast = new EmailInvite(-1) { Email = EmailExpired };
            _tokenExpired = tokenPast.Token;
            var tokenFuture = new EmailInvite(1) { Email = EmailActive };
            _tokenActive = tokenFuture.Token;
            _projId = (await _projRepo.Create(new Project
            {
                Name = "InviteControllerTests",
                InviteTokens = [tokenPast, tokenFuture]
            }))!.Id;
        }

        [Test]
        public void TestEmailInviteToProject()
        {
            var data = new EmailInviteData { ProjectId = _projId };
            var result = (ObjectResult)_inviteController.EmailInviteToProject(data).Result;
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
        public void TestValidateTokenNoProject()
        {
            var result = _inviteController.ValidateToken(MissingId, _tokenActive).Result;
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public void TestValidateTokenNoTokenNoUser()
        {
            var result = _inviteController.ValidateToken(_projId, "not-a-token").Result;
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var value = ((OkObjectResult)result).Value;
            Assert.That(value, Is.InstanceOf<EmailInviteStatus>());

            var status = (EmailInviteStatus)value!;
            Assert.That(status.IsTokenValid, Is.False);
            Assert.That(status.IsUserValid, Is.False);
        }

        [Test]
        public void TestValidateTokenExpiredTokenNoUser()
        {
            var result = _inviteController.ValidateToken(_projId, _tokenExpired).Result;
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var value = ((OkObjectResult)result).Value;
            Assert.That(value, Is.InstanceOf<EmailInviteStatus>());

            var status = (EmailInviteStatus)value!;
            Assert.That(status.IsTokenValid, Is.False);
            Assert.That(status.IsUserValid, Is.False);
        }

        [Test]
        public void TestValidateTokenValidTokenNoUser()
        {
            var result = _inviteController.ValidateToken(_projId, _tokenActive).Result;
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var value = ((OkObjectResult)result).Value;
            Assert.That(value, Is.InstanceOf<EmailInviteStatus>());

            var status = (EmailInviteStatus)value!;
            Assert.That(status.IsTokenValid, Is.True);
            Assert.That(status.IsUserValid, Is.False);
        }

        [Test]
        public void TestValidateTokenValidTokenUserAlreadyInProject()
        {
            var roles = new Dictionary<string, string> { [_projId] = "role-id" };
            _userRepo.Create(new() { Email = EmailActive, ProjectRoles = roles });

            var result = _inviteController.ValidateToken(_projId, _tokenActive).Result;
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var value = ((OkObjectResult)result).Value;
            Assert.That(value, Is.InstanceOf<EmailInviteStatus>());

            var status = (EmailInviteStatus)value!;
            Assert.That(status.IsTokenValid, Is.True);
            Assert.That(status.IsUserValid, Is.False);
        }

        [Test]
        public void TestValidateTokenExpiredTokenUserAvailable()
        {
            _userRepo.Create(new() { Id = "other-user" });
            // User with an email address matching an invite with an expired token.
            _userRepo.Create(new() { Id = "invitee", Email = EmailExpired });

            var result = _inviteController.ValidateToken(_projId, _tokenExpired).Result;
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var value = ((OkObjectResult)result).Value;
            Assert.That(value, Is.InstanceOf<EmailInviteStatus>());

            var status = (EmailInviteStatus)value!;
            Assert.That(status.IsTokenValid, Is.False);
            Assert.That(status.IsUserValid, Is.True);
        }

        [Test]
        public void TestValidateTokenValidTokenUserAvailable()
        {
            // User with an email address matching an invite with an active token.
            _userRepo.Create(new() { Email = EmailActive });

            // No permissions should be required to validate a token.
            _inviteController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            var result = _inviteController.ValidateToken(_projId, _tokenActive).Result;
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var value = ((OkObjectResult)result).Value;
            Assert.That(value, Is.InstanceOf<EmailInviteStatus>());

            var status = (EmailInviteStatus)value!;
            Assert.That(status.IsTokenValid, Is.True);
            Assert.That(status.IsUserValid, Is.True);
        }
    }
}
