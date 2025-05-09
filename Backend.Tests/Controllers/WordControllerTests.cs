using System;
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
    public class WordControllerTests : IDisposable
    {
        private IProjectRepository _projRepo = null!;
        private IWordRepository _wordRepo = null!;
        private IPermissionService _permissionService = null!;
        private IWordService _wordService = null!;
        private WordController _wordController = null!;

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (disposing)
            {
                _wordController?.Dispose();
            }
        }

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
        public async Task TestAreInFrontier()
        {
            var wordNotInFrontier = await _wordRepo.Add(Util.RandomWord(_projId));
            var emptyResult = await _wordController.AreInFrontier(_projId, new() { wordNotInFrontier.Id, "non-id" });
            Assert.That(((ObjectResult)emptyResult).Value, Is.Empty);

            var wordInFrontier = await _wordRepo.AddFrontier(Util.RandomWord(_projId));
            var nonemptyResult = await _wordController.AreInFrontier(_projId, new() { wordInFrontier.Id, "non-id" });
            Assert.That(((OkObjectResult)nonemptyResult).Value, Is.EqualTo(new List<string> { wordInFrontier.Id }));
        }

        [Test]
        public async Task TestAreInFrontierNoPermission()
        {
            var wordInFrontier = await _wordRepo.AddFrontier(Util.RandomWord(_projId));
            _wordController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = await _wordController.AreInFrontier(_projId, new() { wordInFrontier.Id });
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestAreInFrontierMissingProject()
        {
            var result = await _wordController.AreInFrontier(MissingId, new());
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
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
                w.Accessibility == Status.Deleted));
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
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestDeleteFrontierWordMissingIds()
        {
            var wordToDelete = await _wordRepo.Create(Util.RandomWord(_projId));

            var projectResult = await _wordController.DeleteFrontierWord(MissingId, wordToDelete.Id);
            Assert.That(projectResult, Is.InstanceOf<NotFoundObjectResult>());

            var wordResult = await _wordController.DeleteFrontierWord(_projId, MissingId);
            Assert.That(wordResult, Is.InstanceOf<NotFoundObjectResult>());
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
            var repoWords = await _wordRepo.GetAllWords(_projId);
            repoWords.ForEach(word => Assert.That(words, Does.Contain(word).UsingPropertiesComparer()));
        }

        [Test]
        public async Task TestGetAllWordsNoPermission()
        {
            _wordController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = await _wordController.GetProjectWords(_projId);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestGetAllWordsMissingProject()
        {
            var result = await _wordController.GetProjectWords(MissingId);
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task TestHasFrontierWords()
        {
            await _wordRepo.Create(Util.RandomWord("OTHER_PROJECT"));
            var falseResult = (ObjectResult)await _wordController.HasFrontierWords(_projId);
            Assert.That(falseResult.Value, Is.False);

            await _wordRepo.Create(Util.RandomWord(_projId));
            var trueResult = (ObjectResult)await _wordController.HasFrontierWords(_projId);
            Assert.That(trueResult.Value, Is.True);
        }

        [Test]
        public async Task TestHasFrontierWordsNoPermission()
        {
            _wordController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = await _wordController.HasFrontierWords(_projId);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestHasFrontierWordsMissingProject()
        {
            var result = await _wordController.HasFrontierWords(MissingId);
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task TestIsInFrontier()
        {
            var wordNotInFrontier = await _wordRepo.Add(Util.RandomWord(_projId));
            var falseResult = (ObjectResult)await _wordController.IsInFrontier(_projId, wordNotInFrontier.Id);
            Assert.That(falseResult.Value, Is.False);

            var wordInFrontier = await _wordRepo.AddFrontier(Util.RandomWord(_projId));
            var trueResult = (ObjectResult)await _wordController.IsInFrontier(_projId, wordInFrontier.Id);
            Assert.That(trueResult.Value, Is.True);
        }

        [Test]
        public async Task TestIsInFrontierNoPermission()
        {
            var wordInFrontier = await _wordRepo.AddFrontier(Util.RandomWord(_projId));
            _wordController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = await _wordController.IsInFrontier(_projId, wordInFrontier.Id);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestIsInFrontierMissingProject()
        {
            var result = await _wordController.IsInFrontier(MissingId, "anything");
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task TestGetFrontier()
        {
            var inWord1 = await _wordRepo.Create(Util.RandomWord(_projId));
            var inWord2 = await _wordRepo.Create(Util.RandomWord(_projId));
            await _wordRepo.Create(Util.RandomWord("OTHER_PROJECT"));

            var frontier = (List<Word>)((ObjectResult)await _wordController.GetProjectFrontierWords(_projId)).Value!;
            Assert.That(frontier, Has.Count.EqualTo(2));
            Assert.That(frontier, Does.Contain(inWord1).UsingPropertiesComparer());
            Assert.That(frontier, Does.Contain(inWord2).UsingPropertiesComparer());
        }

        [Test]
        public async Task TestGetFrontierNoPermission()
        {
            _wordController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = await _wordController.GetProjectFrontierWords(_projId);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestGetFrontierMissingProject()
        {
            var result = await _wordController.GetProjectFrontierWords(MissingId);
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task TestGetWord()
        {
            var word = await _wordRepo.Create(Util.RandomWord(_projId));

            await _wordRepo.Create(Util.RandomWord(_projId));
            await _wordRepo.Create(Util.RandomWord(_projId));

            var result = await _wordController.GetWord(_projId, word.Id);
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            Assert.That(((ObjectResult)result).Value, Is.EqualTo(word).UsingPropertiesComparer());
        }

        [Test]
        public async Task TestGetWordNoPermission()
        {
            _wordController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            var word = await _wordRepo.Create(Util.RandomWord(_projId));
            var result = await _wordController.GetWord(_projId, word.Id);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestGetWordMissingProject()
        {
            var word = await _wordRepo.Create(Util.RandomWord(_projId));
            var result = await _wordController.GetWord(MissingId, word.Id);
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task TestGetDuplicateId()
        {
            var word = await _wordRepo.Create(Util.RandomWord(_projId));
            var result = await _wordController.GetDuplicateId(_projId, word);
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            Assert.That(((ObjectResult)result).Value, Is.EqualTo(word.Id));
        }

        [Test]
        public async Task TestGetDuplicateIdNoneFound()
        {
            var word = Util.RandomWord(_projId);
            var result = await _wordController.GetDuplicateId(_projId, word);
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            Assert.That(((ObjectResult)result).Value, Is.EqualTo(""));
        }

        [Test]
        public async Task TestGetDuplicateIdNoPermission()
        {
            _wordController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            var word = Util.RandomWord(_projId);
            var result = await _wordController.GetDuplicateId(_projId, word);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestGetDuplicateIdMissingProject()
        {
            var word = Util.RandomWord(_projId);
            var result = await _wordController.GetDuplicateId(MissingId, word);
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task TestRevertWords()
        {
            var frontierWord0 = await _wordRepo.Create(Util.RandomWord(_projId));
            var frontierWord1 = await _wordRepo.AddFrontier(Util.RandomWord(_projId));
            var nonFrontierWord0 = await _wordRepo.Add(Util.RandomWord(_projId));
            var nonFrontierWord1 = await _wordRepo.Add(Util.RandomWord(_projId));
            var nonFrontierWord2 = await _wordRepo.Add(Util.RandomWord(_projId));

            var result = await _wordController.RevertWords(_projId, new()
            {
                ["non-id"] = frontierWord1.Id, // Cannot revert with key not a word
                [nonFrontierWord1.Id] = nonFrontierWord2.Id, // Cannot revert with value not in frontier
                [nonFrontierWord0.Id] = frontierWord0.Id, // Can revert
            });
            var reverted = (Dictionary<string, string>)((OkObjectResult)result).Value!;
            Assert.That(reverted, Has.Count.EqualTo(1));
            var frontierIds = (await _wordRepo.GetFrontier(_projId)).Select(w => w.Id).ToList();
            Assert.That(frontierIds, Has.Count.EqualTo(2));
            Assert.That(frontierIds, Does.Contain(frontierWord1.Id));
            Assert.That(frontierIds, Does.Contain(reverted[frontierWord0.Id]));
        }

        [Test]
        public async Task TestRevertWordsNoPermission()
        {
            _wordController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            var oldWord = await _wordRepo.Add(Util.RandomWord(_projId));
            var newWord = await _wordRepo.Create(Util.RandomWord(_projId));
            var result = await _wordController.RevertWords(_projId, new() { [oldWord.Id] = newWord.Id });
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestRevertWordsMissingProject()
        {
            var oldWord = await _wordRepo.Add(Util.RandomWord(_projId));
            var newWord = await _wordRepo.Create(Util.RandomWord(_projId));
            var result = await _wordController.RevertWords(MissingId, new() { [oldWord.Id] = newWord.Id });
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task TestUpdateDuplicate()
        {
            var origWord = await _wordRepo.Create(Util.RandomWord(_projId));
            var dupWord = origWord.Clone();
            dupWord.Flag = new Flag("New Flag");
            var expectedWord = dupWord.Clone();
            var result = (ObjectResult)await _wordController.UpdateDuplicate(_projId, origWord.Id, dupWord);
            var id = (string)result.Value!;
            var updatedWord = await _wordRepo.GetWord(_projId, id);
            Util.AssertEqualWordContent(updatedWord!, expectedWord, true);
        }

        [Test]
        public async Task TestUpdateDuplicateNoPermission()
        {
            _wordController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            var word = await _wordRepo.Create(Util.RandomWord(_projId));
            var result = await _wordController.UpdateDuplicate(_projId, word.Id, word);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestUpdateDuplicateMissingProject()
        {
            var word = await _wordRepo.Create(Util.RandomWord(_projId));
            var result = await _wordController.UpdateDuplicate(MissingId, word.Id, word);
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task TestUpdateDuplicateMissingWord()
        {
            var word = Util.RandomWord(_projId);
            var result = await _wordController.UpdateDuplicate(_projId, MissingId, word);
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task TestUpdateDuplicateNonDuplicate()
        {
            var origWord = await _wordRepo.Create(Util.RandomWord(_projId));
            var nonDup = origWord.Clone();
            nonDup.Vernacular = "differentVern";
            var result = await _wordController.UpdateDuplicate(_projId, origWord.Id, nonDup);
            Assert.That(result, Is.InstanceOf<ConflictResult>());
        }

        [Test]
        public async Task TestCreateWord()
        {
            var word = Util.RandomWord(_projId);

            var id = (string)((ObjectResult)await _wordController.CreateWord(_projId, word)).Value!;
            word.Id = id;

            var allWords = await _wordRepo.GetAllWords(_projId);
            Assert.That(allWords[0], Is.EqualTo(word).UsingPropertiesComparer());

            var frontier = await _wordRepo.GetFrontier(_projId);
            Assert.That(frontier[0], Is.EqualTo(word).UsingPropertiesComparer());
        }

        [Test]
        public async Task TestCreateWordNoPermission()
        {
            _wordController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            var word = Util.RandomWord(_projId);
            var result = await _wordController.CreateWord(_projId, word);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestCreateWordMissingProject()
        {
            var word = Util.RandomWord(_projId);
            var result = await _wordController.CreateWord(MissingId, word);
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
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

            var allWords = await _wordRepo.GetAllWords(_projId);
            Assert.That(allWords, Does.Contain(origWord).UsingPropertiesComparer());
            Assert.That(allWords, Does.Contain(finalWord).UsingPropertiesComparer());

            var frontier = await _wordRepo.GetFrontier(_projId);
            Assert.That(frontier, Has.Count.EqualTo(1));
            Assert.That(frontier, Does.Contain(finalWord).UsingPropertiesComparer());
        }

        [Test]
        public async Task TestUpdateWordNoPermission()
        {
            _wordController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            var origWord = await _wordRepo.Create(Util.RandomWord(_projId));
            var modWord = origWord.Clone();
            modWord.Vernacular = "NewVernacular";
            var result = await _wordController.UpdateWord(_projId, modWord.Id, modWord);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestUpdateWordMissingIds()
        {
            var origWord = await _wordRepo.Create(Util.RandomWord(_projId));
            var modWord = origWord.Clone();
            modWord.Vernacular = "NewVernacular";
            var projectResult = await _wordController.UpdateWord(MissingId, modWord.Id, modWord);
            Assert.That(projectResult, Is.InstanceOf<NotFoundObjectResult>());

            var wordResult = await _wordController.UpdateWord(_projId, MissingId, modWord);
            Assert.That(wordResult, Is.InstanceOf<NotFoundObjectResult>());
        }
    }
}
