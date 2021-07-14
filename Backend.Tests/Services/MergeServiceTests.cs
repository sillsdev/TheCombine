using System.Collections.Generic;
using System.Linq;
using Backend.Tests.Mocks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Services;
using NUnit.Framework;

namespace Backend.Tests.Services
{
    public class MergeServiceTests
    {
        private IMergeBlacklistRepository _mergeBlacklistRepo = null!;
        private IWordRepository _wordRepo = null!;
        private IMergeService _mergeService = null!;

        private const string ProjId = "MergeServiceTestProjId";
        private const string UserId = "MergeServiceTestUserId";

        [SetUp]
        public void Setup()
        {
            _mergeBlacklistRepo = new MergeBlacklistRepositoryMock();
            _wordRepo = new WordRepositoryMock();
            _mergeService = new MergeService(_mergeBlacklistRepo, _wordRepo);
        }

        [Test]
        public void MergeWordsOneChildTest()
        {
            var thisWord = Util.RandomWord(ProjId);
            thisWord = _wordRepo.Create(thisWord).Result;

            var mergeObject = new MergeWords
            {
                Parent = thisWord,
                Children = new List<MergeSourceWord>
                {
                    new() { SrcWordId = thisWord.Id }
                }
            };

            var newWords = _mergeService.Merge(ProjId, new List<MergeWords> { mergeObject }).Result;

            // There should only be 1 word added and it should be identical to what we passed in
            Assert.That(newWords, Has.Count.EqualTo(1));
            Assert.That(newWords.First().ContentEquals(thisWord));

            // Check that the only word in the frontier is the new word
            var frontier = _wordRepo.GetFrontier(ProjId).Result;
            Assert.That(frontier, Has.Count.EqualTo(1));
            Assert.That(frontier.First(), Is.EqualTo(newWords.First()));

            // Check that new word has the right history
            Assert.That(newWords.First().History, Has.Count.EqualTo(1));
            Assert.That(newWords.First().History.First(), Is.EqualTo(thisWord.Id));
        }

        [Test]
        public void MergeWordsMultiChildTest()
        {
            // Build a mergeWords with a parent with 3 children.
            var mergeWords = new MergeWords { Parent = Util.RandomWord(ProjId) };
            const int numberOfChildren = 3;
            foreach (var _ in Enumerable.Range(0, numberOfChildren))
            {
                var child = Util.RandomWord(ProjId);
                var id = _wordRepo.Create(child).Result.Id;
                Assert.IsNotNull(_wordRepo.GetWord(ProjId, id).Result);
                mergeWords.Children.Add(new MergeSourceWord { SrcWordId = id });
            }
            Assert.That(_wordRepo.GetFrontier(ProjId).Result, Has.Count.EqualTo(numberOfChildren));

            var mergeWordsList = new List<MergeWords> { mergeWords };
            var newWords = _mergeService.Merge(ProjId, mergeWordsList).Result;

            // Check for correct history length;
            var dbParent = newWords.First();
            Assert.That(dbParent.History, Has.Count.EqualTo(numberOfChildren));

            // Confirm that parent added to repo and children not in frontier.
            Assert.IsNotNull(_wordRepo.GetWord(ProjId, dbParent.Id).Result);
            Assert.That(_wordRepo.GetFrontier(ProjId).Result, Has.Count.EqualTo(1));
        }

        [Test]
        public void MergeWordsMultipleTest()
        {
            var mergeWordsA = new MergeWords { Parent = Util.RandomWord(ProjId) };
            var mergeWordsB = new MergeWords { Parent = Util.RandomWord(ProjId) };
            var mergeWordsList = new List<MergeWords> { mergeWordsA, mergeWordsB };
            var newWords = _mergeService.Merge(ProjId, mergeWordsList).Result;

            Assert.That(newWords, Has.Count.EqualTo(2));
            Assert.AreNotEqual(newWords.First().Id, newWords.Last().Id);

            var frontier = _wordRepo.GetFrontier(ProjId).Result;
            Assert.That(frontier, Has.Count.EqualTo(2));
            Assert.AreNotEqual(frontier.First().Id, frontier.Last().Id);
            Assert.Contains(frontier.First(), newWords);
            Assert.Contains(frontier.Last(), newWords);
        }

        [Test]
        public void AddMergeToBlacklistTest()
        {
            _ = _mergeBlacklistRepo.DeleteAll(ProjId).Result;
            var wordIds = new List<string> { "1", "2" };
            _ = _mergeService.AddToMergeBlacklist(ProjId, UserId, wordIds).Result;
            var blacklist = _mergeBlacklistRepo.GetAll(ProjId).Result;
            Assert.That(blacklist, Has.Count.EqualTo(1));
            var expectedEntry = new MergeBlacklistEntry { ProjectId = ProjId, UserId = UserId, WordIds = wordIds };
            Assert.That(expectedEntry.ContentEquals(blacklist.First()));
        }

        [Test]
        public void AddMergeToBlacklistErrorTest()
        {
            _ = _mergeBlacklistRepo.DeleteAll(ProjId).Result;
            var wordIds0 = new List<string>();
            var wordIds1 = new List<string> { "1" };
            Assert.ThrowsAsync<MergeService.InvalidBlacklistEntryError>(
                async () => { await _mergeService.AddToMergeBlacklist(ProjId, UserId, wordIds0); });
            Assert.ThrowsAsync<MergeService.InvalidBlacklistEntryError>(
                async () => { await _mergeService.AddToMergeBlacklist(ProjId, UserId, wordIds1); });
        }

        [Test]
        public void IsInMergeBlacklistTest()
        {
            _ = _mergeBlacklistRepo.DeleteAll(ProjId).Result;
            var wordIds = new List<string> { "1", "2", "3" };
            var subWordIds = new List<string> { "3", "2" };

            Assert.IsFalse(_mergeService.IsInMergeBlacklist(ProjId, subWordIds).Result);
            _ = _mergeService.AddToMergeBlacklist(ProjId, UserId, wordIds).Result;
            Assert.IsTrue(_mergeService.IsInMergeBlacklist(ProjId, subWordIds).Result);
        }

        [Test]
        public void IsInMergeBlacklistErrorTest()
        {
            _ = _mergeBlacklistRepo.DeleteAll(ProjId).Result;
            var wordIds0 = new List<string>();
            var wordIds1 = new List<string> { "1" };
            Assert.ThrowsAsync<MergeService.InvalidBlacklistEntryError>(
                async () => { await _mergeService.IsInMergeBlacklist(ProjId, wordIds0); });
            Assert.ThrowsAsync<MergeService.InvalidBlacklistEntryError>(
                async () => { await _mergeService.IsInMergeBlacklist(ProjId, wordIds1); });
        }

        [Test]
        public void UpdateMergeBlacklistTest()
        {
            var entryA = new MergeBlacklistEntry
            {
                Id = "A",
                ProjectId = ProjId,
                UserId = UserId,
                WordIds = new List<string> { "1", "2", "3" }
            };
            var entryB = new MergeBlacklistEntry
            {
                Id = "B",
                ProjectId = ProjId,
                UserId = UserId,
                WordIds = new List<string> { "1", "4" }
            };

            _ = _mergeBlacklistRepo.Create(entryA);
            _ = _mergeBlacklistRepo.Create(entryB);

            var oldBlacklist = _mergeBlacklistRepo.GetAll(ProjId).Result;
            Assert.That(oldBlacklist, Has.Count.EqualTo(2));

            // Make sure all wordIds are in the frontier EXCEPT 1.
            var frontier = new List<Word>
            {
                new() {Id = "2", ProjectId = ProjId},
                new() {Id = "3", ProjectId = ProjId},
                new() {Id = "4", ProjectId = ProjId}
            };
            _ = _wordRepo.AddFrontier(frontier).Result;

            // All entries affected.
            var updatedEntriesCount = _mergeService.UpdateMergeBlacklist(ProjId).Result;
            Assert.That(updatedEntriesCount, Is.EqualTo(2));

            // The only blacklistEntry with at least two ids in the frontier is A.
            var newBlacklist = _mergeBlacklistRepo.GetAll(ProjId).Result;
            Assert.That(newBlacklist, Has.Count.EqualTo(1));
            Assert.AreEqual(newBlacklist.First().WordIds, new List<string> { "2", "3" });
        }
    }
}
