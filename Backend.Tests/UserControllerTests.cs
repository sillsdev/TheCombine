using System.Collections.Generic;
using BackendFramework.Controllers;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;

namespace Backend.Tests
{
    public class UserControllerTests
    {
        private IUserService _userService;
        private UserController _controller;
        private IPermissionService _permissionService;

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

            var users = (_controller.GetAllUsers().Result as ObjectResult).Value as List<User>;
            Assert.That(users, Has.Count.EqualTo(3));
            _userService.GetAllUsers().Result.ForEach(user => Assert.Contains(user, users));
        }

        [Test]
        public void TestGetUser()
        {
            var user = _userService.Create(RandomUser()).Result;

            _userService.Create(RandomUser());
            _userService.Create(RandomUser());

            var action = _controller.Get(user.Id).Result;
            Assert.That(action, Is.InstanceOf<ObjectResult>());

            var foundUser = (action as ObjectResult).Value as User;
            Assert.AreEqual(user, foundUser);
        }

        [Test]
        public void TestCreateUser()
        {
            var user = RandomUser();
            var id = (_controller.Post(user).Result as ObjectResult).Value as string;
            user.Id = id;
            Assert.Contains(user, _userService.GetAllUsers().Result);
        }

        [Test]
        public void TestUpdateUser()
        {
            var origUser = _userService.Create(RandomUser()).Result;
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
            var origUser = _userService.Create(RandomUser()).Result;
            var modUser = origUser.Clone();
            modUser.IsAdmin = true;

            _ = _controller.Put(modUser.Id, modUser);

            var users = _userService.GetAllUsers().Result;
            Assert.That(users, Has.Count.EqualTo(1));
            Assert.Contains(modUser, users);
        }

        [Test]
        public void TestDeleteUser()
        {
            var origUser = _userService.Create(RandomUser()).Result;
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

            var result1 = (_controller.CheckUsername(username1.ToLowerInvariant())).Result as StatusCodeResult;
            //Assert.AreEqual(result1.StatusCode, 200);

            var result2 = (_controller.CheckUsername(username2.ToUpperInvariant())).Result as StatusCodeResult;
            //Assert.AreEqual(result2.StatusCode, 200);

            var result3 = (_controller.CheckUsername(username1)).Result as StatusCodeResult;
            //Assert.AreEqual(result3.StatusCode, 200);
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

            var result1 = (_controller.CheckEmail(email1.ToLowerInvariant())).Result as StatusCodeResult;
            //Assert.AreEqual(result1.StatusCode, 200);

            var result2 = (_controller.CheckEmail(email2.ToUpperInvariant())).Result as StatusCodeResult;
            //Assert.AreEqual(result2.StatusCode, 200);

            var result3 = (_controller.CheckEmail(email1)).Result as StatusCodeResult;
            //Assert.AreEqual(result3.StatusCode, 200);
        }

        /*Test]
        public void TestToLower()
        {
            var user = RandomUser();
            user.Username = "USERNAME";
            user.Email = "Example@Email.COM";
            user.Password = "qwerty";

            _ = _controller.Post(user);

            Assert.AreEqual("username", _userService.GetAllUsers().Result[0].Username);
            Assert.AreEqual("example@email.com", _userService.GetAllUsers().Result[0].Email);

            var credentials = new Credentials();
            credentials.Username = "UsErNaMe";
            credentials.Password = "qwerty";

            var result1 = (_controller.Authenticate(credentials).Result as OkObjectResult).Value;
            var userResult = result1 as User;
            Assert.IsNotNull(result1);
            Assert.AreEqual("username", userResult.Username);

            //var result2 = (_controller.CheckUsername("uSerName")).Result;
            //Assert.IsNotNull(result2);
        }*/
    }
}
