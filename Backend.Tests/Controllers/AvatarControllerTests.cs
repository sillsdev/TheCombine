using System;
using System.IO;
using Backend.Tests.Mocks;
using BackendFramework.Controllers;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;

namespace Backend.Tests.Controllers
{
    public class AvatarControllerTests
    {
        private IUserRepository _userRepo = null!;
        private PermissionServiceMock _permissionService = null!;
        private AvatarController _avatarController = null!;
        private UserController _userController = null!;

        private User _jwtAuthenticatedUser = null!;

        [SetUp]
        public void Setup()
        {
            _userRepo = new UserRepositoryMock();
            _permissionService = new PermissionServiceMock(_userRepo);
            _avatarController = new AvatarController(_userRepo, _permissionService)
            {
                // Mock the Http Context because this isn't an actual call avatar controller
                ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() }
            };
            _userController = new UserController(
                _userRepo, _permissionService, new EmailServiceMock(), new PasswordResetServiceMock())
            {
                ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() }
            };

            _jwtAuthenticatedUser = new User { Username = "user", Password = "pass" };
            _userRepo.Create(_jwtAuthenticatedUser);
            _jwtAuthenticatedUser = _permissionService.Authenticate(
                _jwtAuthenticatedUser.Username, _jwtAuthenticatedUser.Password).Result ?? throw new Exception();
        }

        /// <summary>
        /// Delete the image file stored on disk for a particular user.
        /// </summary>
        /// <remarks>
        /// Note, this somewhat breaks the encapsulation of the AvatarController. If support is added for deleting
        /// Avatars in the future, that should be used and this function removed.
        /// </remarks>
        private static void DeleteAvatarFile(string userId)
        {
            var path = FileStorage.GenerateAvatarFilePath(userId);
            File.Delete(path);
        }

        [Test]
        public void TestAvatarImport()
        {
            const string fileName = "combine.png";
            var filePath = Path.Combine(Util.AssetsDir, fileName);
            using var stream = File.OpenRead(filePath);

            var formFile = new FormFile(stream, 0, stream.Length, "dave", fileName);
            var fileUpload = new FileUpload { File = formFile, Name = "FileName" };

            _ = _avatarController.UploadAvatar(_jwtAuthenticatedUser.Id, fileUpload).Result;

            var action = _userController.GetUser(_jwtAuthenticatedUser.Id).Result;

            var foundUser = (User)((ObjectResult)action).Value!;
            Assert.IsNotNull(foundUser.Avatar);

            // Clean up.
            DeleteAvatarFile(_jwtAuthenticatedUser.Id);
        }
    }
}
