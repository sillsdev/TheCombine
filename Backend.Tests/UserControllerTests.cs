using Backend.Tests;
using BackendFramework.Controllers;
using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;
using System;
using System.Collections.Generic;

namespace Tests
{
    public class UserControllerTests
    {
        IUserService _userService;
        UserController controller;

        [SetUp]
        public void Setup()
        {
            _userService = new UserServiceMock();
            controller = new UserController(_userService);
        }

        User RandomUser()
        {
            User user = new User();
            user.Username = Convert.ToBase64String(Guid.NewGuid().ToByteArray()).Substring(0, 4);
            user.Password = Convert.ToBase64String(Guid.NewGuid().ToByteArray()).Substring(0, 4);
            return user;
        }

        [Test]
        public void TestGetAllUsers()
        {
            _userService.Create(RandomUser());
            _userService.Create(RandomUser());
            _userService.Create(RandomUser());

            var users = (controller.Get().Result as ObjectResult).Value as List<User>;
            Assert.That(users, Has.Count.EqualTo(3));
            _userService.GetAllUsers().Result.ForEach(user => Assert.Contains(user, users));
        }

        [Test]
        public void TestGetUser()
        {
            User user = _userService.Create(RandomUser()).Result;

            _userService.Create(RandomUser());
            _userService.Create(RandomUser());

            var action = controller.Get(user.Id).Result;

            Assert.That(action, Is.InstanceOf<ObjectResult>());

            var foundUser = (action as ObjectResult).Value as User;
            Assert.AreEqual(user, foundUser);
        }

        [Test]
        public void TestCreateUser()
        {
            User user = RandomUser();
            string id = (controller.Post(user).Result as ObjectResult).Value as string;
            user.Id = id;
            Assert.Contains(user, _userService.GetAllUsers().Result);
        }

        [Test]
        public void TestUpdateUser()
        {
            User origUser = _userService.Create(RandomUser()).Result;

            User modUser = origUser.Clone();
            modUser.Username = "Mark";

            _ = controller.Put(modUser.Id, modUser);

            Assert.That(_userService.GetAllUsers().Result, Has.Count.EqualTo(1));
            Assert.Contains(modUser, _userService.GetAllUsers().Result);
        }

        [Test]
        public void TestDeleteUser()
        {
            User origUser = _userService.Create(RandomUser()).Result;

            Assert.That(_userService.GetAllUsers().Result, Has.Count.EqualTo(1));

            _ = controller.Delete(origUser.Id).Result;

            Assert.That(_userService.GetAllUsers().Result, Has.Count.EqualTo(0));
        }

        [Test]
        public void TestDeleteAllUsers()
        {
            _userService.Create(RandomUser());
            _userService.Create(RandomUser());
            _userService.Create(RandomUser());

            Assert.That(_userService.GetAllUsers().Result, Has.Count.EqualTo(3));

            _ = controller.Delete().Result;

            Assert.That(_userService.GetAllUsers().Result, Has.Count.EqualTo(0));
        }
    }
}