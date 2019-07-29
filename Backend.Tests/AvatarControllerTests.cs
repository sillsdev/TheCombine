using BackendFramework.Controllers;
using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Internal;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;
using System;
using System.IO;

namespace Backend.Tests
{
    public class AvatarControllerTests
    {
        private IUserService _userService;
        private UserController _userController;
        private AvatarController _avatarController;
        private PermissionServiceMock _permissionService;
        private User _JwtAuthenticatedUser;

        [SetUp]
        public void Setup()
        {
            _permissionService = new PermissionServiceMock();
            _userService = new UserServiceMock();
            _userController = new UserController(_userService, _permissionService);
            _avatarController = new AvatarController(_userService, _permissionService);

            //mock the Http Context because this isnt an actual call
            //avatar controller
            _avatarController.ControllerContext = new ControllerContext();
            _avatarController.ControllerContext.HttpContext = new DefaultHttpContext();
            //user controller
            _userController.ControllerContext = new ControllerContext();
            _userController.ControllerContext.HttpContext = new DefaultHttpContext();

            //_avatarController.ControllerContext.HttpContext.Request.Headers["device-id"] = "20317";
            _JwtAuthenticatedUser = new User();
            _JwtAuthenticatedUser.Username = "user";
            _JwtAuthenticatedUser.Password = "pass";
            _userService.Create(_JwtAuthenticatedUser);
            _JwtAuthenticatedUser = _userService.Authenticate(_JwtAuthenticatedUser.Username, _JwtAuthenticatedUser.Password).Result;
        }

        string RandomString(int length = 0)
        {
            if (length == 0)
            {
                return Convert.ToBase64String(Guid.NewGuid().ToByteArray());
            }
            return Convert.ToBase64String(Guid.NewGuid().ToByteArray()).Substring(0, length);
        }

        User RandomUser()
        {
            User user = new User();
            user.Username = RandomString(4);
            user.Password = RandomString(4);
            return user;
        }

        [Test]
        public void TestAvatarImport()
        {
            string filePath = Path.Combine(Directory.GetParent(Directory.GetParent(Directory.GetParent(Environment.CurrentDirectory).ToString()).ToString()).ToString(), "Assets", "combine.png");

            FileStream fstream = File.OpenRead(filePath);

            FormFile formFile = new FormFile(fstream, 0, fstream.Length, "dave", "combine.png");
            FileUpload fileUpload = new FileUpload();
            fileUpload.Name = "FileName";
            fileUpload.File = formFile;

            _ = _avatarController.UploadAvatar(_JwtAuthenticatedUser.Id, fileUpload).Result;

            var action = _userController.Get(_JwtAuthenticatedUser.Id).Result;

            var foundUser = (action as ObjectResult).Value as User;
            Assert.IsNotNull(foundUser.Avatar);
        }
    }
}