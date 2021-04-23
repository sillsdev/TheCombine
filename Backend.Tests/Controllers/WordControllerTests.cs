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
    public class WordControllerTests
    {
        private IProjectRepository _projRepo = null!;
        private IWordRepository _wordRepo = null!;
        private IWordService _wordService = null!;
        private IPermissionService _permissionService = null!;
        private WordController _wordController = null!;

        private string _projId = null!;

        [SetUp]
        public void Setup()
        {
            _projRepo = new ProjectRepositoryMock();
            _wordRepo = new WordRepositoryMock();
            _wordService = new WordService(_wordRepo);
            _permissionService = new PermissionServiceMock();
            _wordController = new WordController(_wordRepo, _wordService, _projRepo, _permissionService);

            _projId = _projRepo.Create(new Project { Name = "WordControllerTests" }).Result!.Id;
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
        public void TestGetAllWords()
        {
            _wordRepo.Create(RandomWord());
            _wordRepo.Create(RandomWord());
            _wordRepo.Create(RandomWord());

            var words = ((ObjectResult)_wordController.Get(_projId).Result).Value as List<Word>;
            Assert.That(words, Has.Count.EqualTo(3));
            _wordRepo.GetAllWords(_projId).Result.ForEach(word => Assert.Contains(word, words));
        }

        [Test]
        public void TestGetWord()
        {
            var word = _wordRepo.Create(RandomWord()).Result;

            _wordRepo.Create(RandomWord());
            _wordRepo.Create(RandomWord());

            var action = _wordController.Get(_projId, word.Id).Result;
            Assert.IsInstanceOf<ObjectResult>(action);

            var foundWord = ((ObjectResult)action).Value as Word;
            Assert.AreEqual(word, foundWord);
        }

        [Test]
        public void AddWord()
        {
            var word = RandomWord();

            var id = (string)((ObjectResult)_wordController.Post(_projId, word).Result).Value;
            word.Id = id;

            Assert.AreEqual(word, _wordRepo.GetAllWords(_projId).Result[0]);
            Assert.AreEqual(word, _wordRepo.GetFrontier(_projId).Result[0]);

            var oldDuplicate = RandomWord();
            var newDuplicate = oldDuplicate.Clone();

            _ = _wordController.Post(_projId, oldDuplicate).Result;
            var result = ((ObjectResult)_wordController.Post(_projId, newDuplicate).Result).Value as string;
            Assert.AreEqual(result, "Duplicate");

            newDuplicate.Senses.RemoveAt(2);
            result = ((ObjectResult)_wordController.Post(_projId, newDuplicate).Result).Value as string;
            Assert.AreEqual(result, "Duplicate");

            newDuplicate.Senses = new List<Sense>();
            result = ((ObjectResult)_wordController.Post(_projId, newDuplicate).Result).Value as string;
            Assert.AreNotEqual(result, "Duplicate");
        }

        [Test]
        public void UpdateWord()
        {
            var origWord = _wordRepo.Create(RandomWord()).Result;

            var modWord = origWord.Clone();
            modWord.Vernacular = "NewVernacular";

            var id = (string)((ObjectResult)_wordController.Put(_projId, modWord.Id, modWord).Result).Value;

            var finalWord = modWord.Clone();
            finalWord.Id = id;
            finalWord.History = new List<string> { origWord.Id };

            Assert.Contains(origWord, _wordRepo.GetAllWords(_projId).Result);
            Assert.Contains(finalWord, _wordRepo.GetAllWords(_projId).Result);

            Assert.That(_wordRepo.GetFrontier(_projId).Result, Has.Count.EqualTo(1));
            Assert.Contains(finalWord, _wordRepo.GetFrontier(_projId).Result);
        }

        [Test]
        public void DeleteWord()
        {
            // Fill test database
            var origWord = _wordRepo.Create(RandomWord()).Result;

            // Test delete function
            _ = _wordController.Delete(_projId, origWord.Id).Result;

            // Original word persists
            Assert.Contains(origWord, _wordRepo.GetAllWords(_projId).Result);

            // Get the new deleted word from the database
            var frontier = _wordRepo.GetFrontier(_projId).Result;

            // Ensure the word is valid
            Assert.IsTrue(frontier.Count == 1);
            Assert.IsTrue(frontier[0].Id != origWord.Id);
            Assert.IsTrue(frontier[0].History.Count == 1);

            // Test the frontier
            Assert.That(_wordRepo.GetFrontier(_projId).Result, Has.Count.EqualTo(1));

            // Ensure the deleted word is in the frontier
            Assert.IsTrue(frontier.Count == 1);
            Assert.IsTrue(frontier[0].Id != origWord.Id);
            Assert.IsTrue(frontier[0].History.Count == 1);
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

            var newWords = _wordService.Merge(_projId, new List<MergeWords> { mergeObject }).Result;

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
            Assert.AreEqual(_wordRepo.GetFrontier(_projId).Result.Count, numberOfChildren);

            var mergeWordsList = new List<MergeWords> { mergeWords };
            var newWords = _wordService.Merge(_projId, mergeWordsList).Result;

            // Check for correct history length;
            var dbParent = newWords.First();
            Assert.AreEqual(dbParent.History.Count, numberOfChildren);

            // Confirm that parent added to repo and children not in frontier.
            Assert.IsNotNull(_wordRepo.GetWord(_projId, dbParent.Id).Result);
            Assert.AreEqual(_wordRepo.GetFrontier(_projId).Result.Count, 1);
        }

        [Test]
        public void MergeWordsMultiple()
        {
            var mergeWordsA = new MergeWords { Parent = RandomWord() };
            var mergeWordsB = new MergeWords { Parent = RandomWord() };
            var mergeWordsList = new List<MergeWords> { mergeWordsA, mergeWordsB };
            var newWords = _wordService.Merge(_projId, mergeWordsList).Result;

            Assert.That(newWords, Has.Count.EqualTo(2));
            Assert.AreNotEqual(newWords.First().Id, newWords.Last().Id);

            var frontier = _wordRepo.GetFrontier(_projId).Result;
            Assert.That(frontier, Has.Count.EqualTo(2));
            Assert.AreNotEqual(frontier.First().Id, frontier.Last().Id);
            Assert.Contains(frontier.First(), newWords);
            Assert.Contains(frontier.Last(), newWords);
        }

        [Test]
        public void TestGetMissingWord()
        {
            var action = _wordController.Get(_projId, "INVALID_WORD_ID").Result;
            Assert.IsInstanceOf<NotFoundObjectResult>(action);
        }
    }
}
