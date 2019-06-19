using Backend.Tests;
using BackendFramework.Controllers;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Services;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
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

        User testUser()
        {
            User user = new User();
            // let's add some random data
            user.Username = Convert.ToBase64String(Guid.NewGuid().ToByteArray()).Substring(0, 4);
            user.Password = Convert.ToBase64String(Guid.NewGuid().ToByteArray()).Substring(0, 4);
            return user;
        }

        [Test]
        public void TestGetAllUsers()
        {
            _userService.Create(testUser());
            _userService.Create(testUser());
            _userService.Create(testUser());

            var users = (controller.Get().Result as ObjectResult).Value as List<User>;
            Assert.That(users, Has.Count.EqualTo(3));
            _userService.GetAllUsers().Result.ForEach(user => Assert.Contains(user, users));
        }

        [Test]
        public void TestGetUser()
        {
            User user = _userService.Create(testUser()).Result;

            _userService.Create(testUser());
            _userService.Create(testUser());

            var action = controller.Get(user.Id).Result;

            Assert.That(action, Is.InstanceOf<ObjectResult>());

            var foundUsers = (action as ObjectResult).Value as List<User>;
            Assert.That(foundUsers, Has.Count.EqualTo(1));
            Assert.AreEqual(user, foundUsers[0]);
        }

        [Test]
        public void TestCreateUser()
        {
            User user = testUser();
            string id = (controller.Post(user).Result as ObjectResult).Value as string;
            user.Id = id;
            Assert.Contains(user, _userService.GetAllUsers().Result);
        }

        [Test]
        public void TestUpdateUser()
        {
            User origUser = _userService.Create(testUser()).Result;

            User modUser = origUser.Clone();
            modUser.Username = "Mark";

            var action = controller.Put(modUser.Id, modUser);

            Assert.That(_userService.GetAllUsers().Result, Has.Count.EqualTo(1));
            Assert.Contains(modUser, _userService.GetAllUsers().Result);
        }

        [Test]
        public void TestDeleteUser()
        {
            User origUser = _userService.Create(testUser()).Result;

            Assert.That(_userService.GetAllUsers().Result, Has.Count.EqualTo(1));

            var action = controller.Delete(origUser.Id).Result;

            Assert.That(_userService.GetAllUsers().Result, Has.Count.EqualTo(0));
        }

        //[Test]
        //public void TestAuthenticate()
        //{
        //    Assert.IsNull(_userService.Authenticate("fake", "fake"));

        //    User origUser = _userService.Create(testUser()).Result;
        //    User nullPass = origUser.Clone();
        //    nullPass.Password = "";
        //    nullPass.Token = "thisIsAToken";
        //    var result = _userService.Authenticate(origUser.Username, origUser.Password).Result;

        //    Assert.AreEqual(nullPass, result);
        //    Assert.IsNull(_userService.Authenticate(nullPass.Username, nullPass.Password));
        //}
    }
}