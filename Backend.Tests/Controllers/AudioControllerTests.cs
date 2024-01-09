using System;
using System.IO;
using Backend.Tests.Mocks;
using BackendFramework.Controllers;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;

namespace Backend.Tests.Controllers
{
    public class AudioControllerTests : IDisposable
    {
        private IProjectRepository _projRepo = null!;
        private IWordRepository _wordRepo = null!;
        private PermissionServiceMock _permissionService = null!;
        private WordService _wordService = null!;
        private AudioController _audioController = null!;

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (disposing)
            {
                _audioController?.Dispose();
            }
        }

        private string _projId = null!;
        private string _wordId = null!;
        private const string FileName = "sound.mp3"; // file in Backend.Tests/Assets/
        private readonly Stream _stream = File.OpenRead(Path.Combine(Util.AssetsDir, FileName));
        private FileUpload _fileUpload = null!;

        [SetUp]
        public void Setup()
        {
            _projRepo = new ProjectRepositoryMock();
            _wordRepo = new WordRepositoryMock();
            _permissionService = new PermissionServiceMock();
            _wordService = new WordService(_wordRepo);
            _audioController = new AudioController(_wordRepo, _wordService, _permissionService);

            _projId = _projRepo.Create(new Project { Name = "AudioControllerTests" }).Result!.Id;
            _wordId = _wordRepo.Create(Util.RandomWord(_projId)).Result.Id;

            var formFile = new FormFile(_stream, 0, _stream.Length, "Name", FileName);
            _fileUpload = new FileUpload { File = formFile, Name = "FileName" };
        }

        [Test]
        public void TestUploadAudioFileUnauthorized()
        {
            _audioController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = _audioController.UploadAudioFile(_projId, _wordId, _fileUpload).Result;
            Assert.That(result, Is.InstanceOf<ForbidResult>());

            result = _audioController.UploadAudioFile(_projId, _wordId, "", _fileUpload).Result;
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public void TestUploadAudioFileInvalidArguments()
        {
            var result = _audioController.UploadAudioFile("invalid/projId", _wordId, _fileUpload).Result;
            Assert.That(result, Is.TypeOf<UnsupportedMediaTypeResult>());

            result = _audioController.UploadAudioFile(_projId, "invalid/wordId", _fileUpload).Result;
            Assert.That(result, Is.TypeOf<UnsupportedMediaTypeResult>());

            result = _audioController.UploadAudioFile("invalid/projId", _wordId, "speakerId", _fileUpload).Result;
            Assert.That(result, Is.TypeOf<UnsupportedMediaTypeResult>());

            result = _audioController.UploadAudioFile(_projId, "invalid/wordId", "speakerId", _fileUpload).Result;
            Assert.That(result, Is.TypeOf<UnsupportedMediaTypeResult>());
        }

        [Test]
        public void TestUploadConsentNullFile()
        {
            var result = _audioController.UploadAudioFile(_projId, _wordId, new()).Result;
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());

            result = _audioController.UploadAudioFile(_projId, _wordId, "speakerId", new()).Result;
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
        }

        [Test]
        public void TestUploadConsentEmptyFile()
        {
            // Use 0 for the third argument
            var formFile = new FormFile(_stream, 0, 0, "Name", FileName);
            _fileUpload = new FileUpload { File = formFile, Name = FileName };

            var result = _audioController.UploadAudioFile(_projId, _wordId, _fileUpload).Result;
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
            result = _audioController.UploadAudioFile(_projId, _wordId, "speakerId", _fileUpload).Result;
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
        }

        [Test]
        public void TestUploadAudioFile()
        {
            // `_fileUpload` contains the file stream and the name of the file.
            _ = _audioController.UploadAudioFile(_projId, _wordId, "speakerId", _fileUpload).Result;

            var foundWord = _wordRepo.GetWord(_projId, _wordId).Result;
            Assert.That(foundWord?.Audio, Is.Not.Null);
        }

        [Test]
        public void TestDownloadAudioFileInvalidArguments()
        {
            var result = _audioController.DownloadAudioFile("invalid/projId", "wordId", "fileName");
            Assert.That(result, Is.TypeOf<UnsupportedMediaTypeResult>());

            result = _audioController.DownloadAudioFile("projId", "invalid/wordId", "fileName");
            Assert.That(result, Is.TypeOf<UnsupportedMediaTypeResult>());

            result = _audioController.DownloadAudioFile("projId", "wordId", "invalid/fileName");
            Assert.That(result, Is.TypeOf<UnsupportedMediaTypeResult>());
        }

        [Test]
        public void TestDownloadAudioFileNoFile()
        {
            var result = _audioController.DownloadAudioFile("projId", "wordId", "fileName");
            Assert.That(result, Is.TypeOf<BadRequestObjectResult>());
        }

        [Test]
        public void DeleteAudio()
        {
            // Refill test database
            _wordRepo.DeleteAllWords(_projId);
            var origWord = Util.RandomWord(_projId);
            var fileName = "a.wav";
            origWord.Audio.Add(new Pronunciation(fileName));
            var wordId = _wordRepo.Create(origWord).Result.Id;

            // Test delete function
            _ = _audioController.DeleteAudioFile(_projId, wordId, fileName).Result;

            // Original word persists
            Assert.That(_wordRepo.GetAllWords(_projId).Result, Has.Count.EqualTo(2));

            // Get the new word from the database
            var frontier = _wordRepo.GetFrontier(_projId).Result;

            // Ensure the new word has no audio files
            Assert.That(frontier[0].Audio, Has.Count.EqualTo(0));

            // Test the frontier
            Assert.That(_wordRepo.GetFrontier(_projId).Result, Has.Count.EqualTo(1));

            // Ensure the word with deleted audio is in the frontier
            Assert.That(frontier, Has.Count.EqualTo(1));
            Assert.That(frontier[0].Id, Is.Not.EqualTo(wordId));
            Assert.That(frontier[0].Audio, Has.Count.EqualTo(0));
            Assert.That(frontier[0].History, Has.Count.EqualTo(1));
        }
    }
}
