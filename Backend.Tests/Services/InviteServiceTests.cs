using System.Linq;
using Backend.Tests.Mocks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Services;
using NUnit.Framework;

namespace Backend.Tests.Services
{
    internal sealed class InviteServiceTests
    {
        private IProjectRepository _projRepo = null!;
        private IUserRepository _userRepo = null!;
        private IUserRoleRepository _userRoleRepo = null!;
        private IEmailService _emailService = null!;
        private IPermissionService _permService = null!;
        private InviteService _inviteService = null!;
        private const string Email = "user@domain.com";


        private Project _proj = null!;
        private User _user = null!;

        [SetUp]
        public void Setup()
        {
            _projRepo = new ProjectRepositoryMock();
            _userRepo = new UserRepositoryMock();
            _userRoleRepo = new UserRoleRepositoryMock();
            _emailService = new EmailServiceMock();
            _permService = new PermissionServiceMock(_userRepo);
            _inviteService = new InviteService(_projRepo, _userRepo, _permService, _userRoleRepo, _emailService);

            _proj = _projRepo.Create(new Project { Name = "InviteServiceTests" }).Result!;
            _user = _userRepo.Create(new User()).Result!;
        }

        [Test]
        public void TestCreateLinkWithToken()
        {
            var url = _inviteService.CreateLinkWithToken(_proj, Role.Harvester, Email).Result;
            Assert.That(url, Does.Contain(Email));
            Assert.That(url, Does.Contain(_proj.Id));
            var token = _projRepo.GetProject(_proj.Id).Result!.InviteTokens.First().Token;
            Assert.That(url, Does.Contain(token));
        }

        [Test]
        public void TestRemoveTokenAndCreateUserRoleOwnerException()
        {
            var invite = new EmailInvite { Role = Role.Owner };
            Assert.That(
                () => _inviteService.RemoveTokenAndCreateUserRole(_proj, _user, invite),
                Throws.TypeOf<InviteService.InviteException>());
        }

        [Test]
        public void TestRemoveTokenAndCreateUserRoleAddsRole()
        {
            var result = _inviteService.RemoveTokenAndCreateUserRole(_proj, _user, new EmailInvite()).Result;
            Assert.That(result, Is.True);
            var userRoles = _userRoleRepo.GetAllUserRoles(_proj.Id).Result;
            Assert.That(userRoles, Has.Count.EqualTo(1));
            var userRole = userRoles.First();
            Assert.That(_userRepo.GetUser(_user.Id).Result!.ProjectRoles[_proj.Id], Is.EqualTo(userRole.Id));
        }

        [Test]
        public void TestRemoveTokenAndCreateUserRoleRemovesToken()
        {
            var invite = new EmailInvite(1);
            _proj.InviteTokens.Add(invite);
            _ = _projRepo.Update(_proj.Id, _proj).Result;
            _proj = _projRepo.GetProject(_proj.Id).Result!;
            Assert.That(_proj.InviteTokens, Has.Count.EqualTo(1));

            var result = _inviteService.RemoveTokenAndCreateUserRole(_proj, _user, invite).Result;
            Assert.That(result, Is.True);
            _proj = _projRepo.GetProject(_proj.Id).Result!;
            Assert.That(_proj.InviteTokens, Is.Empty);
        }
    }
}
