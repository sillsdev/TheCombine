using System;
using System.Collections.Generic;
using System.Net;
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
        private IUserRepository _userRepo = null!;
        private IPermissionService _permissionService = null!;
        private UserController _userController = null!;

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
            _userRepo.Create(RandomUser());
            _userRepo.Create(RandomUser());
            _userRepo.Create(RandomUser());

            var users = ((ObjectResult)_userController.GetAllUsers().Result).Value as List<User>;
            Assert.That(users, Has.Count.EqualTo(3));
            _userRepo.GetAllUsers().Result.ForEach(user => Assert.Contains(user, users));
        }

        [Test]
        public void TestGetUser()
        {
            var user = _userRepo.Create(RandomUser()).Result ?? throw new Exception();

            _userRepo.Create(RandomUser());
            _userRepo.Create(RandomUser());

            var action = _userController.Get(user.Id).Result;
            Assert.IsInstanceOf<ObjectResult>(action);

            var foundUser = ((ObjectResult)action).Value as User;
            Assert.AreEqual(user, foundUser);
        }

        [Test]
        public void TestGetMissingUser()
        {
            var action = _userController.Get("INVALID_USER_ID").Result;
            Assert.IsInstanceOf<NotFoundObjectResult>(action);
        }

        [Test]
        public void TestCreateUser()
        {
            var user = RandomUser();
            var id = (string)((ObjectResult)_userController.Post(user).Result).Value;
            user.Id = id;
            Assert.Contains(user, _userRepo.GetAllUsers().Result);
        }

        [Test]
        public void TestUpdateUser()
        {
            var origUser = _userRepo.Create(RandomUser()).Result ?? throw new Exception();
            var modUser = origUser.Clone();
            modUser.Username = "Mark";

            _ = _userController.Put(modUser.Id, modUser);

            var users = _userRepo.GetAllUsers().Result;
            Assert.That(users, Has.Count.EqualTo(1));
            Assert.Contains(modUser, users);
        }

        [Test]
        public void TestUpdateUserCantUpdateIsAdmin()
        {
            var origUser = _userRepo.Create(RandomUser()).Result ?? throw new Exception();
            var modUser = origUser.Clone() ?? throw new Exception();
            modUser.IsAdmin = true;

            _ = _userController.Put(modUser.Id, modUser);

            var users = _userRepo.GetAllUsers().Result;
            Assert.That(users, Has.Count.EqualTo(1));
            Assert.Contains(modUser, users);
        }

        [Test]
        public void TestDeleteUser()
        {
            var origUser = _userRepo.Create(RandomUser()).Result ?? throw new Exception();
            Assert.That(_userRepo.GetAllUsers().Result, Has.Count.EqualTo(1));

            _ = _userController.Delete(origUser.Id).Result;
            Assert.That(_userRepo.GetAllUsers().Result, Has.Count.EqualTo(0));
        }

        [Test]
        public void TestDeleteAllUsers()
        {
            _userRepo.Create(RandomUser());
            _userRepo.Create(RandomUser());
            _userRepo.Create(RandomUser());
            Assert.That(_userRepo.GetAllUsers().Result, Has.Count.EqualTo(3));

            _ = _userController.Delete().Result;
            Assert.That(_userRepo.GetAllUsers().Result, Has.Count.EqualTo(0));
        }

        [Test]
        public void TestCheckUsername()
        {
            var user1 = RandomUser();
            var user2 = RandomUser();
            var username1 = user1.Username;
            var username2 = user2.Username;

            _userRepo.Create(user1);
            _userRepo.Create(user2);

            var result1 = (StatusCodeResult)_userController.CheckUsername(username1.ToLowerInvariant()).Result;
            Assert.AreEqual(result1.StatusCode, (int)HttpStatusCode.BadRequest);

            var result2 = (StatusCodeResult)_userController.CheckUsername(username2.ToUpperInvariant()).Result;
            Assert.AreEqual(result2.StatusCode, (int)HttpStatusCode.BadRequest);

            var result3 = (StatusCodeResult)_userController.CheckUsername(username1).Result;
            Assert.AreEqual(result3.StatusCode, (int)HttpStatusCode.BadRequest);

            var result4 = (StatusCodeResult)_userController.CheckUsername("NewUsername").Result;
            Assert.AreEqual(result4.StatusCode, (int)HttpStatusCode.OK);
        }

        [Test]
        public void TestCheckEmail()
        {
            var user1 = RandomUser();
            var user2 = RandomUser();
            var email1 = user1.Email;
            var email2 = user2.Email;

            _userRepo.Create(user1);
            _userRepo.Create(user2);

            var result1 = (StatusCodeResult)_userController.CheckEmail(email1.ToLowerInvariant()).Result;
            Assert.AreEqual(result1.StatusCode, (int)HttpStatusCode.BadRequest);

            var result2 = (StatusCodeResult)_userController.CheckEmail(email2.ToUpperInvariant()).Result;
            Assert.AreEqual(result2.StatusCode, (int)HttpStatusCode.BadRequest);

            var result3 = (StatusCodeResult)_userController.CheckEmail(email1).Result;
            Assert.AreEqual(result3.StatusCode, (int)HttpStatusCode.BadRequest);

            var result4 = (StatusCodeResult)_userController.CheckEmail("NewEmail").Result;
            Assert.AreEqual(result4.StatusCode, (int)HttpStatusCode.OK);
        }
    }
}
