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
                new EmailServiceMock(), new PasswordResetServiceMock());
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
            _userRepo.GetAllUsers().Result.ForEach(user => Assert.That(users, Does.Contain(user)));
        }

        [Test]
        public void TestGetUser()
        {
            var user = _userRepo.Create(RandomUser()).Result ?? throw new UserCreationException();

            _userRepo.Create(RandomUser());
            _userRepo.Create(RandomUser());

            var action = _userController.GetUser(user.Id).Result;
            Assert.That(action, Is.InstanceOf<ObjectResult>());

            var foundUser = (User)((ObjectResult)action).Value!;
            Assert.That(foundUser, Is.EqualTo(user));
        }

        [Test]
        public void TestGetMissingUser()
        {
            var action = _userController.GetUser("INVALID_USER_ID").Result;
            Assert.That(action, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public void TestGetUserByEmail()
        {
            const string email = "example@gmail.com";
            var user = _userRepo.Create(
                new User { Email = email, Username = Util.RandString(10), Password = Util.RandString(10) }
            ).Result ?? throw new UserCreationException();

            var action = _userController.GetUserByEmail(email).Result;
            Assert.That(action, Is.InstanceOf<ObjectResult>());

            var foundUser = (User)((ObjectResult)action).Value!;
            Assert.That(foundUser, Is.EqualTo(user));
        }

        [Test]
        public void TestGetMissingEmail()
        {
            var action = _userController.GetUserByEmail("INVALID_EMAIL@gmail.com").Result;
            Assert.That(action, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public void TestGetUserByEmailNoPermission()
        {
            _userController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            const string email = "example@gmail.com";
            var _ = _userRepo.Create(
                new User { Email = email, Username = Util.RandString(10), Password = Util.RandString(10) }
            ).Result ?? throw new UserCreationException();

            var action = _userController.GetUserByEmail(email).Result;
            Assert.That(action, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public void TestCreateUser()
        {
            var user = RandomUser();
            var id = (string)((ObjectResult)_userController.CreateUser(user).Result).Value!;
            user.Id = id;
            Assert.That(_userRepo.GetAllUsers().Result, Does.Contain(user));
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
            Assert.That(users, Does.Contain(modUser));
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
            Assert.That(users, Does.Contain(modUser));
        }

        [Test]
        public void TestDeleteUser()
        {
            var origUser = _userRepo.Create(RandomUser()).Result ?? throw new UserCreationException();
            Assert.That(_userRepo.GetAllUsers().Result, Has.Count.EqualTo(1));

            _ = _userController.DeleteUser(origUser.Id).Result;
            Assert.That(_userRepo.GetAllUsers().Result, Has.Count.EqualTo(0));
        }

        [Test]
        public void TestIsUsernameUnavailable()
        {
            var user1 = RandomUser();
            var user2 = RandomUser();
            var username1 = user1.Username;
            var username2 = user2.Username;
            _userRepo.Create(user1);
            _userRepo.Create(user2);

            var result1 = (ObjectResult)_userController.IsUsernameUnavailable(username1.ToLowerInvariant()).Result;
            Assert.That(result1.Value, Is.True);

            var result2 = (ObjectResult)_userController.IsUsernameUnavailable(username2.ToUpperInvariant()).Result;
            Assert.That(result2.Value, Is.True);

            var result3 = (ObjectResult)_userController.IsUsernameUnavailable(username1).Result;
            Assert.That(result3.Value, Is.True);

            var result4 = (ObjectResult)_userController.IsUsernameUnavailable("NewUsername").Result;
            Assert.That(result4.Value, Is.False);

            var result5 = (ObjectResult)_userController.IsUsernameUnavailable("").Result;
            Assert.That(result5.Value, Is.True);
        }

        [Test]
        public void TestIsEmailUnavailable()
        {
            var user1 = RandomUser();
            var user2 = RandomUser();
            var email1 = user1.Email;
            var email2 = user2.Email;
            _userRepo.Create(user1);
            _userRepo.Create(user2);

            var result1 = (ObjectResult)_userController.IsEmailUnavailable(email1.ToLowerInvariant()).Result;
            Assert.That(result1.Value, Is.True);

            var result2 = (ObjectResult)_userController.IsEmailUnavailable(email2.ToUpperInvariant()).Result;
            Assert.That(result2.Value, Is.True);

            var result3 = (ObjectResult)_userController.IsEmailUnavailable(email1).Result;
            Assert.That(result3.Value, Is.True);

            var result4 = (ObjectResult)_userController.IsEmailUnavailable("new@e.mail").Result;
            Assert.That(result4.Value, Is.False);

            var result5 = (ObjectResult)_userController.IsEmailUnavailable("").Result;
            Assert.That(result5.Value, Is.True);
        }
    }
}
