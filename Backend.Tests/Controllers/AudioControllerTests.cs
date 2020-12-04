﻿using System;
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
        private IWordRepository _wordRepo;
        private WordService _wordService;
        private WordController _wordController;
        private AudioController _audioController;

        private IProjectService _projectService;
        private string _projId;
        private PermissionServiceMock _permissionService;

        [SetUp]
        public void Setup()
        {
            _wordRepo = new WordRepositoryMock();
            _wordService = new WordService(_wordRepo);
            _projectService = new ProjectServiceMock();
            _projId = _projectService.Create(new Project()).Result.Id;
            _permissionService = new PermissionServiceMock();
            _wordController = new WordController(_wordRepo, _wordService, _projectService, _permissionService);
            _audioController = new AudioController(_wordRepo, _wordService, _permissionService);
        }

        [TearDown]
        public void TearDown()
        {
            _projectService.Delete(_projId);
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
            var filePath = Path.Combine(Util.AssetsDir, "sound.mp3");

            // Open the file to read to controller.
            using var fstream = File.OpenRead(filePath);
            var formFile = new FormFile(fstream, 0, fstream.Length, "name", "sound.mp3");
            var fileUpload = new FileUpload { File = formFile, Name = "FileName" };

            var word = _wordRepo.Create(RandomWord()).Result;

            // `fileUpload` contains the file stream and the name of the file.
            _ = _audioController.UploadAudioFile(_projId, word.Id, fileUpload).Result;

            var action = _wordController.Get(_projId, word.Id).Result;

            var foundWord = (action as ObjectResult).Value as Word;
            Assert.IsNotNull(foundWord.Audio);
        }

        [Test]
        public void DeleteAudio()
        {
            // Fill test database
            var origWord = _wordRepo.Create(RandomWord()).Result;

            // Add audio file to word
            origWord.Audio.Add("a.wav");

            // Test delete function
            var action = _audioController.Delete(_projId, origWord.Id, "a.wav").Result;

            // Original word persists
            Assert.IsTrue(_wordRepo.GetAllWords(_projId).Result.Count == 2);

            // Get the new word from the database
            var frontier = _wordRepo.GetFrontier(_projId).Result;

            // Ensure the new word has no audio files
            Assert.IsTrue(frontier[0].Audio.Count == 0);

            // Test the frontier
            Assert.That(_wordRepo.GetFrontier(_projId).Result, Has.Count.EqualTo(1));

            // Ensure the word with deleted audio is in the frontier
            Assert.IsTrue(frontier.Count == 1);
            Assert.IsTrue(frontier[0].Id != origWord.Id);
            Assert.IsTrue(frontier[0].Audio.Count == 0);
            Assert.IsTrue(frontier[0].History.Count == 1);
        }
    }
}
