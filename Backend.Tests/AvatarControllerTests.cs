using System;
using System.IO;
using BackendFramework.Controllers;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Internal;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;

namespace Backend.Tests
{
    public class AvatarControllerTests
    {
        private IUserService _userService;
        private UserController _userController;
        private AvatarController _avatarController;
        private PermissionServiceMock _permissionService;
        private User _jwtAuthenticatedUser;

        [SetUp]
        public void Setup()
        {
            _permissionService = new PermissionServiceMock();
            _userService = new UserServiceMock();
            _userController = new UserController(_userService, _permissionService);
            _avatarController = new AvatarController(_userService, _permissionService)
            {
                // Mock the Http Context because this isn't an actual call avatar controller
                ControllerContext = new ControllerContext {HttpContext = new DefaultHttpContext()}
            };

            // User controller
            _userController.ControllerContext = new ControllerContext {HttpContext = new DefaultHttpContext()};

            _jwtAuthenticatedUser = new User {Username = "user", Password = "pass"};
            _userService.Create(_jwtAuthenticatedUser);
            _jwtAuthenticatedUser = _userService.Authenticate(
                _jwtAuthenticatedUser.Username, _jwtAuthenticatedUser.Password).Result;
        }

        private static string RandomString(int length = 0)
        {
            if (length == 0)
            {
                return Convert.ToBase64String(Guid.NewGuid().ToByteArray());
            }
            return Convert.ToBase64String(Guid.NewGuid().ToByteArray()).Substring(0, length);
        }

        private User RandomUser()
        {
            var user = new User {Username = RandomString(4), Password = RandomString(4)};
            return user;
        }

        [Test]
        public void TestAvatarImport()
        {
            var filePath = Path.Combine(Directory.GetParent(
                Directory.GetParent(Directory.GetParent(
                    Environment.CurrentDirectory).ToString()).ToString()).ToString(), "Assets", "combine.png");

            var fstream = File.OpenRead(filePath);

            var formFile = new FormFile(fstream, 0, fstream.Length, "dave", "combine.png");
            var fileUpload = new FileUpload {Name = "FileName", File = formFile};

            _ = _avatarController.UploadAvatar(_jwtAuthenticatedUser.Id, fileUpload).Result;

            var action = _userController.Get(_jwtAuthenticatedUser.Id).Result;

            var foundUser = (action as ObjectResult).Value as User;
            Assert.IsNotNull(foundUser.Avatar);
        }
    }
}