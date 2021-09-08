using System.Collections.Generic;
using System.Linq;
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
        public void TestDeleteAllWords()
        {
            _ = _wordRepo.Create(Util.RandomWord(_projId)).Result;
            _ = _wordRepo.Create(Util.RandomWord(_projId)).Result;
            const string diffProjId = "OTHER_PROJECT";
            _ = _wordRepo.Create(Util.RandomWord(diffProjId)).Result;

            _ = _wordController.DeleteProjectWords(_projId).Result;
            Assert.That(_wordRepo.GetAllWords(_projId).Result, Has.Count.Zero);
            Assert.That(_wordRepo.GetFrontier(_projId).Result, Has.Count.Zero);
            Assert.That(_wordRepo.GetAllWords(diffProjId).Result, Has.Count.EqualTo(1));
            Assert.That(_wordRepo.GetFrontier(diffProjId).Result, Has.Count.EqualTo(1));
        }

        [Test]
        public void TestDeleteFrontierWord()
        {
            var wordToDelete = _wordRepo.Create(Util.RandomWord(_projId)).Result;
            var otherWord = _wordRepo.Create(Util.RandomWord(_projId)).Result;

            _ = _wordController.DeleteFrontierWord(_projId, wordToDelete.Id).Result;
            var updatedWords = _wordRepo.GetAllWords(_projId).Result;
            Assert.That(updatedWords, Has.Count.EqualTo(3));
            updatedWords.ForEach(w => Assert.That(
                w.Id == wordToDelete.Id ||
                w.Id == otherWord.Id ||
                w.Accessibility == State.Deleted));
            var updatedFrontier = _wordRepo.GetFrontier(_projId).Result;
            Assert.That(updatedFrontier, Has.Count.EqualTo(1));
            Assert.That(updatedFrontier.First().Id, Is.EqualTo(otherWord.Id));
        }

        [Test]
        public void TestGetAllWords()
        {
            _wordRepo.Create(Util.RandomWord(_projId));
            _wordRepo.Create(Util.RandomWord(_projId));
            _wordRepo.Create(Util.RandomWord(_projId));
            _wordRepo.Create(Util.RandomWord("OTHER_PROJECT"));

            var words = (List<Word>)((ObjectResult)_wordController.GetProjectWords(_projId).Result).Value;
            Assert.That(words, Has.Count.EqualTo(3));
            _wordRepo.GetAllWords(_projId).Result.ForEach(word => Assert.Contains(word, words));
        }

        [Test]
        public void TestIsFrontierNonempty()
        {
            _ = _wordRepo.Create(Util.RandomWord("OTHER_PROJECT")).Result;
            var shouldBeFalse = (bool)((ObjectResult)_wordController.IsFrontierNonempty(_projId).Result).Value;
            Assert.False(shouldBeFalse);
            _ = _wordRepo.Create(Util.RandomWord(_projId)).Result;
            var shouldBeTrue = (bool)((ObjectResult)_wordController.IsFrontierNonempty(_projId).Result).Value;
            Assert.True(shouldBeTrue);
        }

        [Test]
        public void TestGetFrontier()
        {
            var inWord1 = _wordRepo.Create(Util.RandomWord(_projId)).Result;
            var inWord2 = _wordRepo.Create(Util.RandomWord(_projId)).Result;
            _ = _wordRepo.Create(Util.RandomWord("OTHER_PROJECT")).Result;

            var frontier = (List<Word>)((ObjectResult)_wordController.GetProjectFrontierWords(_projId).Result).Value;
            Assert.That(frontier, Has.Count.EqualTo(2));
            Assert.Contains(inWord1, frontier);
            Assert.Contains(inWord2, frontier);
        }

        [Test]
        public void TestGetMissingId()
        {
            const string missingId = "NEITHER_PROJ_NOR_WORD_ID";

            var wordProjResult = _wordController.GetProjectWords(missingId).Result;
            Assert.IsInstanceOf<NotFoundObjectResult>(wordProjResult);

            var wordResult = _wordController.GetWord(_projId, missingId).Result;
            Assert.IsInstanceOf<NotFoundObjectResult>(wordResult);

            var frontierProjResult = _wordController.GetProjectFrontierWords(missingId).Result;
            Assert.IsInstanceOf<NotFoundObjectResult>(frontierProjResult);
        }

        [Test]
        public void TestGetWord()
        {
            var word = _wordRepo.Create(Util.RandomWord(_projId)).Result;

            _wordRepo.Create(Util.RandomWord(_projId));
            _wordRepo.Create(Util.RandomWord(_projId));

            var action = _wordController.GetWord(_projId, word.Id).Result;
            Assert.IsInstanceOf<ObjectResult>(action);

            var foundWord = (Word)((ObjectResult)action).Value;
            Assert.AreEqual(word, foundWord);
        }

        [Test]
        public void TestAddWord()
        {
            var word = Util.RandomWord(_projId);

            var id = (string)((ObjectResult)_wordController.CreateWord(_projId, word).Result).Value;
            word.Id = id;

            Assert.AreEqual(word, _wordRepo.GetAllWords(_projId).Result[0]);
            Assert.AreEqual(word, _wordRepo.GetFrontier(_projId).Result[0]);

            var oldDuplicate = Util.RandomWord(_projId);
            var newDuplicate = oldDuplicate.Clone();

            _ = _wordController.CreateWord(_projId, oldDuplicate).Result;
            var result = (string)((ObjectResult)_wordController.CreateWord(_projId, newDuplicate).Result).Value;
            Assert.AreEqual(result, "Duplicate");

            newDuplicate.Senses.RemoveAt(2);
            result = (string)((ObjectResult)_wordController.CreateWord(_projId, newDuplicate).Result).Value;
            Assert.AreEqual(result, "Duplicate");

            newDuplicate.Senses = new List<Sense>();
            result = (string)((ObjectResult)_wordController.CreateWord(_projId, newDuplicate).Result).Value;
            Assert.AreNotEqual(result, "Duplicate");
        }

        [Test]
        public void TestUpdateWord()
        {
            var origWord = _wordRepo.Create(Util.RandomWord(_projId)).Result;

            var modWord = origWord.Clone();
            modWord.Vernacular = "NewVernacular";

            var id = (string)((ObjectResult)_wordController.UpdateWord(_projId, modWord.Id, modWord).Result).Value;

            var finalWord = modWord.Clone();
            finalWord.Id = id;
            finalWord.History = new List<string> { origWord.Id };

            Assert.Contains(origWord, _wordRepo.GetAllWords(_projId).Result);
            Assert.Contains(finalWord, _wordRepo.GetAllWords(_projId).Result);

            Assert.That(_wordRepo.GetFrontier(_projId).Result, Has.Count.EqualTo(1));
            Assert.Contains(finalWord, _wordRepo.GetFrontier(_projId).Result);
        }
    }
}
