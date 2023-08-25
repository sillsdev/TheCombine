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
        private const string UserId = "mock-user-id";

        private HttpContext createHttpContextWithUser(User user)
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
            Assert.That(String.IsNullOrEmpty(_permService.GetUserId(createHttpContextWithUser(new User()))), Is.False);
        }

        [Test]
        public void IsUserIdAuthorizedTestFalse()
        {
            Assert.That(_permService.IsUserIdAuthorized(createHttpContextWithUser(new User()), "other-id"), Is.False);
        }

        [Test]
        public void IsUserIdAuthorizedTestTrue()
        {
            var httpContext = createHttpContextWithUser(new User());
            var userId = _userRepo.GetAllUsers().Result.First().Id;
            Assert.That(_permService.IsUserIdAuthorized(httpContext, userId), Is.True);
        }

        [Test]
        public void IsCurrentUserAuthorizedTestTrue()
        {
            Assert.That(_permService.IsCurrentUserAuthorized(createHttpContextWithUser(new User())), Is.True);
        }

        [Test]
        public void IsSiteAdminTestFalse()
        {
            Assert.That(_permService.IsSiteAdmin(createHttpContextWithUser(new User())).Result, Is.False);
        }

        [Test]
        public void IsSiteAdminTestTrue()
        {
            var httpContext = createHttpContextWithUser(new User { IsAdmin = true });
            Assert.That(_permService.IsSiteAdmin(httpContext).Result, Is.True);
        }

        [Test]
        public void HasProjectPermissionTestAdmin()
        {
            var httpContext = createHttpContextWithUser(new User { IsAdmin = true });
            Assert.That(_permService.HasProjectPermission(httpContext, Permission.Archive).Result, Is.True);
        }

        [Test]
        public void ContainsProjectRoleTestAdmin()
        {
            var httpContext = createHttpContextWithUser(new User { IsAdmin = true });
            Assert.That(_permService.ContainsProjectRole(httpContext, Role.Owner, "project-id").Result, Is.True);
        }
    }
}
