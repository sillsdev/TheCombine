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
    public class UserControllerTests
    {
        private IUserService _userService = null!;
        private UserController _controller = null!;
        private IPermissionService _permissionService = null!;

        [SetUp]
        public void Setup()
        {
            _permissionService = new PermissionServiceMock();
            _userService = new UserServiceMock();
            _controller = new UserController(_userService, _permissionService, new EmailServiceMock(), new PasswordResetServiceMock());
        }

        private static User RandomUser()
        {
            var user = new User { Username = Util.RandString(10), Password = Util.RandString(10) };
            return user;
        }

        [Test]
        public void TestRandString()
        {
            var randomString = Util.RandString(10);
            Assert.IsTrue(char.IsUpper(randomString[0]));
            Assert.IsTrue(char.IsLower(randomString[1]));
            Assert.IsTrue(char.IsLower(randomString[2]));
            Assert.IsTrue(char.IsLower(randomString[3]));
            Assert.IsTrue(char.IsUpper(randomString[4]));
        }

        [Test]
        public void TestGetAllUsers()
        {
            _userService.Create(RandomUser());
            _userService.Create(RandomUser());
            _userService.Create(RandomUser());

            var users = ((ObjectResult)_controller.GetAllUsers().Result).Value as List<User>;
            Assert.That(users, Has.Count.EqualTo(3));
            _userService.GetAllUsers().Result.ForEach(user => Assert.Contains(user, users));
        }

        [Test]
        public void TestGetUser()
        {
            var user = _userService.Create(RandomUser()).Result ?? throw new Exception();

            _userService.Create(RandomUser());
            _userService.Create(RandomUser());

            var action = _controller.Get(user.Id).Result;
            Assert.IsInstanceOf<ObjectResult>(action);

            var foundUser = ((ObjectResult)action).Value as User;
            Assert.AreEqual(user, foundUser);
        }

        [Test]
        public void TestGetMissingUser()
        {
            var action = _controller.Get("INVALID_USER_ID").Result;
            Assert.IsInstanceOf<NotFoundObjectResult>(action);
        }

        [Test]
        public void TestCreateUser()
        {
            var user = RandomUser();
            var id = (string)((ObjectResult)_controller.Post(user).Result).Value;
            user.Id = id;
            Assert.Contains(user, _userService.GetAllUsers().Result);
        }

        [Test]
        public void TestUpdateUser()
        {
            var origUser = _userService.Create(RandomUser()).Result ?? throw new Exception();
            var modUser = origUser.Clone();
            modUser.Username = "Mark";

            _ = _controller.Put(modUser.Id, modUser);

            var users = _userService.GetAllUsers().Result;
            Assert.That(users, Has.Count.EqualTo(1));
            Assert.Contains(modUser, users);
        }

        [Test]
        public void TestUpdateUserCantUpdateIsAdmin()
        {
            var origUser = _userService.Create(RandomUser()).Result ?? throw new Exception();
            var modUser = origUser.Clone() ?? throw new Exception();
            modUser.IsAdmin = true;

            _ = _controller.Put(modUser.Id, modUser);

            var users = _userService.GetAllUsers().Result;
            Assert.That(users, Has.Count.EqualTo(1));
            Assert.Contains(modUser, users);
        }

        [Test]
        public void TestDeleteUser()
        {
            var origUser = _userService.Create(RandomUser()).Result ?? throw new Exception();
            Assert.That(_userService.GetAllUsers().Result, Has.Count.EqualTo(1));

            _ = _controller.Delete(origUser.Id).Result;
            Assert.That(_userService.GetAllUsers().Result, Has.Count.EqualTo(0));
        }

        [Test]
        public void TestDeleteAllUsers()
        {
            _userService.Create(RandomUser());
            _userService.Create(RandomUser());
            _userService.Create(RandomUser());
            Assert.That(_userService.GetAllUsers().Result, Has.Count.EqualTo(3));

            _ = _controller.Delete().Result;
            Assert.That(_userService.GetAllUsers().Result, Has.Count.EqualTo(0));
        }

        [Test]
        public void TestCheckUsername()
        {
            var user1 = RandomUser();
            var user2 = RandomUser();
            var username1 = user1.Username;
            var username2 = user2.Username;

            _userService.Create(user1);
            _userService.Create(user2);

            var result1 = (StatusCodeResult)_controller.CheckUsername(username1.ToLowerInvariant()).Result;
            Assert.AreEqual(result1.StatusCode, 400);

            var result2 = (StatusCodeResult)_controller.CheckUsername(username2.ToUpperInvariant()).Result;
            Assert.AreEqual(result2.StatusCode, 400);

            var result3 = (StatusCodeResult)_controller.CheckUsername(username1).Result;
            Assert.AreEqual(result3.StatusCode, 400);

            var result4 = (StatusCodeResult)_controller.CheckUsername("NewUsername").Result;
            Assert.AreEqual(result4.StatusCode, 200);
        }

        [Test]
        public void TestCheckEmail()
        {
            var user1 = RandomUser();
            var user2 = RandomUser();
            var email1 = user1.Email;
            var email2 = user2.Email;

            _userService.Create(user1);
            _userService.Create(user2);

            var result1 = (StatusCodeResult)_controller.CheckEmail(email1.ToLowerInvariant()).Result;
            Assert.AreEqual(result1.StatusCode, 400);

            var result2 = (StatusCodeResult)_controller.CheckEmail(email2.ToUpperInvariant()).Result;
            Assert.AreEqual(result2.StatusCode, 400);

            var result3 = (StatusCodeResult)_controller.CheckEmail(email1).Result;
            Assert.AreEqual(result3.StatusCode, 400);

            var result4 = (StatusCodeResult)_controller.CheckEmail("NewEmail").Result;
            Assert.AreEqual(result4.StatusCode, 200);
        }
    }
}
