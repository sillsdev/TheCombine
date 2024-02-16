using System;
using System.Linq;
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
            var longEnoughString = "12345678901234567890123456789012";
            Environment.SetEnvironmentVariable("COMBINE_JWT_SECRET_KEY", longEnoughString);
            user = _userRepo.Create(user).Result!;
            user = _permService.MakeJwt(user).Result!;
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization"] = $"Bearer: {user.Token}";
            return httpContext;
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
            var user = _userRepo.Create(new User()).Result!;
            var result = _permService.MakeJwt(user).Result;
            Assert.That(result, Is.InstanceOf<User>());
        }

        [Test]
        public void GetUserIdTestReturnsNonemptyId()
        {
            Assert.That(String.IsNullOrEmpty(_permService.GetUserId(CreateHttpContextWithUser(new User()))), Is.False);
        }

        [Test]
        public void IsUserIdAuthorizedTestFalse()
        {
            Assert.That(_permService.IsUserIdAuthorized(CreateHttpContextWithUser(new User()), "other-id"), Is.False);
        }

        [Test]
        public void IsUserIdAuthorizedTestTrue()
        {
            var httpContext = CreateHttpContextWithUser(new User());
            var userId = _userRepo.GetAllUsers().Result.First().Id;
            Assert.That(_permService.IsUserIdAuthorized(httpContext, userId), Is.True);
        }

        [Test]
        public void IsCurrentUserAuthorizedTestTrue()
        {
            Assert.That(_permService.IsCurrentUserAuthorized(CreateHttpContextWithUser(new User())), Is.True);
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
            var userRole = _userRoleRepo.Create(new UserRole { ProjectId = ProjId, Role = Role.None }).Result;
            user.ProjectRoles[ProjId] = userRole.Id;
            _ = _userRepo.Update(user.Id, user).Result;
            Assert.That(_permService.HasProjectPermission(httpContext, Permission.WordEntry, ProjId).Result, Is.False);
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
            Assert.That(_permService.ContainsProjectRole(httpContext, Role.None, ProjId).Result, Is.False);
        }

        [Test]
        public void ContainsProjectRoleTestProjectRoleFalse()
        {
            var user = new User();
            var httpContext = CreateHttpContextWithUser(user);
            var userRole = _userRoleRepo.Create(new UserRole { ProjectId = ProjId, Role = Role.None }).Result;
            user.ProjectRoles[ProjId] = userRole.Id;
            _ = _userRepo.Update(user.Id, user).Result;
            Assert.That(_permService.ContainsProjectRole(httpContext, Role.Harvester, ProjId).Result, Is.False);
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
