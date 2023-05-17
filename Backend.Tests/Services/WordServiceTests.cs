using System.Collections.Generic;
using System.Linq;
using Backend.Tests.Mocks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Services;
using NUnit.Framework;

namespace Backend.Tests.Services
{
    public class WordServiceTests
    {
        private IWordRepository _wordRepo = null!;
        private IWordService _wordService = null!;

        private const string ProjId = "WordServiceTestProjId";

        [SetUp]
        public void Setup()
        {
            _wordRepo = new WordRepositoryMock();
            _wordService = new WordService(_wordRepo);
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
            newWord.Senses = new List<Sense> { oldSense.Clone() };
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
            newSense.Glosses = new List<Gloss> { new Gloss() };
            newSense.SemanticDomains.Add(Util.RandomSemanticDomain());
            newWord.Senses = new List<Sense> { newSense };

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
            newWord.Senses = new List<Sense> { emptySense.Clone() };
            emptySense.SemanticDomains.Add(Util.RandomSemanticDomain());
            oldWord.Senses.Add(emptySense);
            oldWord = _wordRepo.Create(oldWord).Result;

            var dupId = _wordService.FindContainingWord(newWord).Result;
            Assert.That(dupId, Is.EqualTo(oldWord.Id));
        }
    }
}
