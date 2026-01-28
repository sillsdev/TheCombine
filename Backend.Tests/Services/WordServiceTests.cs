using System.Linq;
using Backend.Tests.Mocks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Services;
using NUnit.Framework;

namespace Backend.Tests.Services
{
    internal sealed class WordServiceTests
    {
        private IWordRepository _wordRepo = null!;
        private IWordService _wordService = null!;

        private const string ProjId = "WordServiceTestProjId";
        private const string UserId = "WordServiceTestUserId";
        private const string WordId = "WordServiceTestWordId";

        [SetUp]
        public void Setup()
        {
            var semDomCountRepo = new SemanticDomainCountRepositoryMock();
            _wordRepo = new WordRepositoryMock();
            var semDomCountService = new SemanticDomainCountService(semDomCountRepo);
            _wordService = new WordService(_wordRepo, semDomCountService);
        }

        [Test]
        public void TestCreateAddsUserId()
        {
            var word = _wordService.Create(UserId, new Word { EditedBy = ["other"] }).Result;
            Assert.That(word.EditedBy, Has.Count.EqualTo(2));
            Assert.That(word.EditedBy.Last(), Is.EqualTo(UserId));
        }

        [Test]
        public void TestCreateDoesNotAddDuplicateUserId()
        {
            var word = _wordService.Create(UserId, new Word { EditedBy = [UserId] }).Result;
            Assert.That(word.EditedBy, Has.Count.EqualTo(1));
        }

        [Test]
        public void TestCreateMultipleWords()
        {
            _ = _wordService.Create(UserId, [new() { ProjectId = ProjId }, new() { ProjectId = ProjId }]).Result;
            Assert.That(_wordRepo.GetAllWords(ProjId).Result, Has.Count.EqualTo(2));
            Assert.That(_wordRepo.GetFrontier(ProjId).Result, Has.Count.EqualTo(2));
        }

        [Test]
        public void TestDeleteAudioBadInputNull()
        {
            var fileName = "audio.mp3";
            var wordInFrontier = _wordRepo.Create(
                new Word() { Audio = [new() { FileName = fileName }], ProjectId = ProjId }).Result;
            Assert.That(_wordService.DeleteAudio("non-proj-id", UserId, wordInFrontier.Id, fileName).Result, Is.Null);
            Assert.That(_wordService.DeleteAudio(ProjId, UserId, "non-word-id", fileName).Result, Is.Null);
            Assert.That(_wordService.DeleteAudio(ProjId, UserId, wordInFrontier.Id, "non-file-name").Result, Is.Null);
        }

        [Test]
        public void TestDeleteAudioNotInFrontierNull()
        {
            var fileName = "audio.mp3";
            var wordNotInFrontier = _wordRepo.Add(
                new() { Audio = [new() { FileName = fileName }], ProjectId = ProjId }).Result;
            Assert.That(_wordService.DeleteAudio(ProjId, UserId, wordNotInFrontier.Id, fileName).Result, Is.Null);
        }

        [Test]
        public void TestDeleteAudio()
        {
            var fileName = "audio.mp3";
            var wordInFrontier = _wordRepo.Create(
                new Word() { Audio = [new() { FileName = fileName }], ProjectId = ProjId }).Result;
            var result = _wordService.DeleteAudio(ProjId, UserId, wordInFrontier.Id, fileName).Result;
            Assert.That(result!.EditedBy.Last(), Is.EqualTo(UserId));
            Assert.That(result!.History.Last(), Is.EqualTo(wordInFrontier.Id));
            Assert.That(_wordRepo.IsInFrontier(ProjId, result.Id).Result, Is.True);
            Assert.That(_wordRepo.IsInFrontier(ProjId, wordInFrontier.Id).Result, Is.False);
        }

        [Test]
        public void TestUpdateNotInFrontierNull()
        {
            Assert.That(_wordService.Update(ProjId, UserId, WordId, new Word()).Result, Is.Null);
        }

        [Test]
        public void TestUpdateReplacesFrontierWord()
        {
            var word = _wordRepo.Create(new Word { ProjectId = ProjId }).Result;
            Assert.That(word, Is.Not.Null);
            var oldId = word.Id;
            word.Vernacular = "NewVern";
            Assert.That(_wordService.Update(ProjId, UserId, oldId, word).Result, Is.EqualTo(word.Id));
            var frontier = _wordRepo.GetFrontier(ProjId).Result;
            Assert.That(frontier, Has.Count.EqualTo(1));
            var newWord = frontier.First();
            Assert.That(newWord.Id, Is.Not.EqualTo(oldId));
            Assert.That(newWord.History.Last(), Is.EqualTo(oldId));
        }

        [Test]
        public void TestUpdateUsingCitationForm()
        {
            // Create a word with UsingCitationForm true.
            var word = _wordRepo.Create(new Word { ProjectId = ProjId, UsingCitationForm = true }).Result;
            Assert.That(word, Is.Not.Null);
            Assert.That(word.UsingCitationForm, Is.True);

            // Update something other than Vernacular and make sure UsingCitationForm is still true.
            word.Note = new() { Text = "change word's note" };
            _ = _wordService.Update(ProjId, UserId, word.Id, word).Result;
            Assert.That(word.UsingCitationForm, Is.True);

            // Update the Vernacular and make sure UsingCitationForm is false.
            word.Vernacular = "change word's vernacular form";
            _ = _wordService.Update(ProjId, UserId, word.Id, word).Result;
            Assert.That(word.UsingCitationForm, Is.False);
        }

        [Test]
        public void TestRestoreFrontierWordsMissingWordFalse()
        {
            var word = _wordRepo.Add(new Word { ProjectId = ProjId }).Result;
            Assert.That(_wordService.RestoreFrontierWords(ProjId, ["NotAnId", word.Id]).Result, Is.False);
        }

        [Test]
        public void TestRestoreFrontierWordsFrontierWordFalse()
        {
            var wordNoFrontier = _wordRepo.Add(new Word { ProjectId = ProjId }).Result;
            var wordYesFrontier = _wordRepo.Create(new Word { ProjectId = ProjId }).Result;
            Assert.That(_wordRepo.GetFrontier(ProjId).Result, Has.Count.EqualTo(1));
            Assert.That(
                _wordService.RestoreFrontierWords(ProjId, [wordNoFrontier.Id, wordYesFrontier.Id]).Result, Is.False);
        }

        [Test]
        public void TestRestoreFrontierWordsTrue()
        {
            var word1 = _wordRepo.Add(new Word { ProjectId = ProjId }).Result;
            var word2 = _wordRepo.Add(new Word { ProjectId = ProjId }).Result;
            Assert.That(_wordRepo.GetFrontier(ProjId).Result, Is.Empty);
            Assert.That(_wordService.RestoreFrontierWords(ProjId, [word1.Id, word2.Id]).Result, Is.True);
            Assert.That(_wordRepo.GetFrontier(ProjId).Result, Has.Count.EqualTo(2));
        }

        [Test]
        public void TestFindContainingWordNoFrontier()
        {
            var newWord = Util.RandomWord(ProjId);

            var dupId = _wordService.FindContainingWord(newWord).Result;

            // The word should be unique, as the frontier is empty.
            Assert.That(dupId, Is.Null);
        }

        [Test]
        public void TestFindContainingWordNewVern()
        {
            var oldWordSameProj = Util.RandomWord(ProjId);
            _ = _wordRepo.Create(oldWordSameProj).Result;
            var oldWordDiffProj = Util.RandomWord("different");
            _ = _wordRepo.Create(oldWordDiffProj).Result;
            var newWord = Util.RandomWord(ProjId);
            newWord.Vernacular = oldWordDiffProj.Vernacular;
            newWord.Senses = oldWordDiffProj.Senses.Select(s => s.Clone()).ToList();

            var dupId = _wordService.FindContainingWord(newWord).Result;
            // The word should be unique: an identical word is in a diff project.
            Assert.That(dupId, Is.Null);
        }

        [Test]
        public void TestFindContainingWordSameVernSubsetSense()
        {
            var oldWord = Util.RandomWord(ProjId);
            var newWord = Util.RandomWord(ProjId);
            newWord.Vernacular = oldWord.Vernacular;

            // Sense of new word is subset of one sense of old word.
            var oldSense = Util.RandomSense();
            newWord.Senses = [oldSense.Clone()];
            oldSense.Definitions.Add(Util.RandomDefinition());
            oldSense.Glosses.Add(Util.RandomGloss());
            oldWord.Senses.Add(oldSense);
            oldWord = _wordRepo.Create(oldWord).Result;

            var dupId = _wordService.FindContainingWord(newWord).Result;
            Assert.That(dupId, Is.EqualTo(oldWord.Id));
        }

        [Test]
        public void TestFindContainingWordSameVernEmptySensesDiffDoms()
        {
            var oldWord = Util.RandomWord(ProjId);
            oldWord = _wordRepo.Create(oldWord).Result;
            var newWord = Util.RandomWord(ProjId);
            newWord.Vernacular = oldWord.Vernacular;

            // New word sense with no definitions and blank gloss.
            var newSense = oldWord.Senses.First().Clone();
            newSense.Definitions.Clear();
            newSense.Glosses = [new Gloss()];
            newSense.SemanticDomains.Add(Util.RandomSemanticDomain());
            newWord.Senses = [newSense];

            var dupId = _wordService.FindContainingWord(newWord).Result;
            Assert.That(dupId, Is.Null);
        }

        [Test]
        public void TestFindContainingWordSameVernEmptySensesSameDoms()
        {
            var oldWord = Util.RandomWord(ProjId);
            var newWord = Util.RandomWord(ProjId);
            newWord.Vernacular = oldWord.Vernacular;

            // New word sense with no definitions/gloss,
            // but SemDoms subset of an old sense with no def/gloss.
            var emptySense = Util.RandomSense();
            emptySense.Definitions.Clear();
            emptySense.Glosses.Clear();
            newWord.Senses = [emptySense.Clone()];
            emptySense.SemanticDomains.Add(Util.RandomSemanticDomain());
            oldWord.Senses.Add(emptySense);
            oldWord = _wordRepo.Create(oldWord).Result;

            var dupId = _wordService.FindContainingWord(newWord).Result;
            Assert.That(dupId, Is.EqualTo(oldWord.Id));
        }
    }
}
