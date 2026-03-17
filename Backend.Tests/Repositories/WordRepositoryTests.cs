using System;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Contexts;
using BackendFramework.Models;
using BackendFramework.Repositories;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using NUnit.Framework;

namespace Backend.Tests.Repositories
{
    /// <summary>
    /// Integration tests for <see cref="WordRepository"/> that spin up an actual MongoDB instance.
    /// </summary>
    [TestFixture]
    [Category("IntegrationTest")]
    public sealed class WordRepositoryTests
    {
        private static MongoDbTestRunner _runner = null!;
        private WordRepository _repo = null!;
        private string _projectId = null!;

        [OneTimeSetUp]
        public static void StartMongo()
        {
            _runner?.Dispose();
            _runner = MongoDbTestRunner.Start();
        }

        [OneTimeTearDown]
        public static void StopMongo()
        {
            _runner?.Dispose();
        }

        [SetUp]
        public void SetUp()
        {
            _projectId = Guid.NewGuid().ToString();
            var options = Options.Create(new BackendFramework.Startup.Settings
            {
                ConnectionString = _runner.ConnectionString,
                CombineDatabase = "WordRepositoryTests",
            });
            _repo = new WordRepository(new MongoDbContext(options));
        }

        private Task<Word> CreateWord(string? vernacular = null, string? domainId = null)
        {
            var word = Util.RandomWord(_projectId);
            if (vernacular is not null)
            {
                word.Vernacular = vernacular;
            }

            if (domainId is not null)
            {
                word.Senses[0].SemanticDomains = [new SemanticDomain { Id = domainId, Name = "Test" }];
            }

            return _repo.Create(word);
        }

        /// <summary> Generates a valid MongoDB ObjectId string that does not exist in the database. </summary>
        private static string NewObjectId() => ObjectId.GenerateNewId().ToString();

        [Test]
        public async Task TestGetAllWords()
        {
            var word = await CreateWord();
            var words = await _repo.GetAllWords(_projectId);
            Assert.That(words, Has.Count.EqualTo(1));
            Assert.That(words[0].Id, Is.EqualTo(word.Id));
        }

        [Test]
        public async Task TestGetAllWordsEmptyProject()
        {
            var words = await _repo.GetAllWords(_projectId);
            Assert.That(words, Is.Empty);
        }

        [Test]
        public async Task TestGetAllWordsOnlyReturnsWordsForProject()
        {
            await CreateWord();
            var otherProjectWords = await _repo.GetAllWords(Guid.NewGuid().ToString());
            Assert.That(otherProjectWords, Is.Empty);
        }

        [Test]
        public async Task TestGetWord()
        {
            var created = await CreateWord();
            var retrieved = await _repo.GetWord(_projectId, created.Id);
            Assert.That(retrieved, Is.Not.Null);
            Assert.That(retrieved.Id, Is.EqualTo(created.Id));
        }

        [Test]
        public async Task TestGetWordNonExistentIdReturnsNull()
        {
            var result = await _repo.GetWord(_projectId, NewObjectId());
            Assert.That(result, Is.Null);
        }

        [Test]
        public async Task TestCreateSingleWordAddsToWordsAndFrontier()
        {
            var word = Util.RandomWord(_projectId);
            var created = await _repo.Create(word);

            Assert.That(created.Id, Is.Not.Empty);
            Assert.That(await _repo.GetWord(_projectId, created.Id), Is.Not.Null);
            Assert.That(await _repo.IsInFrontier(_projectId, created.Id), Is.True);
        }

        [Test]
        public async Task TestCreateSingleWordClearsOriginalId()
        {
            var word = Util.RandomWord(_projectId);
            var originalId = word.Id;
            var created = await _repo.Create(word);

            Assert.That(created.Id, Is.Not.EqualTo(originalId));
        }

        [Test]
        public async Task TestCreateListOfWordsAddsAll()
        {
            var words = Util.RandomWordList(3, _projectId);
            var created = await _repo.Create(words);

            Assert.That(created, Has.Count.EqualTo(3));
            foreach (var w in created)
            {
                Assert.That(await _repo.GetWord(_projectId, w.Id), Is.Not.Null);
                Assert.That(await _repo.IsInFrontier(_projectId, w.Id), Is.True);
            }
        }

        [Test]
        public async Task TestCreateEmptyListReturnsEmpty()
        {
            var created = await _repo.Create([]);
            Assert.That(created, Is.Empty);
        }

        [Test]
        public async Task TestDeleteAllFrontierWordsRemovesAllFrontierWords()
        {
            await CreateWord();
            await CreateWord();

            var deleted = await _repo.DeleteAllFrontierWords(_projectId);

            Assert.That(deleted, Is.True);
            Assert.That(await _repo.HasFrontierWords(_projectId), Is.False);
            Assert.That(await _repo.HasWords(_projectId), Is.True);
        }

        [Test]
        public async Task TestDeleteAllFrontierWordsEmptyFrontierReturnsFalse()
        {
            var result = await _repo.DeleteAllFrontierWords(_projectId);
            Assert.That(result, Is.False);
        }

        [Test]
        public async Task TestHasWordsAfterCreateReturnsTrue()
        {
            await CreateWord();
            Assert.That(await _repo.HasWords(_projectId), Is.True);
        }

        [Test]
        public async Task TestHasWordsEmptyProjectReturnsFalse()
        {
            Assert.That(await _repo.HasWords(_projectId), Is.False);
        }

        [Test]
        public async Task TestHasFrontierWordsAfterCreateReturnsTrue()
        {
            await CreateWord();
            Assert.That(await _repo.HasFrontierWords(_projectId), Is.True);
        }

        [Test]
        public async Task TestHasFrontierWordsAfterDeleteAllReturnsFalse()
        {
            await CreateWord();
            await _repo.DeleteAllFrontierWords(_projectId);
            Assert.That(await _repo.HasFrontierWords(_projectId), Is.False);
        }

        [Test]
        public async Task TestIsInFrontierExistingWordReturnsTrue()
        {
            var word = await CreateWord();
            Assert.That(await _repo.IsInFrontier(_projectId, word.Id), Is.True);
        }

        [Test]
        public async Task TestIsInFrontierNonExistentWordReturnsFalse()
        {
            Assert.That(await _repo.IsInFrontier(_projectId, NewObjectId()), Is.False);
        }

        [Test]
        public async Task TestAreInFrontierNegativeCountReturnsTrue()
        {
            Assert.That(await _repo.AreInFrontier(_projectId, [], -1), Is.True);
        }

        [Test]
        public async Task TestAreInFrontierZeroCountReturnsTrue()
        {
            Assert.That(await _repo.AreInFrontier(_projectId, [NewObjectId()], 0), Is.True);
        }

        [Test]
        public async Task TestAreInFrontierAllPresentReturnsTrue()
        {
            var w1 = await CreateWord();
            var w2 = await CreateWord();
            Assert.That(await _repo.AreInFrontier(_projectId, [w1.Id, w2.Id], 2), Is.True);
        }

        [Test]
        public async Task TestAreInFrontierPartialMatchWithLowerCountReturnsTrue()
        {
            var w1 = await CreateWord();
            Assert.That(await _repo.AreInFrontier(_projectId, [w1.Id, NewObjectId()], 1), Is.True);
        }

        [Test]
        public async Task TestAreInFrontierPartialMatchWithExactCountReturnsFalse()
        {
            var w1 = await CreateWord();
            Assert.That(await _repo.AreInFrontier(_projectId, [w1.Id, NewObjectId()], 2), Is.False);
        }

        [Test]
        public async Task TestGetFrontierCountReturnsCorrectCount()
        {
            await CreateWord();
            await CreateWord();
            Assert.That(await _repo.GetFrontierCount(_projectId), Is.EqualTo(2));
        }

        [Test]
        public async Task TestGetFrontierCountEmptyProjectReturnsZero()
        {
            Assert.That(await _repo.GetFrontierCount(_projectId), Is.Zero);
        }

        [Test]
        public async Task TestGetAllFrontierReturnsAllFrontierWords()
        {
            var w1 = await CreateWord();
            var w2 = await CreateWord();
            var frontier = await _repo.GetAllFrontier(_projectId);
            var ids = frontier.Select(w => w.Id).ToList();
            Assert.That(ids, Contains.Item(w1.Id));
            Assert.That(ids, Contains.Item(w2.Id));
        }

        [Test]
        public async Task TestGetFrontierExistingWordReturnsWord()
        {
            var word = await CreateWord();
            var retrieved = await _repo.GetFrontier(_projectId, word.Id);
            Assert.That(retrieved, Is.Not.Null);
            Assert.That(retrieved.Id, Is.EqualTo(word.Id));
        }

        [Test]
        public async Task TestGetFrontierNonExistentWordReturnsNull()
        {
            var result = await _repo.GetFrontier(_projectId, NewObjectId());
            Assert.That(result, Is.Null);
        }

        [Test]
        public async Task TestGetFrontierWithMatchingAudioReturnsWord()
        {
            var word = Util.RandomWord(_projectId);
            word.Audio = [new Pronunciation { FileName = "test.mp3" }];
            word = await _repo.Create(word);

            var retrieved = await _repo.GetFrontier(_projectId, word.Id, "test.mp3");
            Assert.That(retrieved, Is.Not.Null);
        }

        [Test]
        public async Task TestGetFrontierWithNonMatchingAudioReturnsNull()
        {
            var word = Util.RandomWord(_projectId);
            word.Audio = [new Pronunciation { FileName = "test.mp3" }];
            word = await _repo.Create(word);

            var retrieved = await _repo.GetFrontier(_projectId, word.Id, "other.mp3");
            Assert.That(retrieved, Is.Null);
        }

        [Test]
        public async Task TestGetFrontierWithVernacularReturnsMatchingWords()
        {
            const string vern = "special_vern";
            await CreateWord(vernacular: vern);
            await CreateWord();

            var results = await _repo.GetFrontierWithVernacular(_projectId, vern);
            Assert.That(results, Has.Count.EqualTo(1));
            Assert.That(results[0].Vernacular, Is.EqualTo(vern));
        }

        [Test]
        public async Task TestGetFrontierWithVernacularNoMatchReturnsEmpty()
        {
            await CreateWord(vernacular: "other_vern");
            var results = await _repo.GetFrontierWithVernacular(_projectId, "nonexistent");
            Assert.That(results, Is.Empty);
        }

        [Test]
        public async Task TestDeleteFrontierRemovesFromFrontierAndArchives()
        {
            var created = await CreateWord();
            var createdId = created.Id;

            var deleted = await _repo.DeleteFrontier(_projectId, createdId, w => w.Accessibility = Status.Deleted);

            Assert.That(deleted, Is.Not.Null);
            Assert.That(await _repo.IsInFrontier(_projectId, createdId), Is.False);
            Assert.That(deleted.Id, Is.Not.EqualTo(createdId));
            Assert.That(deleted.Accessibility, Is.EqualTo(Status.Deleted));
        }

        [Test]
        public async Task TestDeleteFrontierNonExistentReturnsNull()
        {
            var result = await _repo.DeleteFrontier(_projectId, NewObjectId(), _ => { });
            Assert.That(result, Is.Null);
        }

        [Test]
        public async Task TestDeleteFrontierModifyActionThrowsLeavesRepoUnchanged()
        {
            var created = await CreateWord();
            var createdId = created.Id;

            Assert.ThrowsAsync<InvalidOperationException>(() =>
                _repo.DeleteFrontier(_projectId, createdId, w =>
                {
                    w.Accessibility = Status.Deleted;
                    throw new InvalidOperationException();
                }));

            Assert.That((await _repo.GetAllWords(_projectId)).Select(w => w.Id), Is.EqualTo([createdId]));

            Assert.That(await _repo.GetFrontierCount(_projectId), Is.EqualTo(1));
            var frontierWord = await _repo.GetFrontier(_projectId, createdId);
            Assert.That(frontierWord, Is.Not.Null);
            Assert.That(frontierWord.Accessibility, Is.Not.EqualTo(Status.Deleted));
        }

        [Test]
        public async Task TestRestoreFrontierRestoresWordToFrontier()
        {
            var word = await CreateWord();
            var wordId = word.Id;
            await _repo.DeleteFrontier(_projectId, wordId, _ => { });
            Assert.That(await _repo.IsInFrontier(_projectId, wordId), Is.False);

            var restored = await _repo.RestoreFrontier(_projectId, wordId);
            Assert.That(restored, Is.True);
            Assert.That(await _repo.IsInFrontier(_projectId, wordId), Is.True);
        }

        [Test]
        public async Task TestRestoreFrontierNotFoundReturnsFalse()
        {
            var result = await _repo.RestoreFrontier(_projectId, NewObjectId());
            Assert.That(result, Is.False);
        }

        [Test]
        public async Task TestRestoreFrontierAlreadyInFrontierThrows()
        {
            var word = await CreateWord();
            Assert.ThrowsAsync<ArgumentException>(() => _repo.RestoreFrontier(_projectId, word.Id));
        }

        [Test]
        public async Task TestRestoreFrontierDeletedWordThrows()
        {
            // Create a word and archive it as Deleted
            var word = await CreateWord();
            var archivedWord = await _repo.DeleteFrontier(_projectId, word.Id, w => w.Accessibility = Status.Deleted);
            Assert.That(archivedWord, Is.Not.Null);

            Assert.ThrowsAsync<ArgumentException>(() => _repo.RestoreFrontier(_projectId, archivedWord.Id));
        }

        [Test]
        public async Task TestUpdateFrontierByIdsUpdatesWord()
        {
            var created = await CreateWord();
            var createdId = created.Id;
            const string newVernacular = "updated_vernacular";

            var updated = await _repo.UpdateFrontier(_projectId, createdId, w => w.Vernacular = newVernacular);

            Assert.That(updated, Is.Not.Null);
            Assert.That(updated.Vernacular, Is.EqualTo(newVernacular));
            Assert.That(updated.Id, Is.Not.EqualTo(createdId));
            Assert.That(await _repo.IsInFrontier(_projectId, createdId), Is.False);
            Assert.That(await _repo.IsInFrontier(_projectId, updated.Id), Is.True);
        }

        [Test]
        public async Task TestUpdateFrontierByIdsNonExistentReturnsNull()
        {
            var result = await _repo.UpdateFrontier(_projectId, NewObjectId(), _ => { });
            Assert.That(result, Is.Null);
        }

        [Test]
        public async Task TestUpdateFrontierByIdsModifyActionThrowsLeavesRepoUnchanged()
        {
            var created = await CreateWord();
            var createdId = created.Id;
            const string newVernacular = "should_not_persist";

            Assert.ThrowsAsync<InvalidOperationException>(() =>
                 _repo.UpdateFrontier(_projectId, createdId, w =>
                 {
                     w.Vernacular = newVernacular;
                     throw new InvalidOperationException();
                 }));

            Assert.That((await _repo.GetAllWords(_projectId)).Select(w => w.Id), Is.EqualTo([createdId]));

            Assert.That(await _repo.GetFrontierCount(_projectId), Is.EqualTo(1));
            var frontierWord = await _repo.GetFrontier(_projectId, createdId);
            Assert.That(frontierWord, Is.Not.Null);
            Assert.That(frontierWord.Vernacular, Is.Not.EqualTo(newVernacular));
        }

        [Test]
        public async Task TestUpdateFrontierByWordUpdatesWord()
        {
            var created = await CreateWord();
            var createdId = created.Id;
            const string newVernacular = "updated_vernacular";
            var updatedWord = created.Clone();
            updatedWord.Vernacular = newVernacular;

            var result = await _repo.UpdateFrontier(updatedWord, (newWord, oldWord) =>
            {
                Assert.That(oldWord, Is.Not.Null);
                newWord.History = [oldWord.Id];
            });

            Assert.That(result, Is.Not.Null);
            Assert.That(result.History, Is.EqualTo([createdId]));
            Assert.That(result.Vernacular, Is.EqualTo(newVernacular));
            Assert.That(await _repo.IsInFrontier(_projectId, createdId), Is.False);
            Assert.That(await _repo.IsInFrontier(_projectId, result.Id), Is.True);
        }

        [Test]
        public async Task TestUpdateFrontierByWordNotInFrontierReturnsNullAndLeavesRepoUnchanged()
        {
            var word = Util.RandomWord(_projectId);
            word.Id = NewObjectId();

            var result = await _repo.UpdateFrontier(word, (_, _) => { });

            Assert.That(result, Is.Null);
            Assert.That(await _repo.HasWords(_projectId), Is.False);
            Assert.That(await _repo.HasFrontierWords(_projectId), Is.False);
        }

        [Test]
        public async Task TestUpdateFrontierByWordModifyActionThrowsLeavesRepoUnchanged()
        {
            var created = await CreateWord();
            var createdId = created.Id;
            const string newVernacular = "should_not_persist";
            var updatedWord = created.Clone();
            updatedWord.Vernacular = newVernacular;

            Assert.ThrowsAsync<InvalidOperationException>(() =>
                _repo.UpdateFrontier(updatedWord, (_, _) => throw new InvalidOperationException()));

            Assert.That((await _repo.GetAllWords(_projectId)).Select(w => w.Id), Is.EqualTo([createdId]));

            Assert.That(await _repo.GetFrontierCount(_projectId), Is.EqualTo(1));
            var frontierWord = await _repo.GetFrontier(_projectId, createdId);
            Assert.That(frontierWord, Is.Not.Null);
            Assert.That(frontierWord.Vernacular, Is.Not.EqualTo(newVernacular));
        }

        [Test]
        public async Task TestReplaceFrontierUpdatesAndDeletesWords()
        {
            var toUpdate = await CreateWord();
            var toUpdateId = toUpdate.Id;
            var toDelete = await CreateWord();
            var toDeleteId = toDelete.Id;
            const string newVernacular = "updated_vernacular";
            var updatedWord = toUpdate.Clone();
            updatedWord.Vernacular = newVernacular;

            var result = await _repo.ReplaceFrontier(_projectId, [updatedWord], [toUpdateId, toDeleteId],
                modifyUpdatedWord: (newWord, oldWord) =>
                {
                    Assert.That(oldWord, Is.Not.Null);
                    newWord.History = [oldWord.Id];
                },
                modifyDeletedWord: w => w.Accessibility = Status.Deleted);

            Assert.That(result, Is.Not.Null);
            Assert.That(result, Has.Count.EqualTo(1));
            Assert.That(result[0].History, Is.EqualTo([toUpdateId]));
            Assert.That(result[0].Vernacular, Is.EqualTo(newVernacular));

            var allWords = await _repo.GetAllWords(_projectId);
            Assert.That(allWords, Has.Count.EqualTo(4));
            Assert.That(allWords.Where(w => w.Accessibility != Status.Deleted).Select(w => w.Id),
                Is.EquivalentTo([toUpdateId, toDeleteId, result[0].Id]));

            Assert.That(await _repo.IsInFrontier(_projectId, toUpdateId), Is.False);
            Assert.That(await _repo.IsInFrontier(_projectId, toDeleteId), Is.False);
            Assert.That(await _repo.GetFrontierCount(_projectId), Is.EqualTo(1));
            Assert.That(await _repo.IsInFrontier(_projectId, result[0].Id), Is.True);

        }

        [Test]
        public async Task TestReplaceFrontierEmptyListsReturnsEmpty()
        {
            var result = await _repo.ReplaceFrontier(_projectId, [], [], (_, _) => { }, _ => { });
            Assert.That(result, Is.Not.Null);
            Assert.That(result, Is.Empty);
        }

        [Test]
        public async Task TestReplaceFrontierCreatesWordNotInFrontier()
        {
            var newWord = Util.RandomWord(_projectId);
            newWord.Id = NewObjectId();

            var result = await _repo.ReplaceFrontier(_projectId, [newWord], [], (_, _) => { }, _ => { });

            Assert.That(result, Is.Not.Null);
            Assert.That(result, Has.Count.EqualTo(1));
            Assert.That(await _repo.IsInFrontier(_projectId, result[0].Id), Is.True);
        }

        [Test]
        public async Task TestReplaceFrontierModifyUpdatedActionThrowsLeavesRepoUnchanged()
        {
            var toUpdate = await CreateWord();
            var toUpdateId = toUpdate.Id;
            var toDelete = await CreateWord();
            var toDeleteId = toDelete.Id;
            const string newVernacular = "should_not_persist";
            var updatedWord = toUpdate.Clone();
            updatedWord.Vernacular = newVernacular;

            Assert.ThrowsAsync<InvalidOperationException>(() => _repo.ReplaceFrontier(_projectId,
                [updatedWord], [toUpdateId, toDeleteId], (_, _) => throw new InvalidOperationException(), _ => { }));

            Assert.That((await _repo.GetAllWords(_projectId)).Select(w => w.Id),
                Is.EquivalentTo([toUpdateId, toDeleteId]));

            Assert.That(await _repo.GetFrontierCount(_projectId), Is.EqualTo(2));
            Assert.That(await _repo.IsInFrontier(_projectId, toDeleteId), Is.True);
            var frontierWordToUpdate = await _repo.GetFrontier(_projectId, toUpdateId);
            Assert.That(frontierWordToUpdate, Is.Not.Null);
            Assert.That(frontierWordToUpdate.Vernacular, Is.Not.EqualTo(newVernacular));
        }

        [Test]
        public async Task TestReplaceFrontierModifyDeletedActionThrowsLeavesRepoUnchanged()
        {
            var toDelete = await CreateWord();
            var toDeleteId = toDelete.Id;

            Assert.ThrowsAsync<InvalidOperationException>(() => _repo.ReplaceFrontier(
                _projectId, [], [toDeleteId], (_, _) => { }, _ => throw new InvalidOperationException()));

            Assert.That((await _repo.GetAllWords(_projectId)).Select(w => w.Id), Is.EqualTo([toDeleteId]));

            Assert.That(await _repo.GetFrontierCount(_projectId), Is.EqualTo(1));
            Assert.That(await _repo.IsInFrontier(_projectId, toDeleteId), Is.True);
        }

        [Test]
        public void TestReplaceFrontierDifferentProjectIdThrows()
        {
            var newWord = Util.RandomWord(Guid.NewGuid().ToString());
            Assert.ThrowsAsync<ArgumentException>(() =>
                _repo.ReplaceFrontier(_projectId, [newWord], [], (_, _) => { }, _ => { }));
        }

        [Test]
        public void TestReplaceFrontierMissingDeleteIdThrows()
        {
            Assert.ThrowsAsync<ArgumentException>(() =>
                _repo.ReplaceFrontier(_projectId, [], [NewObjectId()], (_, _) => { }, _ => { }));
        }

        [Test]
        public async Task TestRevertReplaceFrontierRestoresAndDeletes()
        {
            var toRestore = await CreateWord();
            var toRestoreId = toRestore.Id;
            var toDelete = await CreateWord();
            var toDeleteId = toDelete.Id;

            // Remove toRestore from frontier so it can be restored later
            await _repo.DeleteFrontier(_projectId, toRestoreId, _ => { });

            var result = await _repo.RevertReplaceFrontier(
                _projectId, [toRestoreId], [toDeleteId], w => w.Accessibility = Status.Deleted);

            Assert.That(result, Is.True);
            Assert.That(await _repo.IsInFrontier(_projectId, toRestoreId), Is.True);
            Assert.That(await _repo.IsInFrontier(_projectId, toDeleteId), Is.False);
        }

        [Test]
        public async Task TestRevertReplaceFrontierEmptyListsReturnsTrue()
        {
            var result = await _repo.RevertReplaceFrontier(_projectId, [], [], _ => { });
            Assert.That(result, Is.True);
        }

        [Test]
        public async Task TestRevertReplaceFrontierMissingDeleteIdReturnsFalseAndLeavesRepoUnchanged()
        {
            var toRestore = await CreateWord();
            var toRestoreId = toRestore.Id;
            var toDelete = await CreateWord();
            var toDeleteId = toDelete.Id;
            await _repo.DeleteFrontier(_projectId, toRestoreId, _ => { });

            var result = await _repo.RevertReplaceFrontier(
                _projectId, [toRestoreId], [toDeleteId, NewObjectId()], _ => { });

            Assert.That(result, Is.False);
            Assert.That(await _repo.IsInFrontier(_projectId, toRestoreId), Is.False);
            Assert.That(await _repo.IsInFrontier(_projectId, toDeleteId), Is.True);
        }

        [Test]
        public async Task TestRevertReplaceFrontierMissingRestoreIdReturnsFalseAndLeavesRepoUnchanged()
        {
            var toRestore = await CreateWord();
            var toRestoreId = toRestore.Id;
            var toDelete = await CreateWord();
            var toDeleteId = toDelete.Id;
            await _repo.DeleteFrontier(_projectId, toRestoreId, _ => { });

            var result = await _repo.RevertReplaceFrontier(
                _projectId, [toRestoreId, NewObjectId()], [toDeleteId], _ => { });

            Assert.That(result, Is.False);
            Assert.That(await _repo.IsInFrontier(_projectId, toDeleteId), Is.True);
            Assert.That(await _repo.IsInFrontier(_projectId, toRestoreId), Is.False);
        }

        [Test]
        public async Task TestRevertReplaceFrontierModifyDeletedActionThrowsLeavesRepoUnchanged()
        {
            var toRestore = await CreateWord();
            var toRestoreId = toRestore.Id;
            var toDelete = await CreateWord();
            var toDeleteId = toDelete.Id;
            await _repo.DeleteFrontier(_projectId, toRestoreId, _ => { });

            Assert.ThrowsAsync<InvalidOperationException>(() => _repo.RevertReplaceFrontier(
                _projectId, [toRestoreId], [toDeleteId], _ => throw new InvalidOperationException()));

            Assert.That((await _repo.GetAllWords(_projectId)).Count, Is.EqualTo(3));

            Assert.That(await _repo.GetFrontierCount(_projectId), Is.EqualTo(1));
            Assert.That(await _repo.IsInFrontier(_projectId, toDeleteId), Is.True);
            Assert.That(await _repo.IsInFrontier(_projectId, toRestoreId), Is.False);
        }

        [Test]
        public async Task TestRevertReplaceFrontierOverlappingIdsThrows()
        {
            var word = await CreateWord();
            Assert.ThrowsAsync<ArgumentException>(() =>
                _repo.RevertReplaceFrontier(_projectId, [word.Id], [word.Id], _ => { }));
        }

        [Test]
        public async Task TestCountFrontierWordsWithDomainReturnsCorrectCount()
        {
            const string domainId = "1.1";
            await CreateWord(domainId: domainId);
            await CreateWord(domainId: domainId);
            await CreateWord();

            var count = await _repo.CountFrontierWordsWithDomain(_projectId, domainId);
            Assert.That(count, Is.EqualTo(2));
        }

        [Test]
        public async Task TestCountFrontierWordsWithDomainNoneMatchReturnsZero()
        {
            await CreateWord();
            var count = await _repo.CountFrontierWordsWithDomain(_projectId, "99.99");
            Assert.That(count, Is.Zero);
        }
    }
}
