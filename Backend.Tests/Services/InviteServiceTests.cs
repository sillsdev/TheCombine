using System.Linq;
using Backend.Tests.Mocks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Services;
using NUnit.Framework;

namespace Backend.Tests.Services
{
    public class InviteServiceTests
    {
        private IInviteContext _inviteContext = null!;
        private IUserRepository _userRepo = null!;
        private IUserRoleRepository _userRoleRepo = null!;
        private InviteService _inviteService = null!;
        private const string Email = "user@domain.com";
        private const string ProjId = "test-project-id";

        private User _user = null!;

        [SetUp]
        public void Setup()
        {
            _inviteContext = new InviteContextMock();
            _userRepo = new UserRepositoryMock();
            _userRoleRepo = new UserRoleRepositoryMock();
            _inviteService = new InviteService(_inviteContext, _userRepo, _userRoleRepo,
                new EmailServiceMock(), new PermissionServiceMock(_userRepo));

            _user = _userRepo.Create(new User()).Result!;
        }

        [Test]
        public void TestCreateLink()
        {
            var invite = new ProjectInvite(ProjId, Email, Role.Owner);
            var url = _inviteService.CreateLink(invite);
            Assert.That(url, Does.Contain(Email).And.Contain(ProjId).And.Contain(invite.Token));
        }

        [Test]
        public void TestCreateProjectInvite()
        {
            var invite = _inviteService.CreateProjectInvite(ProjId, Role.Editor, Email).Result;
            var result = _inviteContext.FindByToken(invite.Token).Result;
            Assert.That(result?.Email, Is.EqualTo(Email));
            Assert.That(result?.ProjectId, Is.EqualTo(ProjId));
            Assert.That(result?.Role, Is.EqualTo(Role.Editor));
        }

        [Test]
        public void TestRemoveTokenAndCreateUserRoleOwnerException()
        {
            var invite = new ProjectInvite(ProjId, Email, Role.Owner);
            Assert.That(
                () => _inviteService.RemoveTokenAndCreateUserRole(ProjId, _user, invite),
                Throws.TypeOf<InviteService.InviteException>());
        }

        [Test]
        public void TestRemoveTokenAndCreateUserRoleAddsRole()
        {
            var invite = new ProjectInvite(ProjId, Email, Role.Harvester);
            _inviteContext.Insert(invite).Wait();
            Assert.That(_inviteContext.FindByToken(invite.Token).Result, Is.Not.Null);

            var result = _inviteService.RemoveTokenAndCreateUserRole(ProjId, _user, invite).Result;
            Assert.That(result, Is.True);
            var userRoles = _userRoleRepo.GetAllUserRoles(ProjId).Result;
            Assert.That(userRoles, Has.Count.EqualTo(1));
            var userRole = userRoles.First();
            Assert.That(_userRepo.GetUser(_user.Id).Result!.ProjectRoles[ProjId], Is.EqualTo(userRole.Id));
        }

        [Test]
        public void TestRemoveTokenAndCreateUserRoleRemovesToken()
        {
            var invite = new ProjectInvite(ProjId, Email, Role.Harvester);
            _inviteContext.Insert(invite).Wait();
            Assert.That(_inviteContext.FindByToken(invite.Token).Result, Is.Not.Null);

            var result = _inviteService.RemoveTokenAndCreateUserRole(ProjId, _user, invite).Result;
            Assert.That(result, Is.True);
            Assert.That(_inviteContext.FindByToken(invite.Token).Result, Is.Null);
        }
    }
}
