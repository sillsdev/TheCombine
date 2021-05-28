using System.Collections.Generic;
using Backend.Tests.Mocks;
using BackendFramework.Controllers;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Services;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;

namespace Backend.Tests.Controllers
{
    public class WordControllerTests
    {
        private IProjectRepository _projRepo = null!;
        private IWordRepository _wordRepo = null!;
        private IWordService _wordService = null!;
        private IPermissionService _permissionService = null!;
        private WordController _wordController = null!;

        private string _projId = null!;

        [SetUp]
        public void Setup()
        {
            _projRepo = new ProjectRepositoryMock();
            _wordRepo = new WordRepositoryMock();
            _wordService = new WordService(_wordRepo);
            _permissionService = new PermissionServiceMock();
            _wordController = new WordController(_wordRepo, _wordService, _projRepo, _permissionService);

            _projId = _projRepo.Create(new Project { Name = "WordControllerTests" }).Result!.Id;
        }

        [Test]
        public void TestGetAllWords()
        {
            _wordRepo.Create(Util.RandomWord(_projId));
            _wordRepo.Create(Util.RandomWord(_projId));
            _wordRepo.Create(Util.RandomWord(_projId));

            var words = ((ObjectResult)_wordController.Get(_projId).Result).Value as List<Word>;
            Assert.That(words, Has.Count.EqualTo(3));
            _wordRepo.GetAllWords(_projId).Result.ForEach(word => Assert.Contains(word, words));
        }

        [Test]
        public void TestGetWord()
        {
            var word = _wordRepo.Create(Util.RandomWord(_projId)).Result;

            _wordRepo.Create(Util.RandomWord(_projId));
            _wordRepo.Create(Util.RandomWord(_projId));

            var action = _wordController.Get(_projId, word.Id).Result;
            Assert.IsInstanceOf<ObjectResult>(action);

            var foundWord = ((ObjectResult)action).Value as Word;
            Assert.AreEqual(word, foundWord);
        }

        [Test]
        public void AddWord()
        {
            var word = Util.RandomWord(_projId);

            var id = (string)((ObjectResult)_wordController.Post(_projId, word).Result).Value;
            word.Id = id;

            Assert.AreEqual(word, _wordRepo.GetAllWords(_projId).Result[0]);
            Assert.AreEqual(word, _wordRepo.GetFrontier(_projId).Result[0]);

            var oldDuplicate = Util.RandomWord(_projId);
            var newDuplicate = oldDuplicate.Clone();

            _ = _wordController.Post(_projId, oldDuplicate).Result;
            var result = ((ObjectResult)_wordController.Post(_projId, newDuplicate).Result).Value as string;
            Assert.AreEqual(result, "Duplicate");

            newDuplicate.Senses.RemoveAt(2);
            result = ((ObjectResult)_wordController.Post(_projId, newDuplicate).Result).Value as string;
            Assert.AreEqual(result, "Duplicate");

            newDuplicate.Senses = new List<Sense>();
            result = ((ObjectResult)_wordController.Post(_projId, newDuplicate).Result).Value as string;
            Assert.AreNotEqual(result, "Duplicate");
        }

        [Test]
        public void UpdateWord()
        {
            var origWord = _wordRepo.Create(Util.RandomWord(_projId)).Result;

            var modWord = origWord.Clone();
            modWord.Vernacular = "NewVernacular";

            var id = (string)((ObjectResult)_wordController.Put(_projId, modWord.Id, modWord).Result).Value;

            var finalWord = modWord.Clone();
            finalWord.Id = id;
            finalWord.History = new List<string> { origWord.Id };

            Assert.Contains(origWord, _wordRepo.GetAllWords(_projId).Result);
            Assert.Contains(finalWord, _wordRepo.GetAllWords(_projId).Result);

            Assert.That(_wordRepo.GetFrontier(_projId).Result, Has.Count.EqualTo(1));
            Assert.Contains(finalWord, _wordRepo.GetFrontier(_projId).Result);
        }

        [Test]
        public void DeleteWord()
        {
            // Fill test database
            var origWord = _wordRepo.Create(Util.RandomWord(_projId)).Result;

            // Test delete function
            _ = _wordController.Delete(_projId, origWord.Id).Result;

            // Original word persists
            Assert.Contains(origWord, _wordRepo.GetAllWords(_projId).Result);

            // Get the new deleted word from the database
            var frontier = _wordRepo.GetFrontier(_projId).Result;

            // Ensure the word is valid
            Assert.That(frontier, Has.Count.EqualTo(1));
            Assert.AreNotEqual(frontier[0].Id, origWord.Id);
            Assert.That(frontier[0].History, Has.Count.EqualTo(1));

            // Test the frontier
            Assert.That(_wordRepo.GetFrontier(_projId).Result, Has.Count.EqualTo(1));

            // Ensure the deleted word is in the frontier
            Assert.That(frontier, Has.Count.EqualTo(1));
            Assert.AreNotEqual(frontier[0].Id, origWord.Id);
            Assert.That(frontier[0].History, Has.Count.EqualTo(1));
        }

        [Test]
        public void TestGetMissingWord()
        {
            var action = _wordController.Get(_projId, "INVALID_WORD_ID").Result;
            Assert.IsInstanceOf<NotFoundObjectResult>(action);
        }
    }
}
