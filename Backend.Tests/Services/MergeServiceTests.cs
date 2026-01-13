using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Tests.Mocks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Services;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using NUnit.Framework;

namespace Backend.Tests.Services
{
    internal sealed class MergeServiceTests
    {
        private IMemoryCache _cache = null!;
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
            _cache =
                new ServiceCollection().AddMemoryCache().BuildServiceProvider().GetRequiredService<IMemoryCache>();
            _mergeBlacklistRepo = new MergeBlacklistRepositoryMock();
            _mergeGraylistRepo = new MergeGraylistRepositoryMock();
            _wordRepo = new WordRepositoryMock();
            _wordService = new WordService(_wordRepo);
            _mergeService = new MergeService(_cache, _mergeBlacklistRepo, _mergeGraylistRepo, _wordRepo, _wordService);
        }

        [Test]
        public void MergeWordsOneChildTest()
        {
            var thisWord = Util.RandomWord(ProjId);
            thisWord.UsingCitationForm = true;
            thisWord = _wordRepo.Create(thisWord).Result;

            var mergeObject = new MergeWords
            {
                Parent = thisWord,
                Children = [new() { SrcWordId = thisWord.Id }]
            };

            var newWords = _mergeService.Merge(ProjId, UserId, [mergeObject]).Result;

            // There should only be 1 word added and it should be identical to what we passed in
            Assert.That(newWords, Has.Count.EqualTo(1));
            Util.AssertEqualWordContent(newWords.First(), thisWord, true);

            // Check that the only word in the frontier is the new word
            var frontier = _wordRepo.GetFrontier(ProjId).Result;
            Assert.That(frontier, Has.Count.EqualTo(1));
            Assert.That(frontier.First(), Is.EqualTo(newWords.First()).UsingPropertiesComparer());

            // Check that new word has the right History and UsingCitationForm
            Assert.That(newWords.First().History, Has.Count.EqualTo(1));
            Assert.That(newWords.First().History.First(), Is.EqualTo(thisWord.Id));
            Assert.That(newWords.First().UsingCitationForm, Is.True);
        }

        [Test]
        public void MergeWordsDeleteTest()
        {
            var thisWord = Util.RandomWord(ProjId);
            thisWord = _wordRepo.Create(thisWord).Result;

            var mergeObject = new MergeWords
            {
                Parent = thisWord,
                Children = [new() { SrcWordId = thisWord.Id }],
                DeleteOnly = true
            };

            var newWords = _mergeService.Merge(ProjId, UserId, [mergeObject]).Result;
            // There should be no word added and no words left in the frontier.
            Assert.That(newWords, Is.Empty);
            var frontier = _wordRepo.GetFrontier(ProjId).Result;
            Assert.That(frontier, Is.Empty);
        }

        [Test]
        public void MergeWordsMultiChildTest()
        {
            // Build a mergeWords with a parent with 3 children.
            var parent = Util.RandomWord(ProjId);
            parent.UsingCitationForm = true;
            var mergeWords = new MergeWords { Parent = parent };
            const int numberOfChildren = 3;
            foreach (var i in Enumerable.Range(0, numberOfChildren))
            {
                var child = Util.RandomWord(ProjId);
                if (i == 0)
                {
                    child.Guid = parent.Guid;
                    child.UsingCitationForm = true;
                }
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

            // Since the parent and child with the same Guid have different Vernacular,
            // UsingCitationForm should change to false.
            Assert.That(dbParent.UsingCitationForm, Is.False);

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
            Assert.That(newWords, Does.Contain(frontier.First()).UsingPropertiesComparer());
            Assert.That(newWords, Does.Contain(frontier.Last()).UsingPropertiesComparer());
        }

        [Test]
        public void UndoMergeOneChildTest()
        {
            var thisWord = Util.RandomWord(ProjId);
            thisWord = _wordRepo.Create(thisWord).Result;

            var mergeObject = new MergeWords
            {
                Parent = thisWord,
                Children = [new() { SrcWordId = thisWord.Id }]
            };

            var newWords = _mergeService.Merge(ProjId, UserId, [mergeObject]).Result;

            // There should only be 1 word added and it should be identical to what we passed in
            Assert.That(newWords, Has.Count.EqualTo(1));
            Util.AssertEqualWordContent(newWords.First(), thisWord, true);

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
            Assert.That(
                async () => { await _mergeService.AddToMergeBlacklist(ProjId, UserId, []); },
                Throws.TypeOf<MergeService.InvalidMergeWordSetException>());
            Assert.That(
                async () => { await _mergeService.AddToMergeBlacklist(ProjId, UserId, ["1"]); },
                Throws.TypeOf<MergeService.InvalidMergeWordSetException>());
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
            Assert.That(
                async () => { await _mergeService.IsInMergeBlacklist(ProjId, []); },
                Throws.TypeOf<MergeService.InvalidMergeWordSetException>());
            Assert.That(
                async () => { await _mergeService.IsInMergeBlacklist(ProjId, ["1"]); },
                Throws.TypeOf<MergeService.InvalidMergeWordSetException>());
        }

        [Test]
        public void UpdateMergeBlacklistTest()
        {
            var entryA = new MergeWordSet
            {
                Id = "A",
                ProjectId = ProjId,
                UserId = UserId,
                WordIds = ["1", "2", "3"]
            };
            var entryB = new MergeWordSet
            {
                Id = "B",
                ProjectId = ProjId,
                UserId = UserId,
                WordIds = ["1", "4"]
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
            Assert.That(
                async () => { await _mergeService.AddToMergeGraylist(ProjId, UserId, []); },
                Throws.TypeOf<MergeService.InvalidMergeWordSetException>());
            Assert.That(
                async () => { await _mergeService.AddToMergeGraylist(ProjId, UserId, ["1"]); },
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
            Assert.That(
                async () => { await _mergeService.RemoveFromMergeGraylist(ProjId, UserId, []); },
                Throws.TypeOf<MergeService.InvalidMergeWordSetException>());
            Assert.That(
                async () => { await _mergeService.RemoveFromMergeGraylist(ProjId, UserId, ["1"]); },
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
            Assert.That(
                async () => { await _mergeService.IsInMergeGraylist(ProjId, []); },
                Throws.TypeOf<MergeService.InvalidMergeWordSetException>());
            Assert.That(
                async () => { await _mergeService.IsInMergeGraylist(ProjId, ["1"]); },
                Throws.TypeOf<MergeService.InvalidMergeWordSetException>());
        }

        [Test]
        public void UpdateMergeGraylistTest()
        {
            var entryA = new MergeWordSet
            {
                Id = "A",
                ProjectId = ProjId,
                UserId = UserId,
                WordIds = ["1", "2", "3"]
            };
            var entryB = new MergeWordSet
            {
                Id = "B",
                ProjectId = ProjId,
                UserId = UserId,
                WordIds = ["1", "4"]
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

        [Test]
        public void HasGraylistEntriesTrueTest()
        {
            _ = _mergeGraylistRepo.Create(new() { Id = "A", ProjectId = ProjId, UserId = UserId });
            _ = _mergeGraylistRepo.Create(new()
            {
                Id = "B",
                ProjectId = ProjId,
                UserId = UserId,
                WordIds = ["i", "ii", "iii", "iv"]
            });
            _ = _wordRepo.AddFrontier([new() { Id = "ii", ProjectId = ProjId }]).Result;
            _ = _wordRepo.AddFrontier([new() { Id = "iv", ProjectId = ProjId }]).Result;

            Assert.That(_mergeService.HasGraylistEntries(ProjId, UserId).Result, Is.True);
        }

        [Test]
        public void HasGraylistEntriesRemovesInvalidEntriesTest()
        {
            // Create graylist entries with fewer than 2 words in the Frontier.
            _ = _mergeGraylistRepo.Create(new() { Id = "A", ProjectId = ProjId, UserId = UserId });
            _ = _mergeGraylistRepo.Create(new()
            {
                Id = "B",
                ProjectId = ProjId,
                UserId = UserId,
                WordIds = ["i", "ii", "iii", "iv"]
            });
            _ = _mergeGraylistRepo.Create(new()
            {
                Id = "C",
                ProjectId = ProjId,
                UserId = UserId,
                WordIds = ["1", "2", "3"]
            });
            _ = _wordRepo.AddFrontier([new() { Id = "1", ProjectId = ProjId }]).Result;

            // Check for graylist entries.
            Assert.That(_mergeService.HasGraylistEntries(ProjId, UserId).Result, Is.False);

            // Verify all the (invalid) entries were removed.
            Assert.That(_mergeGraylistRepo.GetAllSets(ProjId, UserId).Result, Is.Empty);
        }

        [Test]
        public void TestRetrieveDupsReturnsNullWhenEmpty()
        {
            // Retrieve when nothing has been stored should return null
            Assert.That(_mergeService.RetrieveDups(UserId), Is.Null);
        }

        [Test]
        public async Task TestRetrieveDupsRemovesFromCache()
        {
            Assert.That(await _mergeService.GetAndStorePotentialDuplicates(ProjId, 5, 5, UserId), Is.True);

            // First retrieve should return the duplicates
            Assert.That(_mergeService.RetrieveDups(UserId), Is.Not.Null);

            // Second retrieve should return null since it was removed
            Assert.That(_mergeService.RetrieveDups(UserId), Is.Null);
        }

        [Test]
        public async Task TestGetAndStorePotentialDuplicatesMultipleUsersMultipleCalls()
        {
            var userId1 = "User1";
            var userId2 = "User2";
            var userId3 = "User3";

            Assert.That(await _mergeService.GetAndStorePotentialDuplicates(ProjId, 5, 5, userId1), Is.True);
            Assert.That(await _mergeService.GetAndStorePotentialDuplicates(ProjId, 5, 5, userId2), Is.True);
            Assert.That(await _mergeService.GetAndStorePotentialDuplicates(ProjId, 5, 5, userId3), Is.True);
            Assert.That(await _mergeService.GetAndStorePotentialDuplicates(ProjId, 5, 5, userId2), Is.True);
            Assert.That(await _mergeService.GetAndStorePotentialDuplicates(ProjId, 5, 5, userId1), Is.True);
            Assert.That(await _mergeService.GetAndStorePotentialDuplicates(ProjId, 5, 5, userId1), Is.True);

            Assert.That(_mergeService.RetrieveDups(userId1), Is.Not.Null);
            Assert.That(_mergeService.RetrieveDups(userId2), Is.Not.Null);
            Assert.That(_mergeService.RetrieveDups(userId3), Is.Not.Null);
        }

        [Test]
        public async Task TestGetAndStorePotentialDuplicatesSecondCallWins()
        {
            // If a users makes a second call to GetAndStorePotentialDuplicates while a first call is in progress,
            // the first call should return false and the second call should return true.
            // This ensures that only the most recently requested duplicates are stored for the user.
            var userId = "TestUser";

            // Delay first GetFrontier call
            var delaySignal = new TaskCompletionSource<bool>();
            ((WordRepositoryMock)_wordRepo).SetGetFrontierDelay(delaySignal.Task);
            var firstCallTask = _mergeService.GetAndStorePotentialDuplicates(ProjId, 10, 10, userId);

            // Give first call time to start
            await Task.Delay(50);

            // Run the second call (will complete immediately)
            Assert.That(await _mergeService.GetAndStorePotentialDuplicates(ProjId, 10, 10, userId), Is.True);

            // Release and finish the first call
            delaySignal.SetResult(true);
            Assert.That(await firstCallTask, Is.False);
        }

        [Test]
        public async Task TestGetAndStorePotentialDuplicatesMultipleConcurrentUsers()
        {
            // If two users concurrently call GetAndStorePotentialDuplicates, both should return true, even if the
            // calls complete in different orders than they began.
            var userId1 = "User1";
            var userId2 = "User2";

            // Delay first GetFrontier call
            var delaySignal = new TaskCompletionSource<bool>();
            ((WordRepositoryMock)_wordRepo).SetGetFrontierDelay(delaySignal.Task);
            var firstCallTask = _mergeService.GetAndStorePotentialDuplicates(ProjId, 10, 10, userId1);

            // Give first call time to start
            await Task.Delay(50);

            // Run the second call (will complete immediately)
            Assert.That(await _mergeService.GetAndStorePotentialDuplicates(ProjId, 10, 10, userId2), Is.True);

            // Release and finish the first call
            delaySignal.SetResult(true);
            Assert.That(await firstCallTask, Is.True);
        }
    }
}
