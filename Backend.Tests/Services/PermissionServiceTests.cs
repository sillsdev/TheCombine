using System;
using System.Linq;
using System.Security.Claims;
using Backend.Tests.Mocks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Services;
using Microsoft.AspNetCore.Http;
using NUnit.Framework;

namespace Backend.Tests.Services
{
    public class PermissionServiceTests
    {
        private IUserRepository _userRepo = null!;
        private IUserRoleRepository _userRoleRepo = null!;
        private IPermissionService _permService = null!;
        private const string ProjId = "mock-proj-id";

        private HttpContext CreateHttpContextWithUser(User user)
        {
            var userId = _userRepo.Create(user).Result!.Id;
            var identity = new ClaimsIdentity([new Claim(PermissionService.UserIdClaimType, userId)], "TestAuthType");
            return new DefaultHttpContext { User = new ClaimsPrincipal(identity) };
        }

        [SetUp]
        public void Setup()
        {
            _userRepo = new UserRepositoryMock();
            _userRoleRepo = new UserRoleRepositoryMock();
            _permService = new PermissionService(_userRepo, _userRoleRepo);
        }

        [Test]
        public void MakeJwtTestReturnsUser()
        {
            const string longEnough = "0123456789abcdefghijklmnopqrstuvwxyz";
            Environment.SetEnvironmentVariable(PermissionService.JwtSecretKeyEnv, longEnough);
            var result = _permService.MakeJwt(_userRepo.Create(new()).Result!).Result;
            Assert.That(result, Is.InstanceOf<User>());
        }

        [Test]
        public void GetUserIdTestReturnsNonemptyId()
        {
            Assert.That(string.IsNullOrEmpty(_permService.GetUserId(CreateHttpContextWithUser(new User()))), Is.False);
        }

        [Test]
        public void IsUserAuthenticatedTestFalse()
        {
            Assert.That(_permService.IsUserAuthenticated(CreateHttpContextWithUser(new User()), "other-id"), Is.False);
        }

        [Test]
        public void IsUserAuthenticatedTestTrue()
        {
            var httpContext = CreateHttpContextWithUser(new User());
            var userId = _userRepo.GetAllUsers().Result.First().Id;
            Assert.That(_permService.IsUserAuthenticated(httpContext, userId), Is.True);
        }

        [Test]
        public void IsCurrentUserAuthenticatedTestTrue()
        {
            Assert.That(_permService.IsCurrentUserAuthenticated(CreateHttpContextWithUser(new User())), Is.True);
        }

        [Test]
        public void IsSiteAdminTestFalse()
        {
            Assert.That(_permService.IsSiteAdmin(CreateHttpContextWithUser(new User())).Result, Is.False);
        }

        [Test]
        public void IsSiteAdminTestTrue()
        {
            var httpContext = CreateHttpContextWithUser(new User { IsAdmin = true });
            Assert.That(_permService.IsSiteAdmin(httpContext).Result, Is.True);
        }

        [Test]
        public void HasProjectPermissionTestAdmin()
        {
            var httpContext = CreateHttpContextWithUser(new User { IsAdmin = true });
            Assert.That(_permService.HasProjectPermission(httpContext, Permission.Archive, ProjId).Result, Is.True);
        }

        [Test]
        public void HasProjectPermissionTestNoProjectRole()
        {
            var httpContext = CreateHttpContextWithUser(new User());
            Assert.That(_permService.HasProjectPermission(httpContext, Permission.WordEntry, ProjId).Result, Is.False);
        }

        [Test]
        public void HasProjectPermissionTestProjectPermFalse()
        {
            var user = new User();
            var httpContext = CreateHttpContextWithUser(user);
            var userRole = _userRoleRepo.Create(new UserRole { ProjectId = ProjId, Role = Role.Harvester }).Result;
            user.ProjectRoles[ProjId] = userRole.Id;
            _ = _userRepo.Update(user.Id, user).Result;
            Assert.That(_permService.HasProjectPermission(httpContext, Permission.Import, ProjId).Result, Is.False);
        }

        [Test]
        public void HasProjectPermissionTestProjectPermTrue()
        {
            var user = new User();
            var httpContext = CreateHttpContextWithUser(user);
            var userRole = _userRoleRepo.Create(new UserRole { ProjectId = ProjId, Role = Role.Owner }).Result;
            user.ProjectRoles[ProjId] = userRole.Id;
            _ = _userRepo.Update(user.Id, user).Result;
            Assert.That(_permService.HasProjectPermission(httpContext, Permission.Import, ProjId).Result, Is.True);
        }

        [Test]
        public void ContainsProjectRoleTestAdmin()
        {
            var httpContext = CreateHttpContextWithUser(new User { IsAdmin = true });
            Assert.That(_permService.ContainsProjectRole(httpContext, Role.Owner, ProjId).Result, Is.True);
        }

        [Test]
        public void ContainsProjectRoleTestNoProjectRole()
        {
            var httpContext = CreateHttpContextWithUser(new User());
            Assert.That(_permService.ContainsProjectRole(httpContext, Role.Harvester, ProjId).Result, Is.False);
        }

        [Test]
        public void ContainsProjectRoleTestProjectRoleFalse()
        {
            var user = new User();
            var httpContext = CreateHttpContextWithUser(user);
            var userRole = _userRoleRepo.Create(new UserRole { ProjectId = ProjId, Role = Role.Harvester }).Result;
            user.ProjectRoles[ProjId] = userRole.Id;
            _ = _userRepo.Update(user.Id, user).Result;
            Assert.That(_permService.ContainsProjectRole(httpContext, Role.Editor, ProjId).Result, Is.False);
        }

        [Test]
        public void ContainsProjectRoleTestProjectRoleTrue()
        {
            var user = new User();
            var httpContext = CreateHttpContextWithUser(user);
            var userRole = _userRoleRepo.Create(new UserRole { ProjectId = ProjId, Role = Role.Owner }).Result;
            user.ProjectRoles[ProjId] = userRole.Id;
            _ = _userRepo.Update(user.Id, user).Result;
            Assert.That(_permService.ContainsProjectRole(httpContext, Role.Harvester, ProjId).Result, Is.True);
        }
    }
}
