using System;
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

            _projId = (await _projRepo.Create(new Project { Name = "InviteControllerTests" }))!.Id;
        }

        [Test]
        public void TestEmailInviteToProject()
        {
            var data = new InviteController.EmailInviteData { ProjectId = _projId };
            var result = (ObjectResult)_inviteController.EmailInviteToProject(data).Result;
            Assert.That(result.Value, Is.Not.Empty);
        }

        [Test]
        public void TestEmailInviteToProjectUnauthorized()
        {
            var data = new InviteController.EmailInviteData();
            _inviteController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = _inviteController.EmailInviteToProject(data).Result;
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public void TestEmailInviteToProjectNoProject()
        {
            var data = new InviteController.EmailInviteData { ProjectId = MissingId };
            var result = _inviteController.EmailInviteToProject(data).Result;
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public void TestValidateTokenNoProject()
        {
            var result = _inviteController.ValidateToken(MissingId, "token").Result;
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }
    }
}
