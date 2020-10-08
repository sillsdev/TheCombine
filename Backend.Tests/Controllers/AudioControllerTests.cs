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
    public class AudioControllerTests
    {
        private IWordRepository _wordrepo;
        private WordService _wordService;
        private WordController _wordController;
        private AudioController _audioController;

        private IProjectService _projectService;
        private string _projId;
        private PermissionServiceMock _permissionService;

        [SetUp]
        public void Setup()
        {
            _wordrepo = new WordRepositoryMock();
            _wordService = new WordService(_wordrepo);
            _projectService = new ProjectServiceMock();
            _projId = _projectService.Create(new Project()).Result.Id;
            _permissionService = new PermissionServiceMock();
            _wordController = new WordController(_wordrepo, _wordService, _projectService, _permissionService);
            _audioController = new AudioController(_wordrepo, _wordService, _permissionService);
        }

        private static string RandomString(int length = 16)
        {
            return Convert.ToBase64String(Guid.NewGuid().ToByteArray()).Substring(0, length);
        }

        private static Word RandomWord()
        {
            var word = new Word { Vernacular = RandomString(4) };
            return word;
        }

        [Test]
        public void TestAudioImport()
        {
            // Get path to sound in Assets folder, from debugging folder.
            var filePath = Path.Combine(Directory.GetParent(Directory.GetParent(
                Directory.GetParent(Environment.CurrentDirectory).ToString()).ToString()).ToString(),
                "Assets", "sound.mp3");

            // Open the file to read to controller.
            var fstream = File.OpenRead(filePath);

            // Generate parameters for controller call.
            var formFile = new FormFile(fstream, 0, fstream.Length, "name", "sound.mp3");
            var fileUpload = new FileUpload { Name = "FileName", File = formFile };

            var word = _wordrepo.Create(RandomWord()).Result;

            // `fileUpload` contains the file stream and the name of the file.
            _ = _audioController.UploadAudioFile(_projId, word.Id, fileUpload).Result;

            var action = _wordController.Get(_projId, word.Id).Result;

            var foundWord = (action as ObjectResult).Value as Word;
            Assert.IsNotNull(foundWord.Audio);

            fstream.Close();
        }

        [Test]
        public void DeleteAudio()
        {
            // Fill test database
            var origWord = _wordrepo.Create(RandomWord()).Result;

            // Add audio file to word
            origWord.Audio.Add("a.wav");

            // Test delete function
            var action = _audioController.Delete(_projId, origWord.Id, "a.wav").Result;

            // Original word persists
            Assert.IsTrue(_wordrepo.GetAllWords(_projId).Result.Count == 2);

            // Get the new word from the database
            var frontier = _wordrepo.GetFrontier(_projId).Result;

            // Ensure the new word has no audio files
            Assert.IsTrue(frontier[0].Audio.Count == 0);

            // Test the frontier
            Assert.That(_wordrepo.GetFrontier(_projId).Result, Has.Count.EqualTo(1));

            // Ensure the word with deleted audio is in the frontier
            Assert.IsTrue(frontier.Count == 1);
            Assert.IsTrue(frontier[0].Id != origWord.Id);
            Assert.IsTrue(frontier[0].Audio.Count == 0);
            Assert.IsTrue(frontier[0].History.Count == 1);
        }
    }
}
