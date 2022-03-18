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
        public void WordIsUniqueNoFrontierTrue()
        {
            var newWord = Util.RandomWord(ProjId);

            var isUnique = _wordService.WordIsUnique(newWord).Result;

            // The word should be unique, as the frontier is empty.
            Assert.That(isUnique, Is.True);

            // There should only be no change to the frontier.
            var frontier = _wordRepo.GetFrontier(ProjId).Result;
            Assert.That(frontier, Has.Count.EqualTo(0));
        }

        [Test]
        public void WordIsUniqueNewVernInProjectTrue()
        {
            var oldWordSameProj = Util.RandomWord(ProjId);
            _ = _wordRepo.Create(oldWordSameProj).Result;
            var oldWordDiffProj = Util.RandomWord("different");
            _ = _wordRepo.Create(oldWordDiffProj).Result;
            var newWord = Util.RandomWord(ProjId);
            newWord.Vernacular = oldWordDiffProj.Vernacular;
            newWord.Senses = oldWordDiffProj.Senses.Select(s => s.Clone()).ToList();

            var isUnique = _wordService.WordIsUnique(newWord).Result;
            // The word should be unique: an identical word is in a diff project.
            Assert.That(isUnique, Is.True);

            // There should be no change to the frontier.
            var frontier = _wordRepo.GetFrontier(ProjId).Result;
            Assert.That(frontier, Has.Count.EqualTo(1));
            Assert.That(frontier.First(), Is.EqualTo(oldWordSameProj));
        }

        [Test]
        public void WordIsUniqueSameVernSubsetSenseFalse()
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
            _ = _wordRepo.Create(oldWord).Result;

            var isUnique = _wordService.WordIsUnique(newWord).Result;
            Assert.That(isUnique, Is.False);
        }

        [Test]
        public void WordIsUniqueFalseAddsDomain()
        {
            var oldWord = Util.RandomWord(ProjId);
            oldWord = _wordRepo.Create(oldWord).Result;
            var newWord = Util.RandomWord(ProjId);
            newWord.Vernacular = oldWord.Vernacular;

            // Make the new word have a cloned sense of the old word,
            // but with one new semantic domain added.
            var newSense = oldWord.Senses.First().Clone();
            var newSemDom = Util.RandomSemanticDomain();
            newSense.SemanticDomains.Add(newSemDom);
            newWord.Senses = new List<Sense> { newSense };

            var isUnique = _wordService.WordIsUnique(newWord).Result;
            Assert.That(isUnique, Is.False);

            // The newSemDom should be added to the old word's sense.
            var frontier = _wordRepo.GetFrontier(ProjId).Result;
            Assert.That(frontier, Has.Count.EqualTo(1));
            var frontierSense = frontier.First().Senses.Find(s => s.Guid == newSense.Guid);
            Assert.That(frontierSense, Is.Not.Null);
            var frontierSemDom = frontierSense!.SemanticDomains.Find(dom => dom.Id == newSemDom.Id);
            Assert.That(frontierSemDom, Is.Not.Null);
        }

        [Test]
        public void WordIsUniqueFalseAddsNote()
        {
            var oldWord = Util.RandomWord(ProjId);
            oldWord.Note.Text = "";
            oldWord = _wordRepo.Create(oldWord).Result;

            // Make the new word a duplicate of the old word, but with a note added.
            var newWord = Util.RandomWord(ProjId);
            newWord.Vernacular = oldWord.Vernacular;
            newWord.Senses = new List<Sense> { oldWord.Senses.First().Clone() };
            var newNote = new Note("lang", "text");
            newWord.Note = newNote.Clone();

            var isUnique = _wordService.WordIsUnique(newWord).Result;
            Assert.That(isUnique, Is.False);

            // The newNote should be added to the old word.
            var frontier = _wordRepo.GetFrontier(ProjId).Result;
            Assert.That(frontier, Has.Count.EqualTo(1));
            Assert.That(frontier.First().Note, Is.EqualTo(newNote));
        }

        [Test]
        public void WordIsUniqueSameVernNoDefNoGlossTrue()
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

            var isUnique = _wordService.WordIsUnique(newWord).Result;
            Assert.That(isUnique, Is.True);

            // Frontier unchanged.
            var frontier = _wordRepo.GetFrontier(ProjId).Result;
            Assert.That(frontier, Has.Count.EqualTo(1));
            Assert.That(frontier.First(), Is.EqualTo(oldWord));
        }

        [Test]
        public void WordIsUniqueSameVernNoDefNoGlossSameDomsFalse()
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
            _ = _wordRepo.Create(oldWord).Result;

            var isUnique = _wordService.WordIsUnique(newWord).Result;
            Assert.That(isUnique, Is.False);

            // Frontier content unchanged.
            var frontier = _wordRepo.GetFrontier(ProjId).Result;
            Assert.That(frontier, Has.Count.EqualTo(1));
            var frontierSense = frontier.First().Senses.Find(s => s.Guid == emptySense.Guid);
            Assert.That(frontierSense, Is.EqualTo(emptySense));
        }
    }
}
