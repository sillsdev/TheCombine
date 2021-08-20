using System.Collections.Generic;
using System.Linq;
using Backend.Tests.Mocks;
using BackendFramework.Controllers;
using BackendFramework.Interfaces;
using BackendFramework.Services;
using NUnit.Framework;

namespace Backend.Tests.Controllers
{
    public class MergeControllerTests
    {
        private IMergeBlacklistRepository _mergeBlacklistRepo = null!;
        private IWordRepository _wordRepo = null!;
        private IWordService _wordService = null!;
        private IMergeService _mergeService = null!;
        private IPermissionService _permissionService = null!;
        private MergeController _mergeController = null!;

        private const string ProjId = "MergeServiceTestProjId";

        [SetUp]
        public void Setup()
        {
            _mergeBlacklistRepo = new MergeBlacklistRepositoryMock();
            _wordRepo = new WordRepositoryMock();
            _wordService = new WordService(_wordRepo);
            _mergeService = new MergeService(_mergeBlacklistRepo, _wordRepo, _wordService);
            _permissionService = new PermissionServiceMock();
            _mergeController = new MergeController(_mergeService, _permissionService);
        }

        [Test]
        public void BlacklistAddTest()
        {
            var wordIdsA = new List<string> { "1", "2" };
            var wordIdsB = new List<string> { "3", "1" };
            var wordIdsC = new List<string> { "1", "2", "3" };

            // Add two Lists of wordIds.
            _ = _mergeController.BlacklistAdd(ProjId, wordIdsA).Result;
            var result = _mergeBlacklistRepo.GetAll(ProjId).Result;
            Assert.That(result, Has.Count.EqualTo(1));
            Assert.That(result.First().WordIds, Is.EqualTo(wordIdsA));
            _ = _mergeController.BlacklistAdd(ProjId, wordIdsB).Result;
            result = _mergeBlacklistRepo.GetAll(ProjId).Result;
            Assert.That(result, Has.Count.EqualTo(2));

            // Add a List of wordIds that contains both previous lists.
            _ = _mergeController.BlacklistAdd(ProjId, wordIdsC).Result;
            result = _mergeBlacklistRepo.GetAll(ProjId).Result;
            Assert.That(result, Has.Count.EqualTo(1));
            Assert.That(result.First().WordIds, Is.EqualTo(wordIdsC));
        }
    }
}
