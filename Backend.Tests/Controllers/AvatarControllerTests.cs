using System;
using System.IO;
using Backend.Tests.Mocks;
using BackendFramework.Controllers;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;

namespace Backend.Tests.Controllers
{
    public class AvatarControllerTests : IDisposable
    {
        private IUserRepository _userRepo = null!;
        private AvatarController _avatarController = null!;

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (disposing)
            {
                _avatarController?.Dispose();
            }
        }

        private string _userId = string.Empty;
        private const string FileName = "combine.png"; // File in Backend.Tests/Assets/
        private readonly string _filePath = Path.Combine(Util.AssetsDir, FileName);

        [SetUp]
        public void Setup()
        {
            _userRepo = new UserRepositoryMock();
            _avatarController = new AvatarController(_userRepo, new PermissionServiceMock(_userRepo));

            _userId = _userRepo.Create(new() { Username = "user", Password = "pass" }).Result!.Id;
            _avatarController.ControllerContext.HttpContext = PermissionServiceMock.HttpContextWithUserId(_userId);
        }

        /// <summary> Delete the image file stored on disk for a particular user. </summary>
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
        public void TestDownloadAvatarNoUser()
        {
            var result = _avatarController.DownloadAvatar("false-user-id").Result;
            Assert.That(result, Is.InstanceOf<NotFoundResult>());
        }

        [Test]
        public void TestDownloadAvatarNoAvatar()
        {
            var result = _avatarController.DownloadAvatar(_userId).Result;
            Assert.That(result, Is.InstanceOf<NotFoundResult>());
        }

        [Test]
        public void TestUploadAvatarUnauthorizedUser()
        {
            using var stream = File.OpenRead(_filePath);
            var file = new FormFile(stream, 0, stream.Length, "formFileName", FileName);
            _avatarController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            var result = _avatarController.UploadAvatar(file).Result;
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public void TestUploadAudioFileNullFile()
        {
            var result = _avatarController.UploadAvatar(null).Result;
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
        }

        [Test]
        public void TestUploadAudioFileEmptyFile()
        {
            using var stream = File.OpenRead(_filePath);
            // Use 0 for the third argument to simulate an empty file.
            var file = new FormFile(stream, 0, 0, "formFileName", FileName);

            var result = _avatarController.UploadAvatar(file).Result;
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
        }

        [Test]
        public void TestUploadAvatarAndDownloadAvatar()
        {
            using var stream = File.OpenRead(_filePath);
            var file = new FormFile(stream, 0, stream.Length, "formFileName", FileName);
            var uploadResult = _avatarController.UploadAvatar(file).Result;
            Assert.That(uploadResult, Is.TypeOf<OkResult>());

            var foundUser = _userRepo.GetUser(_userId).Result;
            Assert.That(foundUser?.Avatar, Is.Not.Null);

            // No permissions should be required to download an avatar.
            _avatarController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            var fileResult = _avatarController.DownloadAvatar(_userId).Result as FileStreamResult;
            Assert.That(fileResult, Is.TypeOf<FileStreamResult>());

            // Clean up.
            fileResult!.FileStream.Dispose();
            DeleteAvatarFile(_userId);
        }
    }
}
