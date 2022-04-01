using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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
        private const string MissingId = "MISSING_ID";

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
        public async Task TestDeleteAllWords()
        {
            await _wordRepo.Create(Util.RandomWord(_projId));
            await _wordRepo.Create(Util.RandomWord(_projId));
            const string diffProjId = "OTHER_PROJECT";
            await _wordRepo.Create(Util.RandomWord(diffProjId));

            await _wordController.DeleteProjectWords(_projId);
            Assert.That(await _wordRepo.GetAllWords(_projId), Has.Count.Zero);
            Assert.That(await _wordRepo.GetFrontier(_projId), Has.Count.Zero);
            Assert.That(await _wordRepo.GetAllWords(diffProjId), Has.Count.EqualTo(1));
            Assert.That(await _wordRepo.GetFrontier(diffProjId), Has.Count.EqualTo(1));
        }

        [Test]
        public async Task TestDeleteAllWordsNoPermission()
        {
            _wordController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = await _wordController.DeleteProjectWords(_projId);
            Assert.IsInstanceOf<ForbidResult>(result);
        }

        [Test]
        public async Task TestDeleteAllWordsMissingProject()
        {
            var result = await _wordController.DeleteProjectWords(MissingId);
            Assert.IsInstanceOf<NotFoundObjectResult>(result);
        }

        [Test]
        public async Task TestDeleteFrontierWord()
        {
            var wordToDelete = await _wordRepo.Create(Util.RandomWord(_projId));
            var otherWord = await _wordRepo.Create(Util.RandomWord(_projId));

            await _wordController.DeleteFrontierWord(_projId, wordToDelete.Id);
            var updatedWords = await _wordRepo.GetAllWords(_projId);
            Assert.That(updatedWords, Has.Count.EqualTo(3));
            updatedWords.ForEach(w => Assert.That(
                w.Id == wordToDelete.Id ||
                w.Id == otherWord.Id ||
                w.Accessibility == State.Deleted));
            var updatedFrontier = await _wordRepo.GetFrontier(_projId);
            Assert.That(updatedFrontier, Has.Count.EqualTo(1));
            Assert.That(updatedFrontier.First().Id, Is.EqualTo(otherWord.Id));
        }

        [Test]
        public async Task TestDeleteFrontierWordNoPermission()
        {
            _wordController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var wordToDelete = await _wordRepo.Create(Util.RandomWord(_projId));
            var result = await _wordController.DeleteFrontierWord(_projId, wordToDelete.Id);
            Assert.IsInstanceOf<ForbidResult>(result);
        }

        [Test]
        public async Task TestDeleteFrontierWordMissingIds()
        {
            var wordToDelete = await _wordRepo.Create(Util.RandomWord(_projId));

            var projectResult = await _wordController.DeleteFrontierWord(MissingId, wordToDelete.Id);
            Assert.IsInstanceOf<NotFoundObjectResult>(projectResult);

            var wordResult = await _wordController.DeleteFrontierWord(_projId, MissingId);
            Assert.IsInstanceOf<NotFoundObjectResult>(wordResult);
        }

        [Test]
        public async Task TestGetAllWords()
        {
            await _wordRepo.Create(Util.RandomWord(_projId));
            await _wordRepo.Create(Util.RandomWord(_projId));
            await _wordRepo.Create(Util.RandomWord(_projId));
            await _wordRepo.Create(Util.RandomWord("OTHER_PROJECT"));

            var words = (List<Word>)((ObjectResult)await _wordController.GetProjectWords(_projId)).Value!;
            Assert.That(words, Has.Count.EqualTo(3));
            (await _wordRepo.GetAllWords(_projId)).ForEach(word => Assert.Contains(word, words));
        }

        [Test]
        public async Task TestGetAllWordsNoPermission()
        {
            _wordController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = await _wordController.GetProjectWords(_projId);
            Assert.IsInstanceOf<ForbidResult>(result);
        }

        [Test]
        public async Task TestGetAllWordsMissingProject()
        {
            var result = await _wordController.GetProjectWords(MissingId);
            Assert.IsInstanceOf<NotFoundObjectResult>(result);
        }

        [Test]
        public async Task TestIsFrontierNonempty()
        {
            await _wordRepo.Create(Util.RandomWord("OTHER_PROJECT"));
            var shouldBeFalse = (bool)((ObjectResult)await _wordController.IsFrontierNonempty(_projId)).Value!;
            Assert.False(shouldBeFalse);
            await _wordRepo.Create(Util.RandomWord(_projId));
            var shouldBeTrue = (bool)((ObjectResult)await _wordController.IsFrontierNonempty(_projId)).Value!;
            Assert.True(shouldBeTrue);
        }

        [Test]
        public async Task TestIsFrontierNonemptyNoPermission()
        {
            _wordController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = await _wordController.IsFrontierNonempty(_projId);
            Assert.IsInstanceOf<ForbidResult>(result);
        }

        [Test]
        public async Task TestIsFrontierNonemptyMissingProject()
        {
            var result = await _wordController.IsFrontierNonempty(MissingId);
            Assert.IsInstanceOf<NotFoundObjectResult>(result);
        }

        [Test]
        public async Task TestGetFrontier()
        {
            var inWord1 = await _wordRepo.Create(Util.RandomWord(_projId));
            var inWord2 = await _wordRepo.Create(Util.RandomWord(_projId));
            await _wordRepo.Create(Util.RandomWord("OTHER_PROJECT"));

            var frontier = (List<Word>)((ObjectResult)await _wordController.GetProjectFrontierWords(_projId)).Value!;
            Assert.That(frontier, Has.Count.EqualTo(2));
            Assert.Contains(inWord1, frontier);
            Assert.Contains(inWord2, frontier);
        }

        [Test]
        public async Task TestGetFrontierNoPermission()
        {
            _wordController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = await _wordController.GetProjectFrontierWords(_projId);
            Assert.IsInstanceOf<ForbidResult>(result);
        }

        [Test]
        public async Task TestGetFrontierMissingProject()
        {
            var result = await _wordController.GetProjectFrontierWords(MissingId);
            Assert.IsInstanceOf<NotFoundObjectResult>(result);
        }

        [Test]
        public async Task TestGetWord()
        {
            var word = await _wordRepo.Create(Util.RandomWord(_projId));

            await _wordRepo.Create(Util.RandomWord(_projId));
            await _wordRepo.Create(Util.RandomWord(_projId));

            var action = await _wordController.GetWord(_projId, word.Id);
            Assert.IsInstanceOf<ObjectResult>(action);

            var foundWord = (Word)((ObjectResult)action).Value!;
            Assert.That(word, Is.EqualTo(foundWord));
        }

        [Test]
        public async Task TestGetWordNoPermission()
        {
            _wordController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            var word = await _wordRepo.Create(Util.RandomWord(_projId));
            var result = await _wordController.GetWord(_projId, word.Id);
            Assert.IsInstanceOf<ForbidResult>(result);
        }

        [Test]
        public async Task TestGetWordMissingProject()
        {
            var word = await _wordRepo.Create(Util.RandomWord(_projId));
            var result = await _wordController.GetWord(MissingId, word.Id);
            Assert.IsInstanceOf<NotFoundObjectResult>(result);
        }

        [Test]
        public async Task TestGetDuplicateId()
        {
            var word = await _wordRepo.Create(Util.RandomWord(_projId));
            var id = (string)((ObjectResult)await _wordController.GetDuplicateId(_projId, word)).Value!;
            Assert.That(id, Is.EqualTo(word.Id));
        }

        [Test]
        public async Task TestGetDuplicateIdNoneFound()
        {
            var word = Util.RandomWord(_projId);
            var id = (string)((ObjectResult)await _wordController.GetDuplicateId(_projId, word)).Value!;
            Assert.That(id, Is.EqualTo(""));
        }

        [Test]
        public async Task TestGetDuplicateIdNoPermission()
        {
            _wordController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            var word = Util.RandomWord(_projId);
            var result = await _wordController.GetDuplicateId(_projId, word);
            Assert.IsInstanceOf<ForbidResult>(result);
        }

        [Test]
        public async Task TestGetDuplicateIdMissingProject()
        {
            var word = Util.RandomWord(_projId);
            var result = await _wordController.GetDuplicateId(MissingId, word);
            Assert.IsInstanceOf<NotFoundObjectResult>(result);
        }

        [Test]
        public async Task TestUpdateDuplicate()
        {
            var origWord = await _wordRepo.Create(Util.RandomWord(_projId));
            var dupWord = origWord.Clone();
            dupWord.Flag = new Flag("New Flag");
            var expectedWord = dupWord.Clone();
            var id = (string)((ObjectResult)await _wordController.UpdateDuplicate(_projId, origWord.Id, dupWord)).Value!;
            var updatedWord = await _wordRepo.GetWord(_projId, id);
            Assert.That(expectedWord.ContentEquals(updatedWord!));
        }

        [Test]
        public async Task TestUpdateDuplicateNoPermission()
        {
            _wordController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            var word = await _wordRepo.Create(Util.RandomWord(_projId));
            var result = await _wordController.UpdateDuplicate(_projId, word.Id, word);
            Assert.IsInstanceOf<ForbidResult>(result);
        }

        [Test]
        public async Task TestUpdateDuplicateMissingProject()
        {
            var word = await _wordRepo.Create(Util.RandomWord(_projId));
            var result = await _wordController.UpdateDuplicate(MissingId, word.Id, word);
            Assert.IsInstanceOf<NotFoundObjectResult>(result);
        }

        [Test]
        public async Task TestUpdateDuplicateMissingWord()
        {
            var word = Util.RandomWord(_projId);
            var result = await _wordController.UpdateDuplicate(_projId, MissingId, word);
            Assert.IsInstanceOf<NotFoundObjectResult>(result);
        }

        [Test]
        public async Task TestUpdateDuplicateNonDuplicate()
        {
            var origWord = await _wordRepo.Create(Util.RandomWord(_projId));
            var nonDup = origWord.Clone();
            nonDup.Vernacular = "differentVern";
            var result = await _wordController.UpdateDuplicate(_projId, origWord.Id, nonDup);
            Assert.IsInstanceOf<ConflictResult>(result);
        }

        [Test]
        public async Task TestCreateWord()
        {
            var word = Util.RandomWord(_projId);

            var id = (string)((ObjectResult)await _wordController.CreateWord(_projId, word)).Value!;
            word.Id = id;

            Assert.That(word, Is.EqualTo((await _wordRepo.GetAllWords(_projId))[0]));
            Assert.That(word, Is.EqualTo((await _wordRepo.GetFrontier(_projId))[0]));
        }

        [Test]
        public async Task TestCreateWordNoPermission()
        {
            _wordController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            var word = Util.RandomWord(_projId);
            var result = await _wordController.CreateWord(_projId, word);
            Assert.IsInstanceOf<ForbidResult>(result);
        }

        [Test]
        public async Task TestCreateWordMissingProject()
        {
            var word = Util.RandomWord(_projId);
            var result = await _wordController.CreateWord(MissingId, word);
            Assert.IsInstanceOf<NotFoundObjectResult>(result);
        }

        [Test]
        public async Task TestUpdateWord()
        {
            var origWord = await _wordRepo.Create(Util.RandomWord(_projId));

            var modWord = origWord.Clone();
            modWord.Vernacular = "NewVernacular";

            var id = (string)((ObjectResult)await _wordController.UpdateWord(
                _projId, modWord.Id, modWord)).Value!;

            var finalWord = modWord.Clone();
            finalWord.Id = id;
            finalWord.History = new List<string> { origWord.Id };

            Assert.Contains(origWord, await _wordRepo.GetAllWords(_projId));
            Assert.Contains(finalWord, await _wordRepo.GetAllWords(_projId));

            Assert.That(await _wordRepo.GetFrontier(_projId), Has.Count.EqualTo(1));
            Assert.Contains(finalWord, await _wordRepo.GetFrontier(_projId));
        }

        [Test]
        public async Task TestUpdateWordNoPermission()
        {
            _wordController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            var origWord = await _wordRepo.Create(Util.RandomWord(_projId));
            var modWord = origWord.Clone();
            modWord.Vernacular = "NewVernacular";
            var result = await _wordController.UpdateWord(_projId, modWord.Id, modWord);
            Assert.IsInstanceOf<ForbidResult>(result);
        }

        [Test]
        public async Task TestUpdateWordMissingIds()
        {
            var origWord = await _wordRepo.Create(Util.RandomWord(_projId));
            var modWord = origWord.Clone();
            modWord.Vernacular = "NewVernacular";
            var projectResult = await _wordController.UpdateWord(MissingId, modWord.Id, modWord);
            Assert.IsInstanceOf<NotFoundObjectResult>(projectResult);

            var wordResult = await _wordController.UpdateWord(_projId, MissingId, modWord);
            Assert.IsInstanceOf<NotFoundObjectResult>(wordResult);
        }
    }
}
