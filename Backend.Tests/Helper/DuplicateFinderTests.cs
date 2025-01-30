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
        private Func<List<string>, Task<bool>> _isUnavailableSet = null!;

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
            _isUnavailableSet = _ => Task.FromResult(false);
        }

        [Test]
        public void GetIdenticalVernToWordTest()
        {
            const string vern = "Vertacular!";
            _frontier = Util.RandomWordList(10);
            _frontier.ForEach(w =>
                w.Senses.ForEach(s => s.GrammaticalInfo.CatGroup = GramCatGroup.Unspecified)
            );
            _frontier.ElementAt(1).Vernacular = vern;
            _frontier.ElementAt(2).Vernacular = vern;
            _frontier.ElementAt(5).Vernacular = vern;
            var wordLists = _dupFinder.GetIdenticalVernWords(_frontier, _isUnavailableSet).Result;
            Assert.That(wordLists, Has.Count.EqualTo(1));
            Assert.That(wordLists.First(), Has.Count.EqualTo(3));
        }

        [Test]
        public void GetSimilarWordsAndMaxInListAndMaxListsTest()
        {
            _frontier = Util.RandomWordList(MaxInList * MaxLists, ProjId);
            _dupFinder = new DuplicateFinder(MaxInList, MaxLists, NoMaxScore);
            var wordLists = _dupFinder.GetSimilarWords(_frontier, _isUnavailableSet).Result;
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

            var wordLists = _dupFinder.GetSimilarWords(_frontier, _isUnavailableSet).Result;
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
        public void GetSimilarWordsBlacklistOrGraylistTest()
        {
            _frontier = Util.RandomWordList(MaxInList + 1, ProjId);
            // Make sure the first set only is black/gray-listed, so all but the first word end up in a lone list.
            _isUnavailableSet = wordList => Task.FromResult(wordList.First() == _frontier.First().Vernacular);
            _dupFinder = new DuplicateFinder(MaxInList, MaxLists, NoMaxScore);
            var wordLists = _dupFinder.GetSimilarWords(_frontier, _isUnavailableSet).Result;
            Assert.That(wordLists, Has.Count.EqualTo(1));
            Assert.That(wordLists.First(), Has.Count.EqualTo(MaxInList));
        }

        [Test]
        public void HaveSameDefinitionOrGloss()
        {
            // strings that match with .Trim().ToLowerInvariant()
            const string defiText = "YesPlease ";
            const string glossDef = " yesPLEASE";

            var senseEmpty = new Sense { Definitions = [new()], Glosses = [new(), new()] };
            var senseDY = new Sense { Definitions = [new(), new() { Text = "other" }, new() { Text = defiText }] };
            var senseGY = new Sense { Glosses = [new(), new() { Def = glossDef }] };

            var wordNo = new Word
            {
                Senses = [new(), new() { Definitions = [new() { Text = "different" }, new()] }, senseEmpty]
            };
            var wordDYes = new Word
            {
                Senses = [senseEmpty, new(), senseDY]
            };
            var wordGYes = new Word
            {
                Senses = [new(), senseGY]
            };

            Assert.That(DuplicateFinder.HaveSameDefinitionOrGloss(new Word(), new Word()), Is.False);
            Assert.That(DuplicateFinder.HaveSameDefinitionOrGloss(new Word(), wordNo), Is.False);
            Assert.That(DuplicateFinder.HaveSameDefinitionOrGloss(wordNo, wordDYes), Is.False);
            Assert.That(DuplicateFinder.HaveSameDefinitionOrGloss(wordGYes, new Word()), Is.False);

            Assert.That(DuplicateFinder.HaveSameDefinitionOrGloss(wordDYes, wordDYes), Is.True);
            Assert.That(DuplicateFinder.HaveSameDefinitionOrGloss(wordDYes, wordGYes), Is.True);
        }

        [Test]
        public void MightShareGramCatGroupsTest()
        {
            var nounSense = new Sense { GrammaticalInfo = new() { CatGroup = GramCatGroup.Noun } };
            var unspecifiedSense = new Sense { GrammaticalInfo = new() { CatGroup = GramCatGroup.Unspecified } };
            var verbSense = new Sense { GrammaticalInfo = new() { CatGroup = GramCatGroup.Verb } };

            var nnWord = new Word { Senses = [nounSense.Clone(), nounSense.Clone()] };
            var uuWord = new Word { Senses = [unspecifiedSense.Clone(), unspecifiedSense.Clone()] };
            var vnWord = new Word { Senses = [verbSense.Clone(), nounSense.Clone()] };
            var vuWord = new Word { Senses = [verbSense.Clone(), unspecifiedSense.Clone()] };

            Assert.That(DuplicateFinder.HaveCommonGramCatGroup(nnWord, vnWord), Is.True);
            Assert.That(DuplicateFinder.HaveCommonGramCatGroup(nnWord, vuWord), Is.False);

            // An unspecified CatGroup on all senses of either word is automatically true.
            Assert.That(DuplicateFinder.HaveCommonGramCatGroup(uuWord, nnWord), Is.True);
            Assert.That(DuplicateFinder.HaveCommonGramCatGroup(nnWord, uuWord), Is.True);
        }
    }
}
