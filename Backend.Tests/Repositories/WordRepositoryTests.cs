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
            _runner.Dispose();
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

            return _repo.RepoCreate(word);
        }

        /// <summary> Generates a valid MongoDB ObjectId string that does not exist in the database. </summary>
        private static string NewObjectId() => ObjectId.GenerateNewId().ToString();

        // GET ALL WORDS

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

        // GET WORD

        [Test]
        public async Task TestGetWord()
        {
            var created = await CreateWord();
            var retrieved = await _repo.GetWord(_projectId, created.Id);
            Assert.That(retrieved, Is.Not.Null);
            Assert.That(retrieved!.Id, Is.EqualTo(created.Id));
        }

        [Test]
        public async Task TestGetWordNonExistentIdReturnsNull()
        {
            var result = await _repo.GetWord(_projectId, NewObjectId());
            Assert.That(result, Is.Null);
        }

        // REPO CREATE

        [Test]
        public async Task TestRepoCreateSingleWordAddsToWordsAndFrontier()
        {
            var word = Util.RandomWord(_projectId);
            var created = await _repo.RepoCreate(word);

            Assert.That(created.Id, Is.Not.Empty);
            Assert.That(await _repo.GetWord(_projectId, created.Id), Is.Not.Null);
            Assert.That(await _repo.IsInFrontier(_projectId, created.Id), Is.True);
        }

        [Test]
        public async Task TestRepoCreateSingleWordClearsOriginalId()
        {
            var word = Util.RandomWord(_projectId);
            var originalId = word.Id;
            var created = await _repo.RepoCreate(word);

            Assert.That(created.Id, Is.Not.EqualTo(originalId));
        }

        [Test]
        public async Task TestRepoCreateListOfWordsAddsAll()
        {
            var words = Util.RandomWordList(3, _projectId);
            var created = await _repo.RepoCreate(words);

            Assert.That(created, Has.Count.EqualTo(3));
            foreach (var w in created)
            {
                Assert.That(await _repo.GetWord(_projectId, w.Id), Is.Not.Null);
                Assert.That(await _repo.IsInFrontier(_projectId, w.Id), Is.True);
            }
        }

        [Test]
        public async Task TestRepoCreateEmptyListReturnsEmpty()
        {
            var created = await _repo.RepoCreate([]);
            Assert.That(created, Is.Empty);
        }

        // REPO UPDATE FRONTIER (by projectId, wordId, modifyWord)

        [Test]
        public async Task TestRepoUpdateFrontierByIdsUpdatesWord()
        {
            var created = await CreateWord();
            const string newVernacular = "updated_vernacular";

            var updated = await _repo.RepoUpdateFrontier(_projectId, created.Id, w => w.Vernacular = newVernacular);

            Assert.That(updated, Is.Not.Null);
            Assert.That(updated!.Vernacular, Is.EqualTo(newVernacular));
            Assert.That(updated.Id, Is.Not.EqualTo(created.Id));
            Assert.That(await _repo.IsInFrontier(_projectId, created.Id), Is.False);
            Assert.That(await _repo.IsInFrontier(_projectId, updated.Id), Is.True);
        }

        [Test]
        public async Task TestRepoUpdateFrontierByIdsNonExistentReturnsNull()
        {
            var result = await _repo.RepoUpdateFrontier(_projectId, NewObjectId(), _ => { });
            Assert.That(result, Is.Null);
        }

        // REPO UPDATE FRONTIER (by word and action)

        [Test]
        public async Task TestRepoUpdateFrontierByWordUpdatesWord()
        {
            var created = await CreateWord();
            var updatedWord = created.Clone();
            updatedWord.Vernacular = "new_vernacular";

            var result = await _repo.RepoUpdateFrontier(updatedWord, (newWord, oldWord) =>
            {
                Assert.That(oldWord, Is.Not.Null);
                Assert.That(oldWord!.Id, Is.EqualTo(created.Id));
                newWord.History = [created.Id];
            });

            Assert.That(result, Is.Not.Null);
            Assert.That(result!.History, Contains.Item(created.Id));
            Assert.That(await _repo.IsInFrontier(_projectId, created.Id), Is.False);
            Assert.That(await _repo.IsInFrontier(_projectId, result.Id), Is.True);
        }

        [Test]
        public async Task TestRepoUpdateFrontierByWordNotInFrontierReturnsNull()
        {
            var word = Util.RandomWord(_projectId);
            word.Id = NewObjectId();
            var result = await _repo.RepoUpdateFrontier(word, (_, _) => { });
            Assert.That(result, Is.Null);
        }

        // REPO REPLACE FRONTIER

        [Test]
        public async Task TestRepoReplaceFrontierUpdatesAndDeletesWords()
        {
            var toUpdate = await CreateWord();
            var toDelete = await CreateWord();

            var updatedWord = toUpdate.Clone();
            updatedWord.Vernacular = "replaced";
            string? capturedOldId = null;

            var result = await _repo.RepoReplaceFrontier(
                _projectId,
                newWords: [updatedWord],
                idsToDelete: [toUpdate.Id, toDelete.Id],
                modifyUpdatedWord: (newWord, oldWord) =>
                {
                    capturedOldId = oldWord?.Id;
                    newWord.History = [oldWord?.Id ?? ""];
                },
                modifyDeletedWord: w => w.Accessibility = Status.Deleted);

            Assert.That(result, Is.Not.Null);
            Assert.That(capturedOldId, Is.EqualTo(toUpdate.Id));
            Assert.That(await _repo.IsInFrontier(_projectId, toUpdate.Id), Is.False);
            Assert.That(await _repo.IsInFrontier(_projectId, toDelete.Id), Is.False);
        }

        [Test]
        public async Task TestRepoReplaceFrontierEmptyListsReturnsEmpty()
        {
            var result = await _repo.RepoReplaceFrontier(_projectId, [], [], (_, _) => { }, _ => { });
            Assert.That(result, Is.Not.Null);
            Assert.That(result, Is.Empty);
        }

        [Test]
        public async Task TestRepoReplaceFrontierCreatesWordNotInFrontier()
        {
            var newWord = Util.RandomWord(_projectId);
            newWord.Id = NewObjectId();

            var result = await _repo.RepoReplaceFrontier(
                _projectId, [newWord], [], (_, _) => { }, _ => { });

            Assert.That(result, Is.Not.Null);
            Assert.That(result, Has.Count.EqualTo(1));
            Assert.That(await _repo.IsInFrontier(_projectId, result![0].Id), Is.True);
        }

        // REPO REVERT REPLACE FRONTIER

        [Test]
        public async Task TestRepoRevertReplaceFrontierRestoresAndDeletes()
        {
            var toRestore = await CreateWord();
            var toDelete = await CreateWord();

            // Remove toRestore from frontier so it can be restored later
            await _repo.RepoDeleteFrontier(_projectId, toRestore.Id, _ => { });

            var restored = await _repo.RepoRevertReplaceFrontier(
                _projectId,
                idsToRestore: [toRestore.Id],
                idsToDelete: [toDelete.Id],
                modifyDeletedWord: w => w.Accessibility = Status.Deleted);

            Assert.That(restored, Has.Count.EqualTo(1));
            Assert.That(restored[0].Id, Is.EqualTo(toRestore.Id));
            Assert.That(await _repo.IsInFrontier(_projectId, toRestore.Id), Is.True);
            Assert.That(await _repo.IsInFrontier(_projectId, toDelete.Id), Is.False);
        }

        [Test]
        public async Task TestRepoRevertReplaceFrontierEmptyListsReturnsEmpty()
        {
            var result = await _repo.RepoRevertReplaceFrontier(_projectId, [], [], _ => { });
            Assert.That(result, Is.Empty);
        }

        [Test]
        public async Task TestRepoRevertReplaceFrontierOverlappingIdsThrows()
        {
            var word = await CreateWord();
            var ex = Assert.ThrowsAsync<ArgumentException>(() =>
                _repo.RepoRevertReplaceFrontier(_projectId, [word.Id], [word.Id], _ => { }));
            Assert.That(ex, Is.Not.Null);
        }

        // REPO DELETE FRONTIER

        [Test]
        public async Task TestRepoDeleteFrontierRemovesFromFrontierAndArchives()
        {
            var created = await CreateWord();
            var deleted = await _repo.RepoDeleteFrontier(
                _projectId, created.Id, w => w.Accessibility = Status.Deleted);

            Assert.That(deleted, Is.Not.Null);
            Assert.That(await _repo.IsInFrontier(_projectId, created.Id), Is.False);
            // The archived word has a new ID
            Assert.That(deleted!.Id, Is.Not.EqualTo(created.Id));
            Assert.That(deleted.Accessibility, Is.EqualTo(Status.Deleted));
        }

        [Test]
        public async Task TestRepoDeleteFrontierNonExistentReturnsNull()
        {
            var result = await _repo.RepoDeleteFrontier(_projectId, NewObjectId(), _ => { });
            Assert.That(result, Is.Null);
        }

        // DELETE ALL FRONTIER WORDS

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

        // HAS WORDS / HAS FRONTIER WORDS

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

        // IS IN FRONTIER / ARE IN FRONTIER

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

        // GET FRONTIER COUNT

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
            Assert.That(await _repo.GetFrontierCount(_projectId), Is.EqualTo(0));
        }

        // GET ALL FRONTIER

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

        // GET FRONTIER (single word)

        [Test]
        public async Task TestGetFrontierExistingWordReturnsWord()
        {
            var word = await CreateWord();
            var retrieved = await _repo.GetFrontier(_projectId, word.Id);
            Assert.That(retrieved, Is.Not.Null);
            Assert.That(retrieved!.Id, Is.EqualTo(word.Id));
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
            word = await _repo.RepoCreate(word);

            var retrieved = await _repo.GetFrontier(_projectId, word.Id, "test.mp3");
            Assert.That(retrieved, Is.Not.Null);
        }

        [Test]
        public async Task TestGetFrontierWithNonMatchingAudioReturnsNull()
        {
            var word = Util.RandomWord(_projectId);
            word.Audio = [new Pronunciation { FileName = "test.mp3" }];
            word = await _repo.RepoCreate(word);

            var retrieved = await _repo.GetFrontier(_projectId, word.Id, "other.mp3");
            Assert.That(retrieved, Is.Null);
        }

        // GET FRONTIER WITH VERNACULAR

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

        // REPO RESTORE FRONTIER

        [Test]
        public async Task TestRepoRestoreFrontierRestoresWordToFrontier()
        {
            var word = await CreateWord();
            await _repo.RepoDeleteFrontier(_projectId, word.Id, _ => { });
            Assert.That(await _repo.IsInFrontier(_projectId, word.Id), Is.False);

            var restored = await _repo.RepoRestoreFrontier(_projectId, [word.Id]);
            Assert.That(restored, Has.Count.EqualTo(1));
            Assert.That(await _repo.IsInFrontier(_projectId, word.Id), Is.True);
        }

        [Test]
        public async Task TestRepoRestoreFrontierEmptyListReturnsEmpty()
        {
            var result = await _repo.RepoRestoreFrontier(_projectId, []);
            Assert.That(result, Is.Empty);
        }

        [Test]
        public async Task TestRepoRestoreFrontierDeletedWordThrows()
        {
            // Create a word and archive it as Deleted
            var word = await CreateWord();
            var archivedWord = await _repo.RepoDeleteFrontier(
                _projectId, word.Id, w => w.Accessibility = Status.Deleted);
            Assert.That(archivedWord, Is.Not.Null);

            var ex = Assert.ThrowsAsync<ArgumentException>(() =>
                _repo.RepoRestoreFrontier(_projectId, [archivedWord!.Id]));
            Assert.That(ex, Is.Not.Null);
        }

        // ADD FRONTIER

        [Test]
        public async Task TestAddFrontierAddsWordsOnlyToFrontier()
        {
            var word = Util.RandomWord(_projectId);
            word.Id = NewObjectId();

            var added = await _repo.AddFrontier([word]);

            Assert.That(added, Has.Count.EqualTo(1));
            Assert.That(await _repo.IsInFrontier(_projectId, word.Id), Is.True);
            // Word was NOT added to the words collection
            Assert.That(await _repo.GetWord(_projectId, word.Id), Is.Null);
        }

        [Test]
        public async Task TestAddFrontierEmptyListReturnsEmpty()
        {
            var result = await _repo.AddFrontier([]);
            Assert.That(result, Is.Empty);
        }

        // COUNT FRONTIER WORDS WITH DOMAIN

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
            Assert.That(count, Is.EqualTo(0));
        }
    }
}
