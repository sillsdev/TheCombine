using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Models;
using NUnit.Framework;

namespace Backend.Tests.Helper
{
    public class DuplicateFinderTests
    {
        //private List<List<string>> _blacklist = null!;
        private DuplicateFinder _dupFinder = null!;
        private List<Word> _frontier = null!;
        private Func<List<string>, Task<bool>> _isInBlacklist = null!;

        private const int MaxInList = 4;
        private const int MaxLists = 3;
        private const int MaxScore = 100;
        private const string ProjId = "DuplicateFinderTestProjId";

        [OneTimeSetUp]
        public void OneTimeSetup()
        {
            _dupFinder = new DuplicateFinder(MaxInList, MaxLists, MaxScore);
        }

        [SetUp]
        public void Setup()
        {
            _frontier = new List<Word>();
            _isInBlacklist = (_) => Task.FromResult(false);
        }

        [Test]
        public void MaxInListAndMaxListsTest()
        {
            for (int i = 0; i < MaxInList * MaxLists * 2; i++)
            {
                _frontier.Add(Util.RandomWord(ProjId));
            }
            var wordLists = _dupFinder.GetSimilarWords(_frontier, _isInBlacklist).Result;
            Assert.That(wordLists, Has.Count.EqualTo(MaxLists));
            Assert.That(wordLists.First(), Has.Count.EqualTo(MaxInList));
            Assert.That(wordLists.Last(), Has.Count.EqualTo(MaxInList));
        }

        [Test]
        public void GetIdenticalVernToWordTest()
        {
            const string vern = "Vertacular!";
            for (int i = 0; i < 10; i++)
            {
                _frontier.Add(Util.RandomWord());
            }
            _frontier.ElementAt(1).Vernacular = vern;
            _frontier.ElementAt(2).Vernacular = vern;
            _frontier.ElementAt(5).Vernacular = vern;
            var wordLists = _dupFinder.GetIdenticalVernWords(_frontier, _isInBlacklist).Result;
            Assert.That(wordLists, Has.Count.EqualTo(1));
            Assert.That(wordLists.First(), Has.Count.EqualTo(3));
        }

        [Test]
        public void HaveIdenticalGlossTest()
        {
            const string def = "YesGloss";
            const string lang = "YesLang";
            var glossYY = new Gloss { Def = def, Language = lang };
            var glossYN = new Gloss { Def = def, Language = "NoLang" };
            var glossNY = new Gloss { Def = "NoGloss", Language = lang };
            var senseEmpty = new Sense { Glosses = new List<Gloss> { new Gloss() } };
            var senseEmptyGYY = new Sense { Glosses = new List<Gloss> { new Gloss(), glossYY } };
            var senseGYNGNY = new Sense { Glosses = new List<Gloss> { glossYN, glossNY } };
            var senseEmptyGYYGNY = new Sense { Glosses = new List<Gloss> { new Gloss(), glossYY, glossNY } };
            var wordWithOnlyGYY = new Word
            {
                Senses = new List<Sense> { new Sense(), senseEmpty, senseEmptyGYY }
            };
            var wordAlsoWithGYY = new Word
            {
                Senses = new List<Sense> { new Sense(), senseGYNGNY, senseEmptyGYYGNY, senseEmpty }
            };
            var wordWithoutGYY = new Word
            {
                Senses = new List<Sense> { senseEmpty, senseGYNGNY, new Sense() }
            };
            Assert.IsFalse(_dupFinder.HaveIdenticalGloss(new Word(), new Word()));
            Assert.IsFalse(_dupFinder.HaveIdenticalGloss(new Word(), wordWithOnlyGYY));
            Assert.IsTrue(_dupFinder.HaveIdenticalGloss(wordWithOnlyGYY, wordAlsoWithGYY));
            Assert.IsFalse(_dupFinder.HaveIdenticalGloss(wordWithOnlyGYY, wordWithoutGYY));
        }
    }
}
