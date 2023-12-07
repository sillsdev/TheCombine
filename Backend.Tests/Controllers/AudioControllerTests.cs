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

        [SetUp]
        public void Setup()
        {
            _projRepo = new ProjectRepositoryMock();
            _wordRepo = new WordRepositoryMock();
            _permissionService = new PermissionServiceMock();
            _wordService = new WordService(_wordRepo);
            _audioController = new AudioController(_wordRepo, _wordService, _permissionService);

            _projId = _projRepo.Create(new Project { Name = "AudioControllerTests" }).Result!.Id;
        }

        [TearDown]
        public void TearDown()
        {
            _projRepo.Delete(_projId);
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
        public void TestAudioImport()
        {
            const string soundFileName = "sound.mp3"; // file in Backend.Tests/Assets/
            var filePath = Path.Combine(Util.AssetsDir, soundFileName);

            // Open the file to read to controller.
            using var stream = File.OpenRead(filePath);
            var formFile = new FormFile(stream, 0, stream.Length, "name", soundFileName);
            var fileUpload = new FileUpload { File = formFile, Name = "FileName" };

            var word = _wordRepo.Create(Util.RandomWord(_projId)).Result;

            // `fileUpload` contains the file stream and the name of the file.
            _ = _audioController.UploadAudioFile(_projId, word.Id, "", fileUpload).Result;

            var foundWord = _wordRepo.GetWord(_projId, word.Id).Result;
            Assert.That(foundWord?.Audio, Is.Not.Null);
        }

        [Test]
        public void DeleteAudio()
        {
            // Fill test database
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
