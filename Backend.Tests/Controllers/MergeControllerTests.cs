using System;
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
    public class MergeControllerTests
    {
        private IMergeBlacklistRepository _mergeBlacklistRepo = null!;
        private IWordRepository _wordRepo = null!;
        private IMergeService _mergeService = null!;
        private IPermissionService _permissionService = null!;
        private MergeController _mergeController = null!;

        private string _projId = null!;

        [SetUp]
        public void Setup()
        {
            _mergeBlacklistRepo = new MergeBlacklistRepositoryMock();
            _wordRepo = new WordRepositoryMock();
            _mergeService = new MergeService(_mergeBlacklistRepo, _wordRepo);
            _permissionService = new PermissionServiceMock();
            _mergeController = new MergeController(_mergeService, _permissionService);

            _projId = Guid.NewGuid().ToString();
        }

        [Test]
        public void BlacklistAdd()
        {
            _ = _mergeBlacklistRepo.DeleteAll(_projId).Result;

            var wordIdsA = new List<string> { "1", "2" };
            var wordIdsB = new List<string> { "3", "1" };
            var wordIdsC = new List<string> { "1", "2", "3" };

            // Add two Lists of wordIds.
            _ = _mergeController.BlacklistAdd(_projId, wordIdsA).Result;
            var result = _mergeBlacklistRepo.GetAll(_projId).Result;
            Assert.That(result, Has.Count.EqualTo(1));
            Assert.AreEqual(result.First().WordIds, wordIdsA);
            _ = _mergeController.BlacklistAdd(_projId, wordIdsB).Result;
            result = _mergeBlacklistRepo.GetAll(_projId).Result;
            Assert.That(result, Has.Count.EqualTo(2));

            // Add a List of wordIds that contains both previous lists.
            _ = _mergeController.BlacklistAdd(_projId, wordIdsC).Result;
            result = _mergeBlacklistRepo.GetAll(_projId).Result;
            Assert.That(result, Has.Count.EqualTo(1));
            Assert.AreEqual(result.First().WordIds, wordIdsC);
        }

        [Test]
        public void BlacklistCheck()
        {
            _ = _mergeBlacklistRepo.DeleteAll(_projId).Result;
            var _userId = "1234567890";

            var wordIdsB = new List<string> { "3", "1" };
            var wordIdsC = new List<string> { "1", "2", "3" };
            var wordIdsD = new List<string> { "1", "4" };

            _ = _mergeService.AddToMergeBlacklist(_projId, _userId, wordIdsC);

            var isB = ((ObjectResult)(_mergeController.BlacklistCheck(_projId, wordIdsB).Result)).Value;
            Assert.IsTrue((bool)isB);
            var isC = ((ObjectResult)(_mergeController.BlacklistCheck(_projId, wordIdsC).Result)).Value;
            Assert.IsTrue((bool)isC);
            var isD = ((ObjectResult)(_mergeController.BlacklistCheck(_projId, wordIdsD).Result)).Value;
            Assert.IsFalse((bool)isD);

            // Check with userId specified.
            var withSame = ((ObjectResult)(_mergeController.BlacklistCheck(_projId, _userId, wordIdsB).Result)).Value;
            Assert.IsTrue((bool)withSame);
            var withDiff = ((ObjectResult)(_mergeController.BlacklistCheck(_projId, "diff", wordIdsB).Result)).Value;
            Assert.IsFalse((bool)withDiff);
        }

        [Test]
        public void BlacklistUpdate()
        {
            _ = _mergeBlacklistRepo.DeleteAll(_projId).Result;
            var _userId = "1234567890";

            var wordIdsC = new List<string> { "1", "2", "3" };
            var wordIdsD = new List<string> { "1", "4" };
            var wordIdsE = new List<string> { "5", "1" };

            _ = _mergeService.AddToMergeBlacklist(_projId, _userId, wordIdsC);
            _ = _mergeService.AddToMergeBlacklist(_projId, _userId, wordIdsD);
            _ = _mergeService.AddToMergeBlacklist(_projId, _userId, wordIdsE);

            var oldBlacklist = _mergeBlacklistRepo.GetAll(_projId).Result;
            Assert.That(oldBlacklist, Has.Count.EqualTo(3));

            // Make sure all wordIds are in the frontier EXCEPT 1.
            var frontier = new List<Word> {
                new Word {Id = "2"}, new Word {Id = "3"},
                new Word {Id = "4"}, new Word {Id = "5"},
            };
            _ = _wordRepo.AddFrontier(frontier).Result;

            // All entries affected.
            var result = _mergeController.BlacklistUpdate(_projId).Result;
            var updatedCount = ((ObjectResult)result).Value as int?;
            Assert.AreEqual(updatedCount, 3);

            // The only blacklistEntry with at least two ids in the frontier is C.
            var entries = _mergeBlacklistRepo.GetAll(_projId).Result;
            Assert.That(entries, Has.Count.EqualTo(1));
            Assert.AreEqual(entries.First().WordIds, new List<string> { "2", "3" });
        }
    }
}
