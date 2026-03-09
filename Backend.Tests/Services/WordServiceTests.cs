using System;
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
        private WordRepositoryMock _wordRepo = null!;
        private IWordService _wordService = null!;

        private const string ProjId = "WordServiceTestProjId";
        private const string UserId = "WordServiceTestUserId";
        private const string WordId = "WordServiceTestWordId";

        [SetUp]
        public void Setup()
        {
            _wordRepo = new WordRepositoryMock();
            _wordService = new WordService(_wordRepo);
        }

        [Test]
        public void TestImportWordsDoesNotChangeTimestamps()
        {
            const string existingCreated = "existing-created";
            const string existingModified = "existing-modified";

            var importedWords = _wordService.ImportWords([
                new Word { ProjectId = ProjId },
                new Word { ProjectId = ProjId, Created = existingCreated, Modified = existingModified },
            ]).Result;

            Assert.That(importedWords, Has.Count.EqualTo(2));
            Assert.That(importedWords[0].Created, Is.Not.Empty);
            Assert.That(importedWords[0].Modified, Is.Not.Empty);
            Assert.That(importedWords[1].Created, Is.EqualTo(existingCreated));
            Assert.That(importedWords[1].Modified, Is.EqualTo(existingModified));
            Assert.That(_wordRepo.GetAllFrontier(ProjId).Result, Has.Count.EqualTo(2));
        }

        [Test]
        public void TestImportWordsEmptyInputReturnsEmptyAndDoesNotChangeRepo()
        {
            var importedWords = _wordService.ImportWords([]).Result;

            Assert.That(importedWords, Is.Empty);
            Assert.That(_wordRepo.GetAllFrontier(ProjId).Result, Is.Empty);
            Assert.That(_wordRepo.GetAllWords(ProjId).Result, Is.Empty);
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
        public void TestCreateBlankUserIdDoesNotAppendEditedBy()
        {
            var word = _wordService.Create("", new Word { EditedBy = ["other"] }).Result;

            Assert.That(word.EditedBy, Has.Count.EqualTo(1));
            Assert.That(word.EditedBy.Last(), Is.EqualTo("other"));
        }

        [Test]
        public void TestCreatePreservesCreatedAndUpdatesModified()
        {
            const string existingCreated = "existing-created";
            const string existingModified = "existing-modified";

            var createdWord = _wordService.Create(UserId,
                new Word { ProjectId = ProjId, Created = existingCreated, Modified = existingModified }).Result;

            Assert.That(createdWord.Created, Is.EqualTo(existingCreated));
            Assert.That(createdWord.Modified, Is.Not.EqualTo(existingModified));
        }

        [Test]
        public void TestDeleteAudioBadInput()
        {
            var fileName = "audio.mp3";
            var wordInFrontier = _wordRepo.Create(
                new Word() { Audio = [new() { FileName = fileName }], ProjectId = ProjId }).Result;
            Assert.That(_wordService.DeleteAudio("non-proj-id", UserId, wordInFrontier.Id, fileName).Result, Is.Null);
            Assert.That(_wordService.DeleteAudio(ProjId, UserId, "non-word-id", fileName).Result, Is.Null);

            var result = _wordService.DeleteAudio(ProjId, UserId, wordInFrontier.Id, "non-file-name").Result;
            Assert.That(result, Is.Null);
        }

        [Test]
        public void TestDeleteAudioNotInFrontierReturnsNull()
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
            var oldId = wordInFrontier.Id;

            var newWord = _wordService.DeleteAudio(ProjId, UserId, oldId, fileName).Result;

            // New word is correct
            Assert.That(newWord, Is.Not.Null);
            Assert.That(newWord.Id, Is.Not.EqualTo(oldId));
            Assert.That(newWord.Audio, Is.Empty);
            Assert.That(newWord.EditedBy.Last(), Is.EqualTo(UserId));
            Assert.That(newWord.History, Is.Empty);

            // New word is only one in frontier
            Assert.That(_wordRepo.IsInFrontier(ProjId, newWord.Id).Result, Is.True);
            Assert.That(_wordRepo.GetAllFrontier(ProjId).Result, Has.Count.EqualTo(1));

            // Original word persists
            var allWords = _wordRepo.GetAllWords(ProjId).Result;
            Assert.That(allWords, Has.Count.EqualTo(2));
            Assert.That(allWords.Find(w => w.Id == newWord.Id), Is.Not.Null);
            var oldWord = allWords.Find(w => w.Id == oldId);
            Assert.That(oldWord, Is.Not.Null);
            Assert.That(oldWord.Audio, Has.Count.EqualTo(1));
            Assert.That(oldWord.History, Is.Empty);
        }

        [Test]
        public void TestDeleteFrontierWordNotInFrontierReturnsNull()
        {
            var wordNotInFrontier = _wordRepo.Add(new Word { ProjectId = ProjId }).Result;
            Assert.That(_wordService.DeleteFrontierWord(ProjId, UserId, wordNotInFrontier.Id).Result, Is.Null);
            Assert.That(_wordService.DeleteFrontierWord("wrong-proj", UserId, WordId).Result, Is.Null);
        }

        [Test]
        public void TestDeleteFrontierWordCopiesToWordsAndRemovesFrontier()
        {
            var oldId = _wordRepo.Create(new Word { ProjectId = ProjId }).Result.Id;

            var deletedId = _wordService.DeleteFrontierWord(ProjId, UserId, oldId).Result;

            Assert.That(deletedId, Is.Not.Null);
            Assert.That(deletedId, Is.Not.EqualTo(oldId));
            var deletedWord = _wordRepo.GetWord(ProjId, deletedId).Result;
            Assert.That(deletedWord, Is.Not.Null);
            Assert.That(deletedWord.Accessibility, Is.EqualTo(Status.Deleted));
            Assert.That(deletedWord.History.Last(), Is.EqualTo(oldId));
            Assert.That(deletedWord.EditedBy.Last(), Is.EqualTo(UserId));

            var allWordIds = _wordRepo.GetAllWords(ProjId).Result.Select(w => w.Id).ToList();
            Assert.That(allWordIds, Has.Count.EqualTo(2));
            Assert.That(allWordIds, Does.Contain(oldId));
            Assert.That(allWordIds, Does.Contain(deletedId));

            Assert.That(_wordRepo.GetAllFrontier(ProjId).Result, Is.Empty);
        }

        [Test]
        public void TestDeleteFrontierWordPreservesHistoryAndAppendsDeletedId()
        {
            var word = _wordRepo.Create(new Word { ProjectId = ProjId, History = ["older-1", "older-2"] }).Result;

            var deletedId = _wordService.DeleteFrontierWord(ProjId, UserId, word.Id).Result;
            Assert.That(deletedId, Is.Not.Null);
            var deletedWord = _wordRepo.GetWord(ProjId, deletedId).Result;
            var expectedHistoryPrefix = new[] { "older-1", "older-2" };

            Assert.That(deletedWord, Is.Not.Null);
            Assert.That(deletedWord.History, Has.Count.EqualTo(3));
            Assert.That(deletedWord.History.Take(2), Is.EqualTo(expectedHistoryPrefix));
            Assert.That(deletedWord.History.Last(), Is.EqualTo(word.Id));
        }

        [Test]
        public void TestRestoreFrontierWordAlreadyInFrontierThrows()
        {
            var wordInFrontier = _wordRepo.Create(new Word { ProjectId = ProjId }).Result;
            Assert.That(_wordRepo.GetAllFrontier(ProjId).Result, Has.Count.EqualTo(1));

            var ex = Assert.Throws<AggregateException>(
                () => _wordService.RestoreFrontierWord(ProjId, wordInFrontier.Id).Wait());
            Assert.That(ex?.InnerException, Is.InstanceOf<ArgumentException>());
        }

        [Test]
        public void TestRestoreFrontierWordDeletedWordThrows()
        {
            var deletedWord = _wordRepo.Add(new Word { ProjectId = ProjId, Accessibility = Status.Deleted }).Result;

            var ex = Assert.Throws<AggregateException>(
                () => _wordService.RestoreFrontierWord(ProjId, deletedWord.Id).Wait());
            Assert.That(ex?.InnerException, Is.InstanceOf<ArgumentException>());
        }

        [Test]
        public void TestRestoreFrontierWordMissingWordReturnsFalse()
        {
            _wordRepo.Add(new Word { ProjectId = ProjId }).Wait();

            var result = _wordService.RestoreFrontierWord(ProjId, "NotAnId").Result;

            Assert.That(result, Is.False);
            Assert.That(_wordRepo.GetAllFrontier(ProjId).Result, Is.Empty);
        }

        [Test]
        public void TestRestoreFrontierWordReturnsTrueRestoresWords()
        {
            var word = _wordRepo.Add(new Word { ProjectId = ProjId }).Result;
            Assert.That(_wordRepo.GetAllFrontier(ProjId).Result, Is.Empty);

            var result = _wordService.RestoreFrontierWord(ProjId, word.Id).Result;

            Assert.That(result, Is.True);
            Assert.That(_wordRepo.GetAllFrontier(ProjId).Result, Has.Count.EqualTo(1));
        }

        [Test]
        public void TestUpdateNotInFrontierReturnsNull()
        {
            Assert.That(_wordService.Update(UserId, new Word() { Id = WordId, ProjectId = ProjId }).Result, Is.Null);
        }

        [Test]
        public void TestUpdateReplacesFrontierWord()
        {
            var word = _wordRepo.Create(new Word { ProjectId = ProjId }).Result;
            Assert.That(word, Is.Not.Null);
            var oldId = word.Id;
            word.Vernacular = "NewVern";

            var updatedWord = _wordService.Update(UserId, word).Result;
            Assert.That(updatedWord, Is.Not.Null);
            Assert.That(updatedWord.Guid, Is.EqualTo(word.Guid));

            var frontier = _wordRepo.GetAllFrontier(ProjId).Result;
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
            var nonVernUpdate = _wordService.Update(UserId, word).Result;
            Assert.That(nonVernUpdate, Is.Not.Null);
            Assert.That(nonVernUpdate.UsingCitationForm, Is.True);

            // Update the Vernacular and make sure UsingCitationForm is false.
            nonVernUpdate.Vernacular = "change word's vernacular form";
            var vernUpdate = _wordService.Update(UserId, nonVernUpdate).Result;
            Assert.That(vernUpdate, Is.Not.Null);
            Assert.That(vernUpdate.UsingCitationForm, Is.False);
        }

        [Test]
        public void TestUpdateDoesNotDuplicateExistingHistoryId()
        {
            var word = _wordRepo.Create(new Word { ProjectId = ProjId }).Result;
            var oldId = word.Id;
            word.History.Add(oldId);

            var updatedWord = _wordService.Update(UserId, word).Result;

            Assert.That(updatedWord, Is.Not.Null);
            Assert.That(updatedWord.History.Count(id => id == oldId), Is.EqualTo(1));
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
            _wordRepo.Create(oldWordSameProj).Wait();
            var oldWordDiffProj = Util.RandomWord("different");
            _wordRepo.Create(oldWordDiffProj).Wait();
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

        [Test]
        public void TestFindContainingWordIgnoresWordsNotInFrontier()
        {
            var oldWordInWordsOnly = Util.RandomWord(ProjId);
            oldWordInWordsOnly = _wordRepo.Add(oldWordInWordsOnly).Result;

            var newWord = Util.RandomWord(ProjId);
            newWord.Vernacular = oldWordInWordsOnly.Vernacular;
            newWord.Senses = oldWordInWordsOnly.Senses.Select(s => s.Clone()).ToList();

            var dupId = _wordService.FindContainingWord(newWord).Result;

            Assert.That(dupId, Is.Null);
        }

        [Test]
        public void TestMergeReplaceFrontierUpdatesAndDeletes()
        {
            var childToReplace = _wordRepo.Create(Util.RandomWord(ProjId)).Result;
            var childToDelete = _wordRepo.Create(Util.RandomWord(ProjId)).Result;
            var parent = Util.RandomWord(ProjId);
            parent.Id = childToReplace.Id;
            parent.Vernacular = "merged-vern";

            var mergedParents = _wordService
                .MergeReplaceFrontier(ProjId, UserId, [parent], [childToReplace.Id, childToDelete.Id]).Result;

            Assert.That(mergedParents, Is.Not.Null);
            Assert.That(mergedParents, Has.Count.EqualTo(1));

            var mergedParent = mergedParents.Single();
            Assert.That(mergedParent.Id, Is.Not.EqualTo(childToReplace.Id));
            Assert.That(mergedParent.History.Last(), Is.EqualTo(childToReplace.Id));
            Assert.That(mergedParent.EditedBy.Last(), Is.EqualTo(UserId));

            var frontier = _wordRepo.GetAllFrontier(ProjId).Result;
            Assert.That(frontier, Has.Count.EqualTo(1));
            Assert.That(frontier.Single().Id, Is.EqualTo(mergedParent.Id));

            var deletedCopy = _wordRepo.GetAllWords(ProjId).Result
                .Find(w => w.Accessibility == Status.Deleted && w.History.Contains(childToDelete.Id));
            Assert.That(deletedCopy, Is.Not.Null);
            Assert.That(deletedCopy.EditedBy.Last(), Is.EqualTo(UserId));
        }

        [Test]
        public void TestMergeReplaceFrontierWrongProjectThrows()
        {
            var parent = Util.RandomWord("other-project");

            var ex = Assert.Throws<AggregateException>(
                () => _wordService.MergeReplaceFrontier(ProjId, UserId, [parent], []).Wait());
            Assert.That(ex?.InnerException, Is.InstanceOf<ArgumentException>());
        }

        [Test]
        public void TestMergeReplaceFrontierDeleteOnlyReturnsEmpty()
        {
            var kid1 = _wordRepo.Create(new Word { ProjectId = ProjId }).Result;
            var kid2 = _wordRepo.Create(new Word { ProjectId = ProjId }).Result;

            var mergedParents = _wordService.MergeReplaceFrontier(ProjId, UserId, [], [kid1.Id, kid2.Id]).Result;

            Assert.That(mergedParents, Is.Not.Null);
            Assert.That(mergedParents, Is.Empty);
            Assert.That(_wordRepo.GetAllFrontier(ProjId).Result, Is.Empty);

            var allWords = _wordRepo.GetAllWords(ProjId).Result;
            Assert.That(allWords.Any(w => w.Accessibility == Status.Deleted && w.History.Contains(kid1.Id)), Is.True);
            Assert.That(allWords.Any(w => w.Accessibility == Status.Deleted && w.History.Contains(kid2.Id)), Is.True);
        }

        [Test]
        public void TestRevertMergeReplaceFrontierDeletesAndRestores()
        {
            var wordToRestore = _wordRepo.Add(new Word { ProjectId = ProjId }).Result;
            var frontierWordToDelete = _wordRepo.Create(new Word { ProjectId = ProjId }).Result;

            var result = _wordService.RevertMergeReplaceFrontier(
                ProjId, UserId, [wordToRestore.Id], [frontierWordToDelete.Id]).Result;

            Assert.That(result, Is.True);
            Assert.That(_wordRepo.IsInFrontier(ProjId, wordToRestore.Id).Result, Is.True);
            Assert.That(_wordRepo.IsInFrontier(ProjId, frontierWordToDelete.Id).Result, Is.False);

            var deletedCopy = _wordRepo.GetAllWords(ProjId).Result
                .Find(w => w.Accessibility == Status.Deleted && w.History.Contains(frontierWordToDelete.Id));
            Assert.That(deletedCopy, Is.Not.Null);
            Assert.That(deletedCopy.EditedBy.Last(), Is.EqualTo(UserId));
        }

        [Test]
        public void TestRevertMergeReplaceFrontierMissingRestoreReturnsFalse()
        {
            var frontierWordToDelete = _wordRepo.Create(new Word { ProjectId = ProjId }).Result;

            var result = _wordService.RevertMergeReplaceFrontier(
                ProjId, UserId, ["missing-id"], [frontierWordToDelete.Id]).Result;

            Assert.That(result, Is.False);
            Assert.That(_wordRepo.IsInFrontier(ProjId, frontierWordToDelete.Id).Result, Is.False);
        }

        [Test]
        public void TestRevertMergeReplaceFrontierOverlappingIdsThrows()
        {
            var word = _wordRepo.Create(new Word { ProjectId = ProjId }).Result;

            var ex = Assert.Throws<AggregateException>(
                () => _wordService.RevertMergeReplaceFrontier(ProjId, UserId, [word.Id], [word.Id]).Wait());
            Assert.That(ex?.InnerException, Is.InstanceOf<ArgumentException>());
        }

        [Test]
        public void TestRevertMergeReplaceFrontierNoOpReturnsTrueAndLeavesStateUnchanged()
        {
            _wordRepo.Create(new Word { ProjectId = ProjId }).Wait();
            _wordRepo.Add(new Word { ProjectId = ProjId }).Wait();

            var wordsBefore = _wordRepo.GetAllWords(ProjId).Result.Select(w => w.Id).OrderBy(id => id).ToList();
            var frontierBefore = _wordRepo.GetAllFrontier(ProjId).Result.Select(w => w.Id).OrderBy(id => id).ToList();

            var result = _wordService.RevertMergeReplaceFrontier(ProjId, UserId, [], []).Result;

            var wordsAfter = _wordRepo.GetAllWords(ProjId).Result.Select(w => w.Id).OrderBy(id => id).ToList();
            var frontierAfter = _wordRepo.GetAllFrontier(ProjId).Result.Select(w => w.Id).OrderBy(id => id).ToList();

            Assert.That(result, Is.True);
            Assert.That(wordsAfter, Is.EqualTo(wordsBefore));
            Assert.That(frontierAfter, Is.EqualTo(frontierBefore));
        }
    }
}
