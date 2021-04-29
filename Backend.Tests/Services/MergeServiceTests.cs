using System;
using System.Collections.Generic;
using System.Linq;
using Backend.Tests.Mocks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Services;
using NUnit.Framework;

namespace Backend.Tests.Servicess
{
    public class MergeServiceTests
    {
        private IMergeBlacklistRepository _mergeBlacklistRepo = null!;
        private IWordRepository _wordRepo = null!;
        private IMergeService _mergeService = null!;

        private string _projId = Guid.NewGuid().ToString();
        private string _userId = Guid.NewGuid().ToString();

        [SetUp]
        public void Setup()
        {
            _mergeBlacklistRepo = new MergeBlacklistRepositoryMock();
            _wordRepo = new WordRepositoryMock();
            _mergeService = new MergeService(_mergeBlacklistRepo, _wordRepo);
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
        public void MergeWordsOneChildTest()
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
            Assert.That(newWords.First().ContentEquals(thisWord));

            // Check that the only word in the frontier is the new word
            var frontier = _wordRepo.GetFrontier(_projId).Result;
            Assert.That(frontier, Has.Count.EqualTo(1));
            Assert.AreEqual(frontier.First(), newWords.First());

            // Check that new word has the right history
            Assert.That(newWords.First().History, Has.Count.EqualTo(1));
            Assert.AreEqual(newWords.First().History.First(), thisWord.Id);
        }

        [Test]
        public void MergeWordsMultiChildTest()
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
        public void MergeWordsMultipleTest()
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
        public void AddMergeToBlacklistTest()
        {
            _ = _mergeBlacklistRepo.DeleteAll(_projId).Result;
            var wordIds = new List<string> { "1", "2" };
            _ = _mergeService.AddToMergeBlacklist(_projId, _userId, wordIds).Result;
            var blacklist = _mergeBlacklistRepo.GetAll(_projId).Result;
            Assert.That(blacklist, Has.Count.EqualTo(1));
            var expectedEntry = new MergeBlacklistEntry { ProjectId = _projId, UserId = _userId, WordIds = wordIds };
            Assert.That(expectedEntry.ContentEquals(blacklist.First()));
        }

        [Test]
        public void AddMergeToBlacklistErrorTest()
        {
            _ = _mergeBlacklistRepo.DeleteAll(_projId).Result;
            var wordIds0 = new List<string>();
            var wordIds1 = new List<string> { "1" };
            Assert.ThrowsAsync<MergeService.InvalidBlacklistEntryError>(
                async () => { await _mergeService.AddToMergeBlacklist(_projId, _userId, wordIds0); });
            Assert.ThrowsAsync<MergeService.InvalidBlacklistEntryError>(
                async () => { await _mergeService.AddToMergeBlacklist(_projId, _userId, wordIds1); });
        }

        [Test]
        public void IsInMergeBlacklistTest()
        {
            _ = _mergeBlacklistRepo.DeleteAll(_projId).Result;
            var wordIds = new List<string> { "1", "2", "3" };
            var subWordIds = new List<string> { "3", "2" };

            Assert.IsFalse(_mergeService.IsInMergeBlacklist(_projId, subWordIds).Result);
            _ = _mergeService.AddToMergeBlacklist(_projId, _userId, wordIds).Result;
            Assert.IsTrue(_mergeService.IsInMergeBlacklist(_projId, subWordIds).Result);
        }

        [Test]
        public void IsInMergeBlacklistErrorTest()
        {
            _ = _mergeBlacklistRepo.DeleteAll(_projId).Result;
            var wordIds0 = new List<string>();
            var wordIds1 = new List<string> { "1" };
            Assert.ThrowsAsync<MergeService.InvalidBlacklistEntryError>(
                async () => { await _mergeService.IsInMergeBlacklist(_projId, wordIds0); });
            Assert.ThrowsAsync<MergeService.InvalidBlacklistEntryError>(
                async () => { await _mergeService.IsInMergeBlacklist(_projId, wordIds1); });
        }
    }
}
