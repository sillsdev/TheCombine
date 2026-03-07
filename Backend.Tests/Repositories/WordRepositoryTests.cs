using System;
using System.Linq;
using System.Threading.Tasks;
using Backend.Tests.Mocks;
using BackendFramework.Models;
using NUnit.Framework;

namespace Backend.Tests.Repositories
{
    /// <summary> Unit tests for <see cref="BackendFramework.Repositories.WordRepository"/>. </summary>
    internal sealed class WordRepositoryTests
    {
        private WordRepositoryTestHelper _wordRepo = null!;

        private const string ProjId = "WordRepositoryTestProjId";
        private const string OtherProjId = "WordRepositoryTestOtherProjId";

        [SetUp]
        public void Setup()
        {
            _wordRepo = new WordRepositoryTestHelper();
        }

        // --- GetAllWords ---

        [Test]
        public async Task GetAllWords_EmptyDb_ReturnsEmpty()
        {
            var result = await _wordRepo.GetAllWords(ProjId);
            Assert.That(result, Is.Empty);
        }

        [Test]
        public async Task GetAllWords_ReturnsOnlyWordsForProject()
        {
            var word = Util.RandomWord(ProjId);
            var otherWord = Util.RandomWord(OtherProjId);
            await _wordRepo.RepoCreate(word);
            await _wordRepo.RepoCreate(otherWord);

            var result = await _wordRepo.GetAllWords(ProjId);

            Assert.That(result, Has.Count.EqualTo(1));
            Assert.That(result.First().ProjectId, Is.EqualTo(ProjId));
        }

        [Test]
        public async Task GetAllWords_ExcludesZeroSenseWords()
        {
            var noSenses = new Word { ProjectId = ProjId, Senses = [], Vernacular = "v" };
            await _wordRepo.Add(noSenses);
            var withSenses = Util.RandomWord(ProjId);
            await _wordRepo.RepoCreate(withSenses);

            var result = await _wordRepo.GetAllWords(ProjId);

            // Only the word with senses should be returned
            Assert.That(result, Has.Count.EqualTo(1));
        }

        // --- GetWord ---

        [Test]
        public async Task GetWord_ExistingWord_ReturnsWord()
        {
            var created = await _wordRepo.RepoCreate(Util.RandomWord(ProjId));
            var result = await _wordRepo.GetWord(ProjId, created.Id);

            Assert.That(result, Is.Not.Null);
            Assert.That(result!.Id, Is.EqualTo(created.Id));
        }

        [Test]
        public async Task GetWord_MissingWord_ReturnsNull()
        {
            var result = await _wordRepo.GetWord(ProjId, "000000000000000000000099");
            Assert.That(result, Is.Null);
        }

        [Test]
        public async Task GetWord_WrongProject_ReturnsNull()
        {
            var created = await _wordRepo.RepoCreate(Util.RandomWord(ProjId));
            var result = await _wordRepo.GetWord(OtherProjId, created.Id);
            Assert.That(result, Is.Null);
        }

        // --- RepoCreate (single word) ---

        [Test]
        public async Task RepoCreate_AssignsId()
        {
            var word = Util.RandomWord(ProjId);
            var created = await _wordRepo.RepoCreate(word);

            Assert.That(created.Id, Is.Not.Empty);
        }

        [Test]
        public async Task RepoCreate_AddsToWordsAndFrontier()
        {
            var created = await _wordRepo.RepoCreate(Util.RandomWord(ProjId));

            var words = await _wordRepo.GetAllWords(ProjId);
            var frontier = await _wordRepo.GetAllFrontier(ProjId);

            Assert.That(words.Any(w => w.Id == created.Id), Is.True);
            Assert.That(frontier.Any(w => w.Id == created.Id), Is.True);
        }

        // --- RepoCreate (multiple words) ---

        [Test]
        public async Task RepoCreateList_ReturnsAllWords()
        {
            var words = Util.RandomWordList(3, ProjId);
            var created = await _wordRepo.RepoCreate(words);

            Assert.That(created, Has.Count.EqualTo(3));
            Assert.That(created.All(w => !string.IsNullOrEmpty(w.Id)), Is.True);
        }

        [Test]
        public async Task RepoCreateList_Empty_ReturnsEmpty()
        {
            var created = await _wordRepo.RepoCreate([]);
            Assert.That(created, Is.Empty);
        }

        // --- HasWords / HasFrontierWords ---

        [Test]
        public async Task HasWords_NoWords_ReturnsFalse()
        {
            Assert.That(await _wordRepo.HasWords(ProjId), Is.False);
        }

        [Test]
        public async Task HasWords_AfterCreate_ReturnsTrue()
        {
            await _wordRepo.RepoCreate(Util.RandomWord(ProjId));
            Assert.That(await _wordRepo.HasWords(ProjId), Is.True);
        }

        [Test]
        public async Task HasFrontierWords_NoFrontier_ReturnsFalse()
        {
            Assert.That(await _wordRepo.HasFrontierWords(ProjId), Is.False);
        }

        [Test]
        public async Task HasFrontierWords_AfterAddFrontier_ReturnsTrue()
        {
            await _wordRepo.AddFrontier([Util.RandomWord(ProjId)]);
            Assert.That(await _wordRepo.HasFrontierWords(ProjId), Is.True);
        }

        // --- IsInFrontier / AreInFrontier ---

        [Test]
        public async Task IsInFrontier_AfterCreate_ReturnsTrue()
        {
            var created = await _wordRepo.RepoCreate(Util.RandomWord(ProjId));
            Assert.That(await _wordRepo.IsInFrontier(ProjId, created.Id), Is.True);
        }

        [Test]
        public async Task IsInFrontier_NotInFrontier_ReturnsFalse()
        {
            var wordNotInFrontier = await _wordRepo.Add(Util.RandomWord(ProjId));
            Assert.That(await _wordRepo.IsInFrontier(ProjId, wordNotInFrontier.Id), Is.False);
        }

        [Test]
        public async Task AreInFrontier_AllIds_ReturnsTrue()
        {
            var w1 = await _wordRepo.RepoCreate(Util.RandomWord(ProjId));
            var w2 = await _wordRepo.RepoCreate(Util.RandomWord(ProjId));

            Assert.That(await _wordRepo.AreInFrontier(ProjId, [w1.Id, w2.Id], 2), Is.True);
        }

        [Test]
        public async Task AreInFrontier_MissingId_ReturnsFalse()
        {
            var w1 = await _wordRepo.RepoCreate(Util.RandomWord(ProjId));
            Assert.That(await _wordRepo.AreInFrontier(ProjId, [w1.Id, "000000000000000000000099"], 2), Is.False);
        }

        // --- GetFrontierCount ---

        [Test]
        public async Task GetFrontierCount_Empty_ReturnsZero()
        {
            Assert.That(await _wordRepo.GetFrontierCount(ProjId), Is.EqualTo(0));
        }

        [Test]
        public async Task GetFrontierCount_AfterCreate_ReturnsCorrectCount()
        {
            await _wordRepo.RepoCreate(Util.RandomWord(ProjId));
            await _wordRepo.RepoCreate(Util.RandomWord(ProjId));

            Assert.That(await _wordRepo.GetFrontierCount(ProjId), Is.EqualTo(2));
        }

        // --- GetAllFrontier ---

        [Test]
        public async Task GetAllFrontier_ReturnsOnlyProjectWords()
        {
            await _wordRepo.RepoCreate(Util.RandomWord(ProjId));
            await _wordRepo.RepoCreate(Util.RandomWord(OtherProjId));

            var frontier = await _wordRepo.GetAllFrontier(ProjId);

            Assert.That(frontier, Has.Count.EqualTo(1));
            Assert.That(frontier.All(w => w.ProjectId == ProjId), Is.True);
        }

        // --- GetFrontier ---

        [Test]
        public async Task GetFrontier_ExistingWord_ReturnsWord()
        {
            var created = await _wordRepo.RepoCreate(Util.RandomWord(ProjId));
            var result = await _wordRepo.GetFrontier(ProjId, created.Id);

            Assert.That(result, Is.Not.Null);
            Assert.That(result!.Id, Is.EqualTo(created.Id));
        }

        [Test]
        public async Task GetFrontier_MissingWord_ReturnsNull()
        {
            var result = await _wordRepo.GetFrontier(ProjId, "000000000000000000000099");
            Assert.That(result, Is.Null);
        }

        [Test]
        public async Task GetFrontier_WithAudioFilter_ReturnsCorrectWord()
        {
            const string fileName = "audio.mp3";
            var word = Util.RandomWord(ProjId);
            word.Audio.Add(new Pronunciation(fileName));
            var created = await _wordRepo.RepoCreate(word);

            var result = await _wordRepo.GetFrontier(ProjId, created.Id, fileName);
            Assert.That(result, Is.Not.Null);

            var resultNoFile = await _wordRepo.GetFrontier(ProjId, created.Id, "wrong.mp3");
            Assert.That(resultNoFile, Is.Null);
        }

        // --- GetFrontierWithVernacular ---

        [Test]
        public async Task GetFrontierWithVernacular_ReturnsMatchingWords()
        {
            const string vern = "unique-vernacular";
            var word = Util.RandomWord(ProjId);
            word.Vernacular = vern;
            await _wordRepo.RepoCreate(word);
            await _wordRepo.RepoCreate(Util.RandomWord(ProjId)); // Different vernacular

            var result = await _wordRepo.GetFrontierWithVernacular(ProjId, vern);

            Assert.That(result, Has.Count.EqualTo(1));
            Assert.That(result.First().Vernacular, Is.EqualTo(vern));
        }

        // --- DeleteAllFrontierWords ---

        [Test]
        public async Task DeleteAllFrontierWords_RemovesAllFrontierWords()
        {
            await _wordRepo.RepoCreate(Util.RandomWord(ProjId));
            await _wordRepo.RepoCreate(Util.RandomWord(ProjId));

            var deleted = await _wordRepo.DeleteAllFrontierWords(ProjId);

            Assert.That(deleted, Is.True);
            Assert.That(await _wordRepo.GetFrontierCount(ProjId), Is.EqualTo(0));
        }

        [Test]
        public async Task DeleteAllFrontierWords_EmptyFrontier_ReturnsFalse()
        {
            var deleted = await _wordRepo.DeleteAllFrontierWords(ProjId);
            Assert.That(deleted, Is.False);
        }

        [Test]
        public async Task DeleteAllFrontierWords_OnlyDeletesForProject()
        {
            await _wordRepo.RepoCreate(Util.RandomWord(ProjId));
            await _wordRepo.RepoCreate(Util.RandomWord(OtherProjId));

            await _wordRepo.DeleteAllFrontierWords(ProjId);

            Assert.That(await _wordRepo.GetFrontierCount(ProjId), Is.EqualTo(0));
            Assert.That(await _wordRepo.GetFrontierCount(OtherProjId), Is.EqualTo(1));
        }

        // --- AddFrontier ---

        [Test]
        public async Task AddFrontier_AddsOnlyToFrontier()
        {
            var words = Util.RandomWordList(2, ProjId);
            var added = await _wordRepo.AddFrontier(words);

            Assert.That(added, Has.Count.EqualTo(2));
            Assert.That(await _wordRepo.HasFrontierWords(ProjId), Is.True);
            // Words collection should NOT have these words
            Assert.That(await _wordRepo.HasWords(ProjId), Is.False);
        }

        // --- RepoUpdateFrontier (by id) ---

        [Test]
        public async Task RepoUpdateFrontierById_UpdatesWord()
        {
            const string newVernacular = "updated-vernacular";
            var created = await _wordRepo.RepoCreate(Util.RandomWord(ProjId));

            var updated = await _wordRepo.RepoUpdateFrontier(ProjId, created.Id,
                w => w.Vernacular = newVernacular);

            Assert.That(updated, Is.Not.Null);
            Assert.That(updated!.Vernacular, Is.EqualTo(newVernacular));
            // New word should be in frontier
            var frontier = await _wordRepo.GetAllFrontier(ProjId);
            Assert.That(frontier.Any(w => w.Vernacular == newVernacular), Is.True);
        }

        [Test]
        public async Task RepoUpdateFrontierById_MissingWord_ReturnsNull()
        {
            var result = await _wordRepo.RepoUpdateFrontier(ProjId, "000000000000000000000099",
                _ => { });
            Assert.That(result, Is.Null);
        }

        // --- RepoDeleteFrontier ---

        [Test]
        public async Task RepoDeleteFrontier_RemovesFromFrontier_AddsToWords()
        {
            var created = await _wordRepo.RepoCreate(Util.RandomWord(ProjId));

            var deleted = await _wordRepo.RepoDeleteFrontier(ProjId, created.Id, _ => { });

            Assert.That(deleted, Is.Not.Null);
            Assert.That(await _wordRepo.IsInFrontier(ProjId, created.Id), Is.False);
            // Should still be in words
            Assert.That(await _wordRepo.GetAllWords(ProjId), Has.Count.AtLeast(1));
        }

        [Test]
        public async Task RepoDeleteFrontier_MissingWord_ReturnsNull()
        {
            var result = await _wordRepo.RepoDeleteFrontier(ProjId, "000000000000000000000099", _ => { });
            Assert.That(result, Is.Null);
        }

        // --- RepoRestoreFrontier ---

        [Test]
        public async Task RepoRestoreFrontier_RestoresWordToFrontier()
        {
            var created = await _wordRepo.RepoCreate(Util.RandomWord(ProjId));
            // Remove from frontier (but keep in words)
            await _wordRepo.RepoDeleteFrontier(ProjId, created.Id, _ => { });
            Assert.That(await _wordRepo.IsInFrontier(ProjId, created.Id), Is.False);

            var restored = await _wordRepo.RepoRestoreFrontier(ProjId, [created.Id]);

            Assert.That(restored, Has.Count.EqualTo(1));
            Assert.That(await _wordRepo.IsInFrontier(ProjId, restored.First().Id), Is.True);
        }

        [Test]
        public async Task RepoRestoreFrontier_EmptyList_ReturnsEmpty()
        {
            var result = await _wordRepo.RepoRestoreFrontier(ProjId, []);
            Assert.That(result, Is.Empty);
        }

        // --- CountFrontierWordsWithDomain ---

        [Test]
        public async Task CountFrontierWordsWithDomain_ReturnsCorrectCount()
        {
            const string domainId = "1.1";
            var wordWithDomain = Util.RandomWord(ProjId);
            wordWithDomain.Senses.First().SemanticDomains.Add(new SemanticDomain { Id = domainId });
            var wordWithoutDomain = Util.RandomWord(ProjId);
            await _wordRepo.RepoCreate(wordWithDomain);
            await _wordRepo.RepoCreate(wordWithoutDomain);

            var count = await _wordRepo.CountFrontierWordsWithDomain(ProjId, domainId);

            Assert.That(count, Is.EqualTo(1));
        }

        // --- Transaction behavior: abort on error ---

        [Test]
        public void RepoRevertReplaceFrontier_WithInvalidIds_Throws()
        {
            // Providing idsToRestore that overlap with idsToDelete should throw
            Assert.That(
                async () => await _wordRepo.RepoRevertReplaceFrontier(ProjId, ["id1"], ["id1"], _ => { }),
                Throws.TypeOf<ArgumentException>());
        }
    }
}
