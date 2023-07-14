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
            Assert.IsInstanceOf<User>(result);
        }

        [Test]
        public void GetUserIdTestReturnsNonemptyId()
        {
            Assert.False(String.IsNullOrEmpty(_permService.GetUserId(createHttpContextWithUser(new User()))));
        }

        [Test]
        public void IsUserIdAuthorizedTestFalse()
        {
            Assert.False(_permService.IsUserIdAuthorized(createHttpContextWithUser(new User()), "other-id"));
        }

        [Test]
        public void IsUserIdAuthorizedTestTrue()
        {
            var httpContext = createHttpContextWithUser(new User());
            var userId = _userRepo.GetAllUsers().Result.First().Id;
            Assert.True(_permService.IsUserIdAuthorized(httpContext, userId));
        }

        [Test]
        public void IsCurrentUserAuthorizedTestTrue()
        {
            Assert.True(_permService.IsCurrentUserAuthorized(createHttpContextWithUser(new User())));
        }

        [Test]
        public void IsSiteAdminTestFalse()
        {
            Assert.False(_permService.IsSiteAdmin(createHttpContextWithUser(new User())).Result);
        }

        [Test]
        public void IsSiteAdminTestTrue()
        {
            var httpContext = createHttpContextWithUser(new User { IsAdmin = true });
            Assert.True(_permService.IsSiteAdmin(httpContext).Result);
        }

        [Test]
        public void HasProjectPermissionTestAdmin()
        {
            var httpContext = createHttpContextWithUser(new User { IsAdmin = true });
            Assert.True(_permService.HasProjectPermission(httpContext, Permission.Archive).Result);
        }

        [Test]
        public void ContainsProjectRoleTestAdmin()
        {
            var httpContext = createHttpContextWithUser(new User { IsAdmin = true });
            Assert.True(_permService.ContainsProjectRole(httpContext, Role.Owner, "project-id").Result);
        }
    }
}
