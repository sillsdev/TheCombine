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

        private const int MaxInList = 5; // matches value in frontend function loadGoalData()
        private const int MaxLists = 12; // matches frontend value maxNumSteps(GoalType.MergeDup)
        private const int MaxScore = 3; // matches value in MergeServices method GetPotentialDuplicates 
        private const int NoMaxScore = 9999999;
        private const string ProjId = "DuplicateFinderTestProjId";

        /// <summary> A broad set of words for testing the various DuplicateFinder cases. </summary>
        private static List<Word> BroadTestFrontier() => [
            new()
            {
                Vernacular = "11111",
                Senses = [new()
                {
                    Glosses = [new(){ Def = "three", Language = "en" }],
                    SemanticDomains = [new(){ Id = "1", Name = "Universe, creation" }]
                }]
            },
            new()
            {
                Vernacular = "11111",
                Senses = [new()
                {
                    Glosses = [new(){ Def = "identical", Language = "en" }],
                    SemanticDomains = [new(){ Id = "1", Name = "Universe, creation" }]
                }]
            },
            new()
            {
                Vernacular = "11111",
                Senses = [new()
                {
                    Glosses = [new(){ Def = "vernacular", Language = "en" }],
                    SemanticDomains = [new(){ Id = "1", Name = "Universe, creation" }]
                }]
            },
            new()
            {
                Vernacular = "11111b",
                Senses = [new()
                {
                    Glosses = [new(){ Def = "(and one similar)", Language = "en" }],
                    SemanticDomains = [new(){ Id = "1", Name = "Universe, creation" }]
                }]
            },
            new()
            {
                Vernacular = "222222222",
                Senses = [new()
                {
                    Glosses = [new(){ Def = "very-similar-vernacular", Language = "en" }],
                    SemanticDomains = [new(){ Id = "2", Name = "Person" }]
                }]
            },
            new()
            {
                Vernacular = "222222222a",
                Senses = [new()
                {
                    Glosses = [new(){ Def = "only-one-char-different-in-long-string", Language = "en" }],
                    SemanticDomains = [new(){ Id = "2", Name = "Person" }]
                }]
            },
            new()
            {
                Vernacular = "33333",
                Senses = [new()
                {
                    Glosses = [new(){ Def = "not-CASE-or-lang-sensitive", Language = "en" }],
                    SemanticDomains = [new(){ Id = "3", Name = "Language and thought" }]
                }],
                Note = new(){Language = "en", Text = "Similar vern, with same gloss/definition"}
            },
            new()
            {
                Vernacular = "33333b",
                Senses = [new()
                {
                    Definitions=[new(){Text = "not-case-or-LANG-sensitive", Language = "en-GB" }],
                    SemanticDomains = [new(){ Id = "3", Name = "Language and thought" }]
                }],
                Note = new(){Language = "en", Text = "Similar vern, with same gloss/definition"}
            },
            new()
            {
                Vernacular = "44444",
                Senses = [new()
                {
                    Glosses = [new(){ Def = "similar-ish-vernacular-identical-glosses", Language = "en" }],
                    SemanticDomains = [new(){ Id = "4", Name = "Social behavior" }]
                }]
            },
            new()
            {
                Vernacular = "44444bb",
                Senses = [new()
                {
                    Glosses = [new(){ Def = "similar-ish-vernacular-identical-glosses", Language = "en" }],
                    SemanticDomains = [new(){ Id = "4", Name = "Social behavior" }]
                }]
            },
            new()
            {
                Vernacular = "55555",
                Senses = [new()
                {
                    Glosses = [new(){ Def = "same-vernacular", Language = "en" }],
                    GrammaticalInfo = new(){ CatGroup = GramCatGroup.Verb, GrammaticalCategory = "Intransitive verb"},
                    SemanticDomains = [new(){ Id = "5", Name = "Daily life" }]
                }]
            },
            new()
            {
                Vernacular = "55555",
                Senses = [new()
                {
                    Glosses = [new(){ Def = "different-part-of-speech", Language = "en" }],
                    GrammaticalInfo = new(){ CatGroup = GramCatGroup.Noun, GrammaticalCategory = "Proper noun"},
                    SemanticDomains = [new(){ Id = "5", Name = "Daily life" }]
                }]
            },
            new()
            {
                Vernacular = "66a",
                Senses = [new()
                {
                    Glosses = [new(){ Def = "one-char-different", Language = "en" }],
                    SemanticDomains = [new(){ Id = "6", Name = "Work and occupation" }]
                }]
            },
            new()
            {
                Vernacular = "66b",
                Senses = [new()
                {
                    Glosses = [new(){ Def = "in-a-three-char-vern", Language = "en" }],
                    SemanticDomains = [new(){ Id = "6", Name = "Work and occupation" }]
                }]
            },
        ];


        [SetUp]
        public void Setup()
        {
            _dupFinder = new DuplicateFinder(MaxInList, MaxLists, MaxScore);
            _frontier = new List<Word>();
            _isUnavailableSet = _ => Task.FromResult(false);
        }

        [Test]
        public void GetIdenticalVernWordsBroadTest()
        {
            var wordLists = _dupFinder.GetIdenticalVernWords(BroadTestFrontier(), _isUnavailableSet).Result;
            // There are two subsets with identical vernacular form (#1 and #5),
            // but the latter (#5) has entries with different GramCatGroup and should thus be skipped.
            Assert.That(wordLists, Has.Count.EqualTo(1));
            var wordList = wordLists.First();
            Assert.That(wordList, Has.Count.EqualTo(3));
            Assert.That(wordList.First().Senses.First().SemanticDomains.First().Id, Is.EqualTo("1"));
        }

        [Test]
        public void GetSimilarWordsBroadTest()
        {
            var wordLists = _dupFinder.GetSimilarWords(BroadTestFrontier(), _isUnavailableSet).Result;
            Assert.That(wordLists, Has.Count.EqualTo(6));
            var expectedCounts = new int[6] { 4, 2, 2, 2, 2, 2 };
            foreach (var (list, index) in wordLists.Select((l, i) => (l, i)))
            {
                Assert.That(list, Has.Count.EqualTo(expectedCounts[index]));
                var domainId = list.First().Senses.First().SemanticDomains.First().Id;
                // The 3rd and 4th subsets have the same similarity score and can show up in either order.
                if (index == 2 || index == 3)
                {
                    Assert.That(domainId, Is.EqualTo("3").Or.EqualTo("4"));
                }
                else
                {
                    Assert.That(domainId, Is.EqualTo($"{index + 1}"));
                }
            }
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
