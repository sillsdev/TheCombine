using BackendFramework.Controllers;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Services;
using Microsoft.AspNetCore.Http.Internal;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;
using System;
using System.IO;
using BackendFramework.Models;

namespace Backend.Tests
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

            var util = new Utilities();
            Directory.Delete(util.GenerateFilePath(
                Utilities.FileType.Dir, true, "", ""), true);
        }

        private static string RandomString(int length = 16)
        {
            return Convert.ToBase64String(Guid.NewGuid().ToByteArray()).Substring(0, length);
        }

        private static Word RandomWord()
        {
            var word = new Word {Vernacular = RandomString(4)};
            return word;
        }

        [Test]
        public void TestAudioImport()
        {
            // Get path to sound in Assets folder, from debugging folder.
            string filePath = Path.Combine(Directory.GetParent(Directory.GetParent(
                Directory.GetParent(Environment.CurrentDirectory).ToString()).ToString()).ToString(),
                "Assets", "sound.mp3");

            // Open the file to read to controller.
            FileStream fstream = File.OpenRead(filePath);

            // Generate parameters for controller call.
            var formFile = new FormFile(fstream, 0, fstream.Length, "name", "sound.mp3");
            var fileUpload = new FileUpload {Name = "FileName", File = formFile};

            Word word = _wordrepo.Create(RandomWord()).Result;

            // `fileUpload` contains the file stream and the name of the file.
            _ = _audioController.UploadAudioFile(_projId, word.Id, fileUpload).Result;

            var action = _wordController.Get(_projId, word.Id).Result;

            var foundWord = (action as ObjectResult).Value as Word;
            Assert.IsNotNull(foundWord.Audio);

            fstream.Close();
        }
    }
}
