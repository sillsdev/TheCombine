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
        private const string EmailActive = "active@token.email"; // Test email for an invite with an active token.
        private const string EmailExpired = "expired@token.email"; // Test email for an invite with an expired token.
        private const string MissingId = "MISSING_ID";
        private const string ProjectName = "InviteControllerTests";

        [SetUp]
        public async Task Setup()
        {
            var inviteContext = new InviteContextMock();
            _projRepo = new ProjectRepositoryMock();
            _userRepo = new UserRepositoryMock();
            var permissionService = new PermissionServiceMock();
            var inviteService = new InviteService(inviteContext, _userRepo, new UserRoleRepositoryMock(),
                new EmailServiceMock(), permissionService);
            _inviteController = new InviteController(_projRepo, inviteService, permissionService);

            _projId = (await _projRepo.Create(new Project { Name = ProjectName }))!.Id;
            var inviteActive =
                new ProjectInvite(_projId, EmailActive, Role.Harvester) { Created = DateTime.Now };
            await inviteContext.Insert(inviteActive);
            _tokenActive = inviteActive.Token;
            var inviteExpired =
                new ProjectInvite(_projId, EmailExpired, Role.Harvester) { Created = DateTime.Now.AddYears(-1) };
            await inviteContext.Insert(inviteExpired);
            _tokenExpired = inviteExpired.Token;
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
