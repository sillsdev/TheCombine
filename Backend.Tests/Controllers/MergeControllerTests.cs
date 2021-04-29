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

        private Word RandomWord()
        {
            var word = new Word
            {
                Created = Util.RandString(),
                Vernacular = Util.RandString(),
                Modified = Util.RandString(),
                PartOfSpeech = Util.RandString(),
                Plural = Util.RandString(),
                History = new List<string>(),
                Audio = new List<string>(),
                EditedBy = new List<string> { Util.RandString(), Util.RandString() },
                ProjectId = _projId,
                Senses = new List<Sense> { new Sense(), new Sense(), new Sense() },
                Note = new Note { Language = Util.RandString(), Text = Util.RandString() }
            };

            foreach (var sense in word.Senses)
            {
                sense.Accessibility = State.Active;
                sense.Glosses = new List<Gloss> { new Gloss(), new Gloss(), new Gloss() };

                foreach (var gloss in sense.Glosses)
                {
                    gloss.Def = Util.RandString();
                    gloss.Language = Util.RandString(3);
                }

                sense.SemanticDomains = new List<SemanticDomain>
                {
                    new SemanticDomain(), new SemanticDomain(), new SemanticDomain()
                };

                foreach (var semDom in sense.SemanticDomains)
                {
                    semDom.Name = Util.RandString();
                    semDom.Id = Util.RandString();
                    semDom.Description = Util.RandString();
                }
            }

            return word;
        }

        [Test]
        public void MergeWordsOneChild()
        {
            var thisWord = RandomWord();
            thisWord = _wordRepo.Create(thisWord).Result;

            var mergeObject = new MergeWords
            {
                Parent = thisWord,
                Children = new List<MergeSourceWord>
                {
                    new MergeSourceWord { SrcWordId = thisWord.Id }
                }
            };

            var newWords = _mergeService.Merge(_projId, new List<MergeWords> { mergeObject }).Result;

            // There should only be 1 word added and it should be identical to what we passed in
            Assert.That(newWords, Has.Count.EqualTo(1));
            Assert.IsTrue(newWords.First().ContentEquals(thisWord));

            // Check that the only word in the frontier is the new word
            var frontier = _wordRepo.GetFrontier(_projId).Result;
            Assert.That(frontier, Has.Count.EqualTo(1));
            Assert.AreEqual(frontier.First(), newWords.First());

            // Check that new word has the right history
            Assert.That(newWords.First().History, Has.Count.EqualTo(1));
            Assert.AreEqual(newWords.First().History.First(), thisWord.Id);
        }

        [Test]
        public void MergeWordsMultiChild()
        {
            // Build a mergeWords with a parent with 3 children.
            var mergeWords = new MergeWords { Parent = RandomWord() };
            const int numberOfChildren = 3;
            foreach (var _ in Enumerable.Range(0, numberOfChildren))
            {
                var child = RandomWord();
                var id = _wordRepo.Create(child).Result.Id;
                Assert.IsNotNull(_wordRepo.GetWord(_projId, id).Result);
                mergeWords.Children.Add(new MergeSourceWord { SrcWordId = id });
            }
            Assert.That(_wordRepo.GetFrontier(_projId).Result, Has.Count.EqualTo(numberOfChildren));

            var mergeWordsList = new List<MergeWords> { mergeWords };
            var newWords = _mergeService.Merge(_projId, mergeWordsList).Result;

            // Check for correct history length;
            var dbParent = newWords.First();
            Assert.That(dbParent.History, Has.Count.EqualTo(numberOfChildren));

            // Confirm that parent added to repo and children not in frontier.
            Assert.IsNotNull(_wordRepo.GetWord(_projId, dbParent.Id).Result);
            Assert.That(_wordRepo.GetFrontier(_projId).Result, Has.Count.EqualTo(1));
        }

        [Test]
        public void MergeWordsMultiple()
        {
            var mergeWordsA = new MergeWords { Parent = RandomWord() };
            var mergeWordsB = new MergeWords { Parent = RandomWord() };
            var mergeWordsList = new List<MergeWords> { mergeWordsA, mergeWordsB };
            var newWords = _mergeService.Merge(_projId, mergeWordsList).Result;

            Assert.That(newWords, Has.Count.EqualTo(2));
            Assert.AreNotEqual(newWords.First().Id, newWords.Last().Id);

            var frontier = _wordRepo.GetFrontier(_projId).Result;
            Assert.That(frontier, Has.Count.EqualTo(2));
            Assert.AreNotEqual(frontier.First().Id, frontier.Last().Id);
            Assert.Contains(frontier.First(), newWords);
            Assert.Contains(frontier.Last(), newWords);
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
