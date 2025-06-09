using System;
using System.Collections.Generic;
using System.Linq;
using Backend.Tests.Mocks;
using BackendFramework.Controllers;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Services;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;

namespace Backend.Tests.Controllers
{
    public class MergeControllerTests : IDisposable
    {
        private IMergeBlacklistRepository _mergeBlacklistRepo = null!;
        private IMergeGraylistRepository _mergeGraylistRepo = null!;
        private IWordRepository _wordRepo = null!;
        private IMergeService _mergeService = null!;
        private IWordService _wordService = null!;
        private MergeController _mergeController = null!;

        private const string ProjId = "MergeServiceTestProjId";

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (disposing)
            {
                _mergeController?.Dispose();
            }
        }

        [SetUp]
        public void Setup()
        {
            _mergeBlacklistRepo = new MergeBlacklistRepositoryMock();
            _mergeGraylistRepo = new MergeGraylistRepositoryMock();
            _wordRepo = new WordRepositoryMock();
            _wordService = new WordService(_wordRepo);
            _mergeService = new MergeService(_mergeBlacklistRepo, _mergeGraylistRepo, _wordRepo, _wordService);
            _mergeController = new MergeController(
                _mergeService, new HubContextMock<MergeHub>(), new PermissionServiceMock());
        }

        [Test]
        public void TestMergeWordsNoPermission()
        {
            _mergeController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = _mergeController.MergeWords("projId", []).Result;
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public void TestUndoMergeNoPermission()
        {
            _mergeController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = _mergeController.UndoMerge("projId", new()).Result;
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public void TestBlacklistAddNoPermission()
        {
            _mergeController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = _mergeController.BlacklistAdd("projId", []).Result;
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public void TestBlacklistAdd()
        {
            var wordIdsA = new List<string> { "1", "2" };
            var wordIdsB = new List<string> { "3", "1" };
            var wordIdsC = new List<string> { "1", "2", "3" };

            // Add two Lists of wordIds.
            _ = _mergeController.BlacklistAdd(ProjId, wordIdsA).Result;
            var result = _mergeBlacklistRepo.GetAllSets(ProjId).Result;
            Assert.That(result, Has.Count.EqualTo(1));
            Assert.That(result.First().WordIds, Is.EqualTo(wordIdsA));
            _ = _mergeController.BlacklistAdd(ProjId, wordIdsB).Result;
            result = _mergeBlacklistRepo.GetAllSets(ProjId).Result;
            Assert.That(result, Has.Count.EqualTo(2));

            // Add a List of wordIds that contains both previous lists.
            _ = _mergeController.BlacklistAdd(ProjId, wordIdsC).Result;
            result = _mergeBlacklistRepo.GetAllSets(ProjId).Result;
            Assert.That(result, Has.Count.EqualTo(1));
            Assert.That(result.First().WordIds, Is.EqualTo(wordIdsC));
        }

        [Test]
        public void TestGraylistAddNoPermission()
        {
            _mergeController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = _mergeController.GraylistAdd("projId", []).Result;
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public void TestGraylistAdd()
        {
            var wordIdsA = new List<string> { "1", "2" };
            var wordIdsB = new List<string> { "3", "1" };
            var wordIdsC = new List<string> { "1", "2", "3" };

            // Add two Lists of wordIds.
            _ = _mergeController.GraylistAdd(ProjId, wordIdsA).Result;
            var result = _mergeGraylistRepo.GetAllSets(ProjId).Result;
            Assert.That(result, Has.Count.EqualTo(1));
            Assert.That(result.First().WordIds, Is.EqualTo(wordIdsA));
            _ = _mergeController.GraylistAdd(ProjId, wordIdsB).Result;
            result = _mergeGraylistRepo.GetAllSets(ProjId).Result;
            Assert.That(result, Has.Count.EqualTo(2));

            // Add a List of wordIds that contains both previous lists.
            _ = _mergeController.GraylistAdd(ProjId, wordIdsC).Result;
            result = _mergeGraylistRepo.GetAllSets(ProjId).Result;
            Assert.That(result, Has.Count.EqualTo(1));
            Assert.That(result.First().WordIds, Is.EqualTo(wordIdsC));
        }

        [Test]
        public void TestFindPotentialDuplicatesNoPermission()
        {
            _mergeController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = _mergeController.FindPotentialDuplicates("projId", 2, 1).Result;
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public void TestRetrievePotentialDuplicatesNoDuplicates()
        {
            var result = _mergeController.RetrievePotentialDuplicates();
            Assert.That(result, Is.InstanceOf<BadRequestResult>());
        }

        [Test]
        public void TestHasGraylistEntriesNoPermission()
        {
            _mergeController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = _mergeController.HasGraylistEntries("projId", "userId").Result;
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public void TestGetGraylistEntriesNoPermission()
        {
            _mergeController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = _mergeController.GetGraylistEntries("projId", 3, "userId").Result;
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }
    }
}
