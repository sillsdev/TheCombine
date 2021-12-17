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

            var action = _userController.GetUser(user.Id).Result;
            Assert.IsInstanceOf<ObjectResult>(action);

            var foundUser = (User)((ObjectResult)action).Value!;
            Assert.That(foundUser, Is.EqualTo(user));
        }

        [Test]
        public void TestGetMissingUser()
        {
            var action = _userController.GetUser("INVALID_USER_ID").Result;
            Assert.IsInstanceOf<NotFoundObjectResult>(action);
        }

        [Test]
        public void TestGetUserByEmail()
        {
            const string email = "example@gmail.com";
            var user = _userRepo.Create(
                new User { Email = email, Username = Util.RandString(10), Password = Util.RandString(10) }
            ).Result ?? throw new Exception();

            var action = _userController.GetUserByEmail(email).Result;
            Assert.IsInstanceOf<ObjectResult>(action);

            var foundUser = (User)((ObjectResult)action).Value!;
            Assert.That(foundUser, Is.EqualTo(user));
        }

        [Test]
        public void TestGetMissingEmail()
        {
            var action = _userController.GetUserByEmail("INVALID_EMAIL@gmail.com").Result;
            Assert.IsInstanceOf<NotFoundObjectResult>(action);
        }

        [Test]
        public void TestGetUserByEmailNoPermission()
        {
            _userController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            const string email = "example@gmail.com";
            var _ = _userRepo.Create(new User
            { Email = email, Username = Util.RandString(10), Password = Util.RandString(10) }
            ).Result ?? throw new Exception();

            var action = _userController.GetUserByEmail(email).Result;
            Assert.IsInstanceOf<ForbidResult>(action);
        }

        [Test]
        public void TestCreateUser()
        {
            var user = RandomUser();
            var id = (string)((ObjectResult)_userController.CreateUser(user).Result).Value!;
            user.Id = id;
            Assert.Contains(user, _userRepo.GetAllUsers().Result);
        }

        [Test]
        public void TestUpdateUser()
        {
            var origUser = _userRepo.Create(RandomUser()).Result ?? throw new Exception();
            var modUser = origUser.Clone();
            modUser.Username = "Mark";

            _ = _userController.UpdateUser(modUser.Id, modUser);

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

            _ = _userController.UpdateUser(modUser.Id, modUser);

            var users = _userRepo.GetAllUsers().Result;
            Assert.That(users, Has.Count.EqualTo(1));
            Assert.Contains(modUser, users);
        }

        [Test]
        public void TestDeleteUser()
        {
            var origUser = _userRepo.Create(RandomUser()).Result ?? throw new Exception();
            Assert.That(_userRepo.GetAllUsers().Result, Has.Count.EqualTo(1));

            _ = _userController.DeleteUser(origUser.Id).Result;
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

            var result1 = (ObjectResult)_userController.CheckUsername(username1.ToLowerInvariant()).Result;
            Assert.IsTrue((bool)result1.Value!);

            var result2 = (ObjectResult)_userController.CheckUsername(username2.ToUpperInvariant()).Result;
            Assert.IsTrue((bool)result2.Value!);

            var result3 = (ObjectResult)_userController.CheckUsername(username1).Result;
            Assert.IsTrue((bool)result3.Value!);

            var result4 = (ObjectResult)_userController.CheckUsername("NewUsername").Result;
            Assert.IsFalse((bool)result4.Value!);

            var result5 = (ObjectResult)_userController.CheckUsername("").Result;
            Assert.IsTrue((bool)result5.Value!);
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

            var result1 = (ObjectResult)_userController.CheckEmail(email1.ToLowerInvariant()).Result;
            Assert.IsTrue((bool)result1.Value!);

            var result2 = (ObjectResult)_userController.CheckEmail(email2.ToUpperInvariant()).Result;
            Assert.IsTrue((bool)result2.Value!);

            var result3 = (ObjectResult)_userController.CheckEmail(email1).Result;
            Assert.IsTrue((bool)result3.Value!);

            var result4 = (ObjectResult)_userController.CheckEmail("NewEmail").Result;
            Assert.IsFalse((bool)result4.Value!);

            var result5 = (ObjectResult)_userController.CheckEmail("").Result;
            Assert.IsTrue((bool)result5.Value!);
        }
    }
}
