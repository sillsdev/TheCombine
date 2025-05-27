using System;
using System.Collections.Generic;
using Backend.Tests.Mocks;
using BackendFramework.Controllers;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;

namespace Backend.Tests.Controllers
{
    public class UserControllerTests : IDisposable
    {
        private IUserRepository _userRepo = null!;
        private IPermissionService _permissionService = null!;
        private UserController _userController = null!;

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (disposing)
            {
                _userController?.Dispose();
            }
        }

        [SetUp]
        public void Setup()
        {
            _userRepo = new UserRepositoryMock();
            _permissionService = new PermissionServiceMock(_userRepo);
            _userController = new UserController(_userRepo, _permissionService,
                new CaptchaServiceMock(), new EmailServiceMock(), new PasswordResetServiceMock());
        }

        private static User RandomUser()
        {
            var user = new User
            {
                Username = Util.RandString(10),
                Password = Util.RandString(10),
                Email = $"{Util.RandString(5)}@{Util.RandString(5)}.com",
            };
            return user;
        }

        [Test]
        public void TestGetAllUsers()
        {
            _userRepo.Create(RandomUser());
            _userRepo.Create(RandomUser());
            _userRepo.Create(RandomUser());

            var users = ((ObjectResult)_userController.GetAllUsers().Result).Value as List<User>;
            Assert.That(users, Has.Count.EqualTo(3));
            _userRepo.GetAllUsers().Result.ForEach(
                user => Assert.That(users, Does.Contain(user).UsingPropertiesComparer()));
        }

        [Test]
        public void TestGetUser()
        {
            var user = _userRepo.Create(RandomUser()).Result ?? throw new UserCreationException();

            _userRepo.Create(RandomUser());
            _userRepo.Create(RandomUser());

            var result = _userController.GetUser(user.Id).Result;
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            Assert.That(((ObjectResult)result).Value, Is.EqualTo(user).UsingPropertiesComparer());
        }

        [Test]
        public void TestGetMissingUser()
        {
            var result = _userController.GetUser("INVALID_USER_ID").Result;
            Assert.That(result, Is.InstanceOf<NotFoundResult>());
        }

        [Test]
        public void TestGetUserByEmailOrUsernameWithEmail()
        {
            const string email = "example@gmail.com";
            var user = _userRepo.Create(
                new User { Email = email, Username = Util.RandString(10), Password = Util.RandString(10) }
            ).Result ?? throw new UserCreationException();

            var result = _userController.GetUserByEmailOrUsername(email).Result;
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            Assert.That(((ObjectResult)result).Value, Is.EqualTo(user).UsingPropertiesComparer());
        }

        [Test]
        public void TestGetUserByEmailOrUsernameWithUsername()
        {
            const string username = "example-name";
            var user = _userRepo.Create(
                new User { Username = username, Password = Util.RandString(10) }
            ).Result ?? throw new UserCreationException();

            var result = _userController.GetUserByEmailOrUsername(username).Result;
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            Assert.That(((ObjectResult)result).Value, Is.EqualTo(user).UsingPropertiesComparer());
        }

        [Test]
        public void TestGetUserByEmailOrUsernameMissing()
        {
            var result = _userController.GetUserByEmailOrUsername("INVALID_EMAIL@gmail.com").Result;
            Assert.That(result, Is.InstanceOf<NotFoundResult>());
        }

        [Test]
        public void TestGetUserByEmailOrUsernameNoPermission()
        {
            _userController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            const string email = "example@gmail.com";
            var _ = _userRepo.Create(
                new User { Email = email, Username = Util.RandString(10), Password = Util.RandString(10) }
            ).Result ?? throw new UserCreationException();

            var result = _userController.GetUserByEmailOrUsername(email).Result;
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public void TestCreateUser()
        {
            var user = RandomUser();
            var id = (string)((ObjectResult)_userController.CreateUser(user).Result).Value!;
            user.Id = id;
            Assert.That(_userRepo.GetAllUsers().Result, Does.Contain(user).UsingPropertiesComparer());
        }

        [Test]
        public void TestCreateUserBadUsername()
        {
            var user = RandomUser();
            _userRepo.Create(user);
            var user2 = RandomUser();
            user2.Username = " ";
            var result = _userController.CreateUser(user).Result;
            Assert.That(result, Is.TypeOf<BadRequestObjectResult>());
            user2.Username = user.Username;
            result = _userController.CreateUser(user).Result;
            Assert.That(result, Is.TypeOf<BadRequestObjectResult>());
            user2.Username = user.Email;
            result = _userController.CreateUser(user).Result;
            Assert.That(result, Is.TypeOf<BadRequestObjectResult>());
        }

        [Test]
        public void TestCreateUserBadEmail()
        {
            var user = RandomUser();
            _userRepo.Create(user);
            var user2 = RandomUser();
            user2.Email = " ";
            var result = _userController.CreateUser(user).Result;
            Assert.That(result, Is.TypeOf<BadRequestObjectResult>());
            user2.Email = user.Email;
            result = _userController.CreateUser(user).Result;
            Assert.That(result, Is.TypeOf<BadRequestObjectResult>());
        }

        [Test]
        public void TestUpdateUser()
        {
            var origUser = _userRepo.Create(RandomUser()).Result ?? throw new UserCreationException();
            var modUser = origUser.Clone();
            modUser.Username = "Mark";

            _ = _userController.UpdateUser(modUser.Id, modUser);

            var users = _userRepo.GetAllUsers().Result;
            Assert.That(users, Has.Count.EqualTo(1));
            Assert.That(users, Does.Contain(modUser).UsingPropertiesComparer());
        }

        [Test]
        public void TestUpdateUserCantUpdateIsAdmin()
        {
            var origUser = _userRepo.Create(RandomUser()).Result ?? throw new UserCreationException();
            var modUser = origUser.Clone() ?? throw new UserCreationException();
            modUser.IsAdmin = true;

            _ = _userController.UpdateUser(modUser.Id, modUser);

            var users = _userRepo.GetAllUsers().Result;
            Assert.That(users, Has.Count.EqualTo(1));
            Assert.That(users, Does.Contain(modUser).UsingPropertiesComparer());
        }

        [Test]
        public void TestDeleteUser()
        {
            var origUser = _userRepo.Create(RandomUser()).Result ?? throw new UserCreationException();
            Assert.That(_userRepo.GetAllUsers().Result, Has.Count.EqualTo(1));

            _ = _userController.DeleteUser(origUser.Id).Result;
            Assert.That(_userRepo.GetAllUsers().Result, Is.Empty);
        }

        [Test]
        public void TestIsEmailOrUsernameAvailable()
        {
            var user1 = RandomUser();
            var user2 = RandomUser();
            var email1 = user1.Email;
            var email2 = user2.Email;
            _userRepo.Create(user1);
            _userRepo.Create(user2);

            var result1 = (ObjectResult)_userController.IsEmailOrUsernameAvailable(email1.ToLowerInvariant()).Result;
            Assert.That(result1.Value, Is.False);

            var result2 = (ObjectResult)_userController.IsEmailOrUsernameAvailable(email2.ToUpperInvariant()).Result;
            Assert.That(result2.Value, Is.False);

            var result3 = (ObjectResult)_userController.IsEmailOrUsernameAvailable(email1).Result;
            Assert.That(result3.Value, Is.False);

            var result4 = (ObjectResult)_userController.IsEmailOrUsernameAvailable("new@e.mail").Result;
            Assert.That(result4.Value, Is.True);

            var result5 = (ObjectResult)_userController.IsEmailOrUsernameAvailable("").Result;
            Assert.That(result5.Value, Is.False);
        }

        [Test]
        public void TestIsUserSiteAdminNotAuthorized()
        {
            _userController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = _userController.IsUserSiteAdmin().Result;
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            Assert.That(((ObjectResult)result).Value, Is.False);
        }
    }
}
