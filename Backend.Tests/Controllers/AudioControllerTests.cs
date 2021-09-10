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
    public class AudioControllerTests
    {
        private IProjectRepository _projRepo = null!;
        private IWordRepository _wordRepo = null!;
        private PermissionServiceMock _permissionService = null!;
        private WordService _wordService = null!;
        private AudioController _audioController = null!;
        private WordController _wordController = null!;

        private string _projId = null!;

        [SetUp]
        public void Setup()
        {
            _projRepo = new ProjectRepositoryMock();
            _wordRepo = new WordRepositoryMock();
            _permissionService = new PermissionServiceMock();
            _wordService = new WordService(_wordRepo);
            _audioController = new AudioController(_wordRepo, _wordService, _permissionService);
            _wordController = new WordController(_wordRepo, _wordService, _projRepo, _permissionService);

            _projId = _projRepo.Create(new Project { Name = "AudioControllerTests" }).Result!.Id;
        }

        [TearDown]
        public void TearDown()
        {
            _projRepo.Delete(_projId);
        }

        [Test]
        public void TestAudioImport()
        {
            const string soundFileName = "sound.mp3";
            var filePath = Path.Combine(Util.AssetsDir, soundFileName);

            // Open the file to read to controller.
            using var stream = File.OpenRead(filePath);
            var formFile = new FormFile(stream, 0, stream.Length, "name", soundFileName);
            var fileUpload = new FileUpload { File = formFile, Name = "FileName" };

            var word = _wordRepo.Create(Util.RandomWord(_projId)).Result;

            // `fileUpload` contains the file stream and the name of the file.
            _ = _audioController.UploadAudioFile(_projId, word.Id, fileUpload).Result;

            var action = _wordController.GetWord(_projId, word.Id).Result;

            var foundWord = (Word)((ObjectResult)action).Value;
            Assert.IsNotNull(foundWord.Audio);
        }

        [Test]
        public void DeleteAudio()
        {
            // Fill test database
            var origWord = _wordRepo.Create(Util.RandomWord(_projId)).Result;

            // Add audio file to word
            origWord.Audio.Add("a.wav");

            // Test delete function
            _ = _audioController.DeleteAudioFile(_projId, origWord.Id, "a.wav").Result;

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
            Assert.AreNotEqual(frontier[0].Id, origWord.Id);
            Assert.That(frontier[0].Audio, Has.Count.EqualTo(0));
            Assert.That(frontier[0].History, Has.Count.EqualTo(1));
        }
    }
}
