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
        private DuplicateFinder _dupFinder = null!;
        private List<Word> _frontier = null!;
        private Func<List<string>, Task<bool>> _isInBlacklist = null!;

        private const int MaxInList = 4;
        private const int MaxLists = 3;
        private const int MaxScore = 5;
        private const int NoMaxScore = 9999999;
        private const string ProjId = "DuplicateFinderTestProjId";


        [SetUp]
        public void Setup()
        {
            _dupFinder = new DuplicateFinder(MaxInList, MaxLists, MaxScore);
            _frontier = new List<Word>();
            _isInBlacklist = _ => Task.FromResult(false);
        }

        [Test]
        public void GetIdenticalVernToWordTest()
        {
            const string vern = "Vertacular!";
            _frontier = Util.RandomWordList(10);
            _frontier.ElementAt(1).Vernacular = vern;
            _frontier.ElementAt(2).Vernacular = vern;
            _frontier.ElementAt(5).Vernacular = vern;
            var wordLists = _dupFinder.GetIdenticalVernWords(_frontier, _isInBlacklist).Result;
            Assert.That(wordLists, Has.Count.EqualTo(1));
            Assert.That(wordLists.First(), Has.Count.EqualTo(3));
        }

        [Test]
        public void GetSimilarWordsAndMaxInListAndMaxListsTest()
        {
            _frontier = Util.RandomWordList(MaxInList * MaxLists, ProjId);
            _dupFinder = new DuplicateFinder(MaxInList, MaxLists, NoMaxScore);
            var wordLists = _dupFinder.GetSimilarWords(_frontier, _isInBlacklist).Result;
            Assert.That(wordLists, Has.Count.EqualTo(MaxLists));
            Assert.That(wordLists.First(), Has.Count.EqualTo(MaxInList));
            Assert.That(wordLists.Last(), Has.Count.EqualTo(MaxInList));
        }

        [Test]
        public void GetSimilarWordsAndMaxScoreTest()
        {
            _frontier = Util.RandomWordList(MaxInList * MaxLists, ProjId);
            // Ensure at least one set of similar words, in case MaxScore is too low.
            _frontier.Last().Vernacular = _frontier.First().Vernacular;

            var wordLists = _dupFinder.GetSimilarWords(_frontier, _isInBlacklist).Result;
            var firstList = wordLists.First();
            var firstMin = _dupFinder.GetWordScore(firstList.First(), firstList.ElementAt(1));
            var firstMax = _dupFinder.GetWordScore(firstList.First(), firstList.Last());
            Assert.That(firstMin, Is.GreaterThanOrEqualTo(0));
            Assert.That(firstMin, Is.LessThanOrEqualTo(firstMax));
            Assert.That(firstMax, Is.LessThanOrEqualTo(MaxScore));

            var midList = wordLists.ElementAt(wordLists.Count / 2);
            var midMin = _dupFinder.GetWordScore(midList.First(), midList.ElementAt(1));
            var midMax = _dupFinder.GetWordScore(midList.First(), midList.Last());
            Assert.That(midMin, Is.GreaterThanOrEqualTo(firstMin));
            Assert.That(midMin, Is.LessThanOrEqualTo(midMax));
            Assert.That(midMax, Is.LessThanOrEqualTo(MaxScore));

            var lastList = wordLists.Last();
            var lastMin = _dupFinder.GetWordScore(lastList.First(), lastList.ElementAt(1));
            var lastMax = _dupFinder.GetWordScore(lastList.First(), lastList.Last());
            Assert.That(lastMin, Is.GreaterThanOrEqualTo(midMin));
            Assert.That(lastMin, Is.LessThanOrEqualTo(lastMax));
            Assert.That(lastMax, Is.LessThanOrEqualTo(MaxScore));
        }

        [Test]
        public void GetSimilarWordsBlacklistTest()
        {
            _frontier = Util.RandomWordList(MaxInList + 1, ProjId);
            // Make sure the first set only is blacklisted, so all but the first word end up in a lone list.
            _isInBlacklist = (wordList) => Task.FromResult(wordList.First() == _frontier.First().Vernacular);
            _dupFinder = new DuplicateFinder(MaxInList, MaxLists, NoMaxScore);
            var wordLists = _dupFinder.GetSimilarWords(_frontier, _isInBlacklist).Result;
            Assert.That(wordLists, Has.Count.EqualTo(1));
            Assert.That(wordLists.First(), Has.Count.EqualTo(MaxInList));
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
            var senseEmptyGNYGYY = new Sense { Glosses = new List<Gloss> { new Gloss(), glossNY, glossYY } };
            var senseGYNGNY = new Sense { Glosses = new List<Gloss> { glossYN, glossNY } };

            var wordWithOnlyGYY = new Word
            {
                Senses = new List<Sense> { new Sense(), senseEmpty, senseEmptyGYY }
            };
            var wordAlsoWithGYY = new Word
            {
                Senses = new List<Sense> { senseGYNGNY, new Sense(), senseEmptyGNYGYY, senseEmpty }
            };
            var wordWithoutGYY = new Word
            {
                Senses = new List<Sense> { senseEmpty, senseGYNGNY, new Sense() }
            };

            Assert.IsFalse(DuplicateFinder.HaveIdenticalGloss(new Word(), new Word()));
            Assert.IsFalse(DuplicateFinder.HaveIdenticalGloss(new Word(), wordWithOnlyGYY));
            Assert.IsFalse(DuplicateFinder.HaveIdenticalGloss(wordWithoutGYY, new Word()));
            Assert.IsFalse(DuplicateFinder.HaveIdenticalGloss(wordWithOnlyGYY, wordWithoutGYY));

            Assert.IsTrue(DuplicateFinder.HaveIdenticalGloss(wordWithOnlyGYY, wordAlsoWithGYY));
            Assert.IsTrue(DuplicateFinder.HaveIdenticalGloss(wordAlsoWithGYY, wordWithOnlyGYY));
        }
    }
}
