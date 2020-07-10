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
            _controller = new UserController(_userService, _permissionService);
        }

        private static User RandomUser()
        {
            var user = new User { Username = Util.RandString(), Password = Util.RandString() };
            return user;
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
    }
}
