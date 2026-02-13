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
    internal sealed class WordControllerTests : IDisposable
    {
        private IWordRepository _wordRepo = null!;
        private IPermissionService _permissionService = null!;
        private IWordService _wordService = null!;
        private WordController _wordController = null!;

        public void Dispose()
        {
            _wordController?.Dispose();
            GC.SuppressFinalize(this);
        }

        private const string ProjId = "PROJECT_ID";
        private const string MissingId = "MISSING_ID";

        [SetUp]
        public void Setup()
        {
            _wordRepo = new WordRepositoryMock();
            _wordService = new WordService(_wordRepo);
            _permissionService = new PermissionServiceMock();
            _wordController = new WordController(_wordRepo, _wordService, _permissionService);
        }

        [Test]
        public async Task TestAreInFrontier()
        {
            var wordNotInFrontier = await _wordRepo.Add(Util.RandomWord(ProjId));
            var emptyResult = await _wordController.AreInFrontier(ProjId, [wordNotInFrontier.Id, "non-id"]);
            Assert.That(((ObjectResult)emptyResult).Value, Is.Empty);

            var wordInFrontier = await _wordRepo.AddFrontier(Util.RandomWord(ProjId));
            var nonemptyResult = await _wordController.AreInFrontier(ProjId, [wordInFrontier.Id, "non-id"]);
            Assert.That(((OkObjectResult)nonemptyResult).Value, Is.EqualTo(new List<string> { wordInFrontier.Id }));
        }

        [Test]
        public async Task TestAreInFrontierNoPermission()
        {
            var wordInFrontier = await _wordRepo.AddFrontier(Util.RandomWord(ProjId));
            _wordController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = await _wordController.AreInFrontier(ProjId, [wordInFrontier.Id]);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestDeleteFrontierWord()
        {
            var wordToDelete = await _wordRepo.Create(Util.RandomWord(ProjId));
            var otherWord = await _wordRepo.Create(Util.RandomWord(ProjId));

            await _wordController.DeleteFrontierWord(ProjId, wordToDelete.Id);
            var updatedWords = await _wordRepo.GetAllWords(ProjId);
            Assert.That(updatedWords, Has.Count.EqualTo(3));
            updatedWords.ForEach(w => Assert.That(
                w.Id == wordToDelete.Id ||
                w.Id == otherWord.Id ||
                w.Accessibility == Status.Deleted));
            var updatedFrontier = await _wordRepo.GetAllFrontier(ProjId);
            Assert.That(updatedFrontier, Has.Count.EqualTo(1));
            Assert.That(updatedFrontier.First().Id, Is.EqualTo(otherWord.Id));
        }

        [Test]
        public async Task TestDeleteFrontierWordNoPermission()
        {
            _wordController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var wordToDelete = await _wordRepo.Create(Util.RandomWord(ProjId));
            var result = await _wordController.DeleteFrontierWord(ProjId, wordToDelete.Id);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestDeleteFrontierWordMissingWord()
        {
            var wordResult = await _wordController.DeleteFrontierWord(ProjId, MissingId);
            Assert.That(wordResult, Is.InstanceOf<NotFoundResult>());
        }

        [Test]
        public async Task TestHasFrontierWords()
        {
            await _wordRepo.Create(Util.RandomWord("OTHER_PROJECT"));
            var falseResult = (ObjectResult)await _wordController.HasFrontierWords(ProjId);
            Assert.That(falseResult.Value, Is.False);

            await _wordRepo.Create(Util.RandomWord(ProjId));
            var trueResult = (ObjectResult)await _wordController.HasFrontierWords(ProjId);
            Assert.That(trueResult.Value, Is.True);
        }

        [Test]
        public async Task TestHasFrontierWordsNoPermission()
        {
            _wordController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = await _wordController.HasFrontierWords(ProjId);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestIsInFrontier()
        {
            var wordNotInFrontier = await _wordRepo.Add(Util.RandomWord(ProjId));
            var falseResult = (ObjectResult)await _wordController.IsInFrontier(ProjId, wordNotInFrontier.Id);
            Assert.That(falseResult.Value, Is.False);

            var wordInFrontier = await _wordRepo.AddFrontier(Util.RandomWord(ProjId));
            var trueResult = (ObjectResult)await _wordController.IsInFrontier(ProjId, wordInFrontier.Id);
            Assert.That(trueResult.Value, Is.True);
        }

        [Test]
        public async Task TestIsInFrontierNoPermission()
        {
            var wordInFrontier = await _wordRepo.AddFrontier(Util.RandomWord(ProjId));
            _wordController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = await _wordController.IsInFrontier(ProjId, wordInFrontier.Id);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestGetFrontierCount()
        {
            await _wordRepo.Create(Util.RandomWord(ProjId));
            await _wordRepo.Create(Util.RandomWord(ProjId));
            await _wordRepo.Create(Util.RandomWord("OTHER_PROJECT"));

            var count = (int)((ObjectResult)await _wordController.GetFrontierCount(ProjId)).Value!;
            Assert.That(count, Is.EqualTo(2));
        }

        [Test]
        public async Task TestGetFrontierCountNoPermission()
        {
            _wordController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = await _wordController.GetFrontierCount(ProjId);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestGetFrontier()
        {
            var inWord1 = await _wordRepo.Create(Util.RandomWord(ProjId));
            var inWord2 = await _wordRepo.Create(Util.RandomWord(ProjId));
            await _wordRepo.Create(Util.RandomWord("OTHER_PROJECT"));

            var frontier = (List<Word>)((ObjectResult)await _wordController.GetProjectFrontierWords(ProjId)).Value!;
            Assert.That(frontier, Has.Count.EqualTo(2));
            Assert.That(frontier, Does.Contain(inWord1).UsingPropertiesComparer());
            Assert.That(frontier, Does.Contain(inWord2).UsingPropertiesComparer());
        }

        [Test]
        public async Task TestGetFrontierNoPermission()
        {
            _wordController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = await _wordController.GetProjectFrontierWords(ProjId);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestGetWord()
        {
            var word = await _wordRepo.Create(Util.RandomWord(ProjId));

            await _wordRepo.Create(Util.RandomWord(ProjId));
            await _wordRepo.Create(Util.RandomWord(ProjId));

            var result = await _wordController.GetWord(ProjId, word.Id);
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            Assert.That(((ObjectResult)result).Value, Is.EqualTo(word).UsingPropertiesComparer());
        }

        [Test]
        public async Task TestGetWordNoWord()
        {
            var result = await _wordController.GetWord(ProjId, MissingId);
            Assert.That(result, Is.InstanceOf<NotFoundResult>());
        }

        [Test]
        public async Task TestGetWordNoPermission()
        {
            _wordController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            var word = await _wordRepo.Create(Util.RandomWord(ProjId));
            var result = await _wordController.GetWord(ProjId, word.Id);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestGetDuplicateId()
        {
            var word = await _wordRepo.Create(Util.RandomWord(ProjId));
            var result = await _wordController.GetDuplicateId(ProjId, word);
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            Assert.That(((ObjectResult)result).Value, Is.EqualTo(word.Id));
        }

        [Test]
        public async Task TestGetDuplicateIdNoneFound()
        {
            var word = Util.RandomWord(ProjId);
            var result = await _wordController.GetDuplicateId(ProjId, word);
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            Assert.That(((ObjectResult)result).Value, Is.EqualTo(""));
        }

        [Test]
        public async Task TestGetDuplicateIdNoPermission()
        {
            _wordController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            var word = Util.RandomWord(ProjId);
            var result = await _wordController.GetDuplicateId(ProjId, word);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestRevertWords()
        {
            var frontierWord0 = await _wordRepo.Create(Util.RandomWord(ProjId));
            var frontierWord1 = await _wordRepo.AddFrontier(Util.RandomWord(ProjId));
            var nonFrontierWord0 = await _wordRepo.Add(Util.RandomWord(ProjId));
            var nonFrontierWord1 = await _wordRepo.Add(Util.RandomWord(ProjId));
            var nonFrontierWord2 = await _wordRepo.Add(Util.RandomWord(ProjId));

            var result = await _wordController.RevertWords(ProjId, new()
            {
                ["non-id"] = frontierWord1.Id, // Cannot revert with key not a word
                [nonFrontierWord1.Id] = nonFrontierWord2.Id, // Cannot revert with value not in frontier
                [nonFrontierWord0.Id] = frontierWord0.Id, // Can revert
            });
            var reverted = (Dictionary<string, string>)((OkObjectResult)result).Value!;
            Assert.That(reverted, Has.Count.EqualTo(1));
            var frontierIds = (await _wordRepo.GetAllFrontier(ProjId)).Select(w => w.Id).ToList();
            Assert.That(frontierIds, Has.Count.EqualTo(2));
            Assert.That(frontierIds, Does.Contain(frontierWord1.Id));
            Assert.That(frontierIds, Does.Contain(reverted[frontierWord0.Id]));
        }

        [Test]
        public async Task TestRevertWordsNoPermission()
        {
            _wordController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            var oldWord = await _wordRepo.Add(Util.RandomWord(ProjId));
            var newWord = await _wordRepo.Create(Util.RandomWord(ProjId));
            var result = await _wordController.RevertWords(ProjId, new() { [oldWord.Id] = newWord.Id });
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestUpdateDuplicate()
        {
            var origWord = await _wordRepo.Create(Util.RandomWord(ProjId));
            var dupWord = origWord.Clone();
            dupWord.Flag = new Flag("New Flag");
            var expectedWord = dupWord.Clone();
            var result = (ObjectResult)await _wordController.UpdateDuplicate(ProjId, origWord.Id, dupWord);
            var id = (string)result.Value!;
            var updatedWord = await _wordRepo.GetWord(ProjId, id);
            Util.AssertEqualWordContent(updatedWord!, expectedWord, true);
        }

        [Test]
        public async Task TestUpdateDuplicateNoPermission()
        {
            _wordController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            var word = await _wordRepo.Create(Util.RandomWord(ProjId));
            var result = await _wordController.UpdateDuplicate(ProjId, word.Id, word);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestUpdateDuplicateMissingWord()
        {
            var word = Util.RandomWord(ProjId);
            var result = await _wordController.UpdateDuplicate(ProjId, MissingId, word);
            Assert.That(result, Is.InstanceOf<NotFoundResult>());
        }

        [Test]
        public async Task TestUpdateDuplicateNonDuplicate()
        {
            var origWord = await _wordRepo.Create(Util.RandomWord(ProjId));
            var nonDup = origWord.Clone();
            nonDup.Vernacular = "differentVern";
            var result = await _wordController.UpdateDuplicate(ProjId, origWord.Id, nonDup);
            Assert.That(result, Is.InstanceOf<ConflictResult>());
        }

        [Test]
        public async Task TestCreateWord()
        {
            var word = Util.RandomWord(ProjId);

            var id = (string)((ObjectResult)await _wordController.CreateWord(ProjId, word)).Value!;
            word.Id = id;

            var allWords = await _wordRepo.GetAllWords(ProjId);
            Assert.That(allWords[0], Is.EqualTo(word).UsingPropertiesComparer());

            var frontier = await _wordRepo.GetAllFrontier(ProjId);
            Assert.That(frontier[0], Is.EqualTo(word).UsingPropertiesComparer());
        }

        [Test]
        public async Task TestCreateWordNoPermission()
        {
            _wordController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            var word = Util.RandomWord(ProjId);
            var result = await _wordController.CreateWord(ProjId, word);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestUpdateWord()
        {
            var origWord = await _wordRepo.Create(Util.RandomWord(ProjId));

            var modWord = origWord.Clone();
            modWord.Vernacular = "NewVernacular";

            var id = (string)((ObjectResult)await _wordController.UpdateWord(
                ProjId, modWord.Id, modWord)).Value!;

            var finalWord = modWord.Clone();
            finalWord.Id = id;
            finalWord.History = new List<string> { origWord.Id };

            var allWords = await _wordRepo.GetAllWords(ProjId);
            Assert.That(allWords, Does.Contain(origWord).UsingPropertiesComparer());
            Assert.That(allWords, Does.Contain(finalWord).UsingPropertiesComparer());

            var frontier = await _wordRepo.GetAllFrontier(ProjId);
            Assert.That(frontier, Has.Count.EqualTo(1));
            Assert.That(frontier, Does.Contain(finalWord).UsingPropertiesComparer());
        }

        [Test]
        public async Task TestUpdateWordNoPermission()
        {
            _wordController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            var origWord = await _wordRepo.Create(Util.RandomWord(ProjId));
            var modWord = origWord.Clone();
            modWord.Vernacular = "NewVernacular";
            var result = await _wordController.UpdateWord(ProjId, modWord.Id, modWord);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestUpdateWordMissingWord()
        {
            var wordResult = await _wordController.UpdateWord(ProjId, MissingId, Util.RandomWord(ProjId));
            Assert.That(wordResult, Is.InstanceOf<NotFoundResult>());
        }

        [Test]
        public async Task TestRestoreWord()
        {
            var word = await _wordRepo.Create(Util.RandomWord(ProjId));
            await _wordRepo.DeleteFrontier(ProjId, word.Id);

            Assert.That(await _wordRepo.GetAllWords(ProjId), Does.Contain(word).UsingPropertiesComparer());
            Assert.That(await _wordRepo.GetAllFrontier(ProjId), Is.Empty);

            var result = await _wordController.RestoreWord(ProjId, word.Id);

            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            Assert.That(((OkObjectResult)result).Value, Is.True);
            Assert.That(await _wordRepo.GetAllWords(ProjId), Does.Contain(word).UsingPropertiesComparer());
            Assert.That(await _wordRepo.GetAllFrontier(ProjId), Does.Contain(word).UsingPropertiesComparer());
        }

        [Test]
        public async Task TestRestoreWordAlreadyInFrontier()
        {
            var word = await _wordRepo.Create(Util.RandomWord(ProjId));

            Assert.That(await _wordRepo.GetAllWords(ProjId), Does.Contain(word).UsingPropertiesComparer());
            Assert.That(await _wordRepo.GetAllFrontier(ProjId), Does.Contain(word).UsingPropertiesComparer());
            var frontierCount = await _wordRepo.GetFrontierCount(ProjId);

            var result = await _wordController.RestoreWord(ProjId, word.Id);

            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            Assert.That(((OkObjectResult)result).Value, Is.False);
            Assert.That(await _wordRepo.GetFrontierCount(ProjId), Is.EqualTo(frontierCount));
        }

        [Test]
        public async Task TestRestoreWordNoPermission()
        {
            _wordController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            var wordId = (await _wordRepo.Create(Util.RandomWord(ProjId))).Id;
            var result = await _wordController.RestoreWord(ProjId, wordId);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestRestoreWordMissingWord()
        {
            var wordResult = await _wordController.RestoreWord(ProjId, MissingId);
            Assert.That(wordResult, Is.InstanceOf<NotFoundResult>());
        }

        [Test]
        public async Task TestGetDomainWordCountNoPermission()
        {
            _wordController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            var result = await _wordController.GetDomainWordCount(ProjId, "1");
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestGetDomainWordCount()
        {
            var result = await _wordController.GetDomainWordCount(ProjId, "1");
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
        }
    }
}
