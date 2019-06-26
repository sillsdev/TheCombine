using Backend.Tests;
using BackendFramework.Controllers;
using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Http.Internal;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;
using System;
using System.IO;

namespace Backend.Tests
{
    public class AvatarControllerTests
    {
        IUserService _userService;
        UserController userController;
        AvatarController avatarController;

        [SetUp]
        public void Setup()
        {
            _userService = new UserServiceMock();
            userController = new UserController(_userService);
            avatarController = new AvatarController(_userService);
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
            string filePath = "../../../Assets/combine.png";

            FileStream fstream = File.OpenRead(filePath);

            FormFile formFile = new FormFile(fstream, 0, fstream.Length, "dave", "sena");
            FileUpload fileUpload = new FileUpload();
            fileUpload.Name = "FileName";
            fileUpload.File = formFile;

            User user = _userService.Create(RandomUser()).Result;

            _ = avatarController.UploadAvatar(user.Id, fileUpload).Result;

            var action = userController.Get(user.Id).Result;

            var foundUser = (action as ObjectResult).Value as User;
            Assert.IsNotNull(foundUser.Avatar);
        }
    }
}