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
        private IMergeGraylistRepository _mergeGraylistRepo = null!;
        private IWordRepository _wordRepo = null!;
        private IWordService _wordService = null!;
        private IMergeService _mergeService = null!;

        private const string ProjId = "MergeServiceTestProjId";
        private const string UserId = "MergeServiceTestUserId";

        [SetUp]
        public void Setup()
        {
            _mergeBlacklistRepo = new MergeBlacklistRepositoryMock();
            _mergeGraylistRepo = new MergeGraylistRepositoryMock();
            _wordRepo = new WordRepositoryMock();
            _wordService = new WordService(_wordRepo);
            _mergeService = new MergeService(_mergeBlacklistRepo, _mergeGraylistRepo, _wordRepo, _wordService);
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

            var newWords = _mergeService.Merge(ProjId, UserId, new List<MergeWords> { mergeObject }).Result;

            // There should only be 1 word added and it should be identical to what we passed in
            Assert.That(newWords, Has.Count.EqualTo(1));
            Assert.That(newWords.First().ContentEquals(thisWord), Is.True);

            // Check that the only word in the frontier is the new word
            var frontier = _wordRepo.GetFrontier(ProjId).Result;
            Assert.That(frontier, Has.Count.EqualTo(1));
            Assert.That(frontier.First(), Is.EqualTo(newWords.First()));

            // Check that new word has the right history
            Assert.That(newWords.First().History, Has.Count.EqualTo(1));
            Assert.That(newWords.First().History.First(), Is.EqualTo(thisWord.Id));
        }

        [Test]
        public void MergeWordsDeleteTest()
        {
            var thisWord = Util.RandomWord(ProjId);
            thisWord = _wordRepo.Create(thisWord).Result;

            var mergeObject = new MergeWords
            {
                Parent = thisWord,
                Children = new List<MergeSourceWord>
                {
                    new() { SrcWordId = thisWord.Id }
                },
                DeleteOnly = true
            };

            var newWords = _mergeService.Merge(ProjId, UserId, new List<MergeWords> { mergeObject }).Result;

            // There should be no word added and no words left in the frontier.
            Assert.That(newWords, Is.Empty);
            var frontier = _wordRepo.GetFrontier(ProjId).Result;
            Assert.That(frontier, Is.Empty);
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
                Assert.That(_wordRepo.GetWord(ProjId, id).Result, Is.Not.Null);
                mergeWords.Children.Add(new MergeSourceWord { SrcWordId = id });
            }
            Assert.That(_wordRepo.GetFrontier(ProjId).Result, Has.Count.EqualTo(numberOfChildren));

            var mergeWordsList = new List<MergeWords> { mergeWords };
            var newWords = _mergeService.Merge(ProjId, UserId, mergeWordsList).Result;

            // Check for correct history length.
            var dbParent = newWords.First();
            Assert.That(dbParent.History, Has.Count.EqualTo(numberOfChildren));

            // Confirm that parent added to repo and children not in frontier.
            Assert.That(_wordRepo.GetWord(ProjId, dbParent.Id).Result, Is.Not.Null);
            Assert.That(_wordRepo.GetFrontier(ProjId).Result, Has.Count.EqualTo(1));
        }

        [Test]
        public void MergeWordsMultipleTest()
        {
            int wordCount = 100;
            var randWords = Util.RandomWordList(wordCount, ProjId);
            var mergeWordsList = randWords.Select(word => new MergeWords { Parent = word }).ToList();
            var newWords = _mergeService.Merge(ProjId, UserId, mergeWordsList).Result;

            Assert.That(newWords, Has.Count.EqualTo(wordCount));
            Assert.That(newWords.First().Id, Is.Not.EqualTo(newWords.Last().Id));

            var frontier = _wordRepo.GetFrontier(ProjId).Result;
            Assert.That(frontier, Has.Count.EqualTo(wordCount));
            Assert.That(frontier.First().Id, Is.Not.EqualTo(frontier.Last().Id));
            Assert.That(newWords, Does.Contain(frontier.First()));
            Assert.That(newWords, Does.Contain(frontier.Last()));
        }

        [Test]
        public void UndoMergeOneChildTest()
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

            var newWords = _mergeService.Merge(ProjId, UserId, new List<MergeWords> { mergeObject }).Result;

            // There should only be 1 word added and it should be identical to what we passed in
            Assert.That(newWords, Has.Count.EqualTo(1));
            Assert.That(newWords.First().ContentEquals(thisWord), Is.True);

            var childIds = mergeObject.Children.Select(word => word.SrcWordId).ToList();
            var parentIds = new List<string> { newWords[0].Id };
            var mergedWord = new MergeUndoIds(parentIds, childIds);
            var undo = _mergeService.UndoMerge(ProjId, UserId, mergedWord).Result;
            Assert.That(undo, Is.True);

            var frontierWords = _wordRepo.GetFrontier(ProjId).Result;
            var frontierWordIds = frontierWords.Select(word => word.Id).ToList();

            Assert.That(frontierWords, Has.Count.EqualTo(1));
            Assert.That(frontierWordIds, Does.Contain(childIds[0]));
        }

        [Test]
        public void UndoMergeMultiChildTest()
        {
            // Build a mergeWords with a parent with 3 children.
            var mergeWords = new MergeWords { Parent = Util.RandomWord(ProjId) };
            const int numberOfChildren = 3;
            foreach (var _ in Enumerable.Range(0, numberOfChildren))
            {
                var child = Util.RandomWord(ProjId);
                var id = _wordRepo.Create(child).Result.Id;
                Assert.That(_wordRepo.GetWord(ProjId, id).Result, Is.Not.Null);
                mergeWords.Children.Add(new MergeSourceWord { SrcWordId = id });
            }
            Assert.That(_wordRepo.GetFrontier(ProjId).Result, Has.Count.EqualTo(numberOfChildren));

            var mergeWordsList = new List<MergeWords> { mergeWords };
            var newWords = _mergeService.Merge(ProjId, UserId, mergeWordsList).Result;

            Assert.That(_wordRepo.GetFrontier(ProjId).Result, Has.Count.EqualTo(1));

            var childIds = mergeWords.Children.Select(word => word.SrcWordId).ToList();
            var parentIds = new List<string> { newWords[0].Id };
            var mergedWord = new MergeUndoIds(parentIds, childIds);
            var undo = _mergeService.UndoMerge(ProjId, UserId, mergedWord).Result;
            Assert.That(undo, Is.True);

            var frontierWords = _wordRepo.GetFrontier(ProjId).Result;
            var frontierWordIds = frontierWords.Select(word => word.Id).ToList();

            Assert.That(frontierWords, Has.Count.EqualTo(numberOfChildren));
            childIds.ForEach(id => Assert.That(frontierWordIds, Does.Contain(id)));
        }

        [Test]
        public void AddMergeToBlacklistTest()
        {
            var wordIds = new List<string> { "1", "2" };

            // Adding to blacklist should clear from graylist
            _ = _mergeService.AddToMergeGraylist(ProjId, UserId, wordIds).Result;
            Assert.That(_mergeGraylistRepo.GetAllSets(ProjId).Result, Is.Not.Empty);

            _ = _mergeService.AddToMergeBlacklist(ProjId, UserId, wordIds).Result;
            var blacklist = _mergeBlacklistRepo.GetAllSets(ProjId).Result;
            Assert.That(blacklist, Has.Count.EqualTo(1));
            var expectedEntry = new MergeWordSet { ProjectId = ProjId, UserId = UserId, WordIds = wordIds };
            Assert.That(expectedEntry.ContentEquals(blacklist.First()), Is.True);

            Assert.That(_mergeGraylistRepo.GetAllSets(ProjId).Result, Is.Empty);
        }

        [Test]
        public void AddMergeToBlacklistErrorTest()
        {
            var wordIds0 = new List<string>();
            var wordIds1 = new List<string> { "1" };
            Assert.That(
                async () => { await _mergeService.AddToMergeBlacklist(ProjId, UserId, wordIds0); }, Throws.TypeOf<MergeService.InvalidMergeWordSetException>());
            Assert.That(
                async () => { await _mergeService.AddToMergeBlacklist(ProjId, UserId, wordIds1); }, Throws.TypeOf<MergeService.InvalidMergeWordSetException>());
        }

        [Test]
        public void IsInMergeBlacklistTest()
        {
            var wordIds = new List<string> { "1", "2", "3" };
            var subWordIds = new List<string> { "3", "2" };

            Assert.That(_mergeService.IsInMergeBlacklist(ProjId, subWordIds).Result, Is.False);
            _ = _mergeService.AddToMergeBlacklist(ProjId, UserId, wordIds).Result;
            Assert.That(_mergeService.IsInMergeBlacklist(ProjId, subWordIds).Result, Is.True);
        }

        [Test]
        public void IsInMergeBlacklistErrorTest()
        {
            var wordIds0 = new List<string>();
            var wordIds1 = new List<string> { "1" };
            Assert.That(
                async () => { await _mergeService.IsInMergeBlacklist(ProjId, wordIds0); }, Throws.TypeOf<MergeService.InvalidMergeWordSetException>());
            Assert.That(
                async () => { await _mergeService.IsInMergeBlacklist(ProjId, wordIds1); }, Throws.TypeOf<MergeService.InvalidMergeWordSetException>());
        }

        [Test]
        public void UpdateMergeBlacklistTest()
        {
            var entryA = new MergeWordSet
            {
                Id = "A",
                ProjectId = ProjId,
                UserId = UserId,
                WordIds = new List<string> { "1", "2", "3" }
            };
            var entryB = new MergeWordSet
            {
                Id = "B",
                ProjectId = ProjId,
                UserId = UserId,
                WordIds = new List<string> { "1", "4" }
            };

            _ = _mergeBlacklistRepo.Create(entryA);
            _ = _mergeBlacklistRepo.Create(entryB);

            var oldBlacklist = _mergeBlacklistRepo.GetAllSets(ProjId).Result;
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
            var newBlacklist = _mergeBlacklistRepo.GetAllSets(ProjId).Result;
            Assert.That(newBlacklist, Has.Count.EqualTo(1));
            Assert.That(newBlacklist.First().WordIds, Is.EqualTo(new List<string> { "2", "3" }));
        }

        [Test]
        public void AddMergeToGraylistTest()
        {
            var wordIds = new List<string> { "1", "2" };
            _ = _mergeService.AddToMergeGraylist(ProjId, UserId, wordIds).Result;
            var graylist = _mergeGraylistRepo.GetAllSets(ProjId).Result;
            Assert.That(graylist, Has.Count.EqualTo(1));
            var expectedEntry = new MergeWordSet { ProjectId = ProjId, UserId = UserId, WordIds = wordIds };
            Assert.That(expectedEntry.ContentEquals(graylist.First()), Is.True);
        }

        [Test]
        public void AddMergeToGraylistSupersetTest()
        {
            var wordIds12 = new List<string> { "1", "2" };
            var wordIds13 = new List<string> { "1", "3" };
            var wordIds123 = new List<string> { "1", "2", "3" };

            _ = _mergeService.AddToMergeGraylist(ProjId, UserId, wordIds12).Result;
            _ = _mergeService.AddToMergeGraylist(ProjId, UserId, wordIds13).Result;
            Assert.That(_mergeGraylistRepo.GetAllSets(ProjId).Result, Has.Count.EqualTo(2));

            _ = _mergeService.AddToMergeGraylist(ProjId, UserId, wordIds123).Result;
            Assert.That(_mergeGraylistRepo.GetAllSets(ProjId).Result, Has.Count.EqualTo(1));
        }

        [Test]
        public void AddMergeToGraylistErrorTest()
        {
            var wordIds = new List<string>();
            var wordIds1 = new List<string> { "1" };
            Assert.That(
                async () => { await _mergeService.AddToMergeGraylist(ProjId, UserId, wordIds); },
                Throws.TypeOf<MergeService.InvalidMergeWordSetException>());
            Assert.That(
                async () => { await _mergeService.AddToMergeGraylist(ProjId, UserId, wordIds1); },
                Throws.TypeOf<MergeService.InvalidMergeWordSetException>());
        }

        [Test]
        public void RemoveFromMergeGraylistTest()
        {
            var wordIds = new List<string> { "1", "2", "3" };
            _ = _mergeService.AddToMergeGraylist(ProjId, UserId, wordIds).Result;
            Assert.That(_mergeGraylistRepo.GetAllSets(ProjId).Result, Has.Count.EqualTo(1));
            Assert.That(_mergeService.RemoveFromMergeGraylist(ProjId, UserId, wordIds).Result, Is.True);
            Assert.That(_mergeGraylistRepo.GetAllSets(ProjId).Result, Has.Count.EqualTo(0));
        }

        [Test]
        public void RemoveFromMergeGraylistSupersetTest()
        {
            var wordIds = new List<string> { "1", "2" };
            _ = _mergeService.AddToMergeGraylist(ProjId, UserId, wordIds).Result;
            Assert.That(_mergeGraylistRepo.GetAllSets(ProjId).Result, Has.Count.EqualTo(1));

            wordIds.Add("3");
            Assert.That(_mergeService.RemoveFromMergeGraylist(ProjId, UserId, wordIds).Result, Is.False);
            Assert.That(_mergeGraylistRepo.GetAllSets(ProjId).Result, Has.Count.EqualTo(1));
        }

        [Test]
        public void RemoveFromMergeGraylistErrorTest()
        {
            var wordIds = new List<string>();
            var wordIds1 = new List<string> { "1" };
            Assert.That(
                async () => { await _mergeService.RemoveFromMergeGraylist(ProjId, UserId, wordIds); },
                Throws.TypeOf<MergeService.InvalidMergeWordSetException>());
            Assert.That(
                async () => { await _mergeService.RemoveFromMergeGraylist(ProjId, UserId, wordIds1); },
                Throws.TypeOf<MergeService.InvalidMergeWordSetException>());
        }

        [Test]
        public void IsInMergeGraylistTest()
        {
            var wordIds = new List<string> { "1", "2", "3" };
            var subWordIds = new List<string> { "3", "2" };

            Assert.That(_mergeService.IsInMergeGraylist(ProjId, subWordIds).Result, Is.False);
            _ = _mergeService.AddToMergeGraylist(ProjId, UserId, wordIds).Result;
            Assert.That(_mergeService.IsInMergeGraylist(ProjId, subWordIds).Result, Is.True);
        }

        [Test]
        public void IsInMergeGraylistErrorTest()
        {
            var wordIds0 = new List<string>();
            var wordIds1 = new List<string> { "1" };
            Assert.That(
                async () => { await _mergeService.IsInMergeGraylist(ProjId, wordIds0); }, Throws.TypeOf<MergeService.InvalidMergeWordSetException>());
            Assert.That(
                async () => { await _mergeService.IsInMergeGraylist(ProjId, wordIds1); }, Throws.TypeOf<MergeService.InvalidMergeWordSetException>());
        }

        [Test]
        public void UpdateMergeGraylistTest()
        {
            var entryA = new MergeWordSet
            {
                Id = "A",
                ProjectId = ProjId,
                UserId = UserId,
                WordIds = new List<string> { "1", "2", "3" }
            };
            var entryB = new MergeWordSet
            {
                Id = "B",
                ProjectId = ProjId,
                UserId = UserId,
                WordIds = new List<string> { "1", "4" }
            };

            _ = _mergeGraylistRepo.Create(entryA);
            _ = _mergeGraylistRepo.Create(entryB);

            var oldGraylist = _mergeGraylistRepo.GetAllSets(ProjId).Result;
            Assert.That(oldGraylist, Has.Count.EqualTo(2));

            // Make sure all wordIds are in the frontier EXCEPT 1.
            var frontier = new List<Word>
            {
                new() {Id = "2", ProjectId = ProjId},
                new() {Id = "3", ProjectId = ProjId},
                new() {Id = "4", ProjectId = ProjId}
            };
            _ = _wordRepo.AddFrontier(frontier).Result;

            // All entries affected.
            var updatedEntriesCount = _mergeService.UpdateMergeGraylist(ProjId).Result;
            Assert.That(updatedEntriesCount, Is.EqualTo(2));

            // The only graylistEntry with at least two ids in the frontier is A.
            var newGraylist = _mergeGraylistRepo.GetAllSets(ProjId).Result;
            Assert.That(newGraylist, Has.Count.EqualTo(1));
            Assert.That(newGraylist.First().WordIds, Is.EqualTo(new List<string> { "2", "3" }));
        }
    }
}
