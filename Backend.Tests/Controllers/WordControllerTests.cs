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
        private IWordRepository _repo = null!;
        private IWordService _wordService = null!;
        private WordController _wordController = null!;
        private IProjectService _projectService = null!;
        private string _projId = null!;
        private IPermissionService _permissionService = null!;

        [SetUp]
        public void Setup()
        {
            _permissionService = new PermissionServiceMock();
            _repo = new WordRepositoryMock();
            _wordService = new WordService(_repo);
            _projectService = new ProjectServiceMock();
            _projectService = new ProjectServiceMock();
            _wordController = new WordController(_repo, _wordService, _projectService, _permissionService);
            _projId = _projectService.Create(new Project()).Result.Id;
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

                foreach (var semdom in sense.SemanticDomains)
                {
                    semdom.Name = Util.RandString();
                    semdom.Id = Util.RandString();
                    semdom.Description = Util.RandString();
                }
            }

            return word;
        }

        [Test]
        public void TestGetAllWords()
        {
            _repo.Create(RandomWord());
            _repo.Create(RandomWord());
            _repo.Create(RandomWord());

            var words = ((ObjectResult)_wordController.Get(_projId).Result).Value as List<Word>;
            Assert.That(words, Has.Count.EqualTo(3));
            _repo.GetAllWords(_projId).Result.ForEach(word => Assert.Contains(word, words));
        }

        [Test]
        public void TestGetWord()
        {
            var word = _repo.Create(RandomWord()).Result;

            _repo.Create(RandomWord());
            _repo.Create(RandomWord());

            var action = _wordController.Get(_projId, word.Id).Result;

            Assert.That(action, Is.InstanceOf<ObjectResult>());

            var foundWord = ((ObjectResult)action).Value as Word;
            Assert.AreEqual(word, foundWord);
        }

        [Test]
        public void AddWord()
        {
            var word = RandomWord();

            var id = (string)((ObjectResult)_wordController.Post(_projId, word).Result).Value;
            word.Id = id;

            Assert.AreEqual(word, _repo.GetAllWords(_projId).Result[0]);
            Assert.AreEqual(word, _repo.GetFrontier(_projId).Result[0]);

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
            var origWord = _repo.Create(RandomWord()).Result;

            var modWord = origWord.Clone();
            modWord.Vernacular = "Yoink";

            var id = (string)((ObjectResult)_wordController.Put(_projId, modWord.Id, modWord).Result).Value;

            var finalWord = modWord.Clone();
            finalWord.Id = id;
            finalWord.History = new List<string> { origWord.Id };

            Assert.Contains(origWord, _repo.GetAllWords(_projId).Result);
            Assert.Contains(finalWord, _repo.GetAllWords(_projId).Result);

            Assert.That(_repo.GetFrontier(_projId).Result, Has.Count.EqualTo(1));
            Assert.Contains(finalWord, _repo.GetFrontier(_projId).Result);
        }

        [Test]
        public void DeleteWord()
        {
            // Fill test database
            var origWord = _repo.Create(RandomWord()).Result;

            // Test delete function
            var action = _wordController.Delete(_projId, origWord.Id).Result;

            // Original word persists
            Assert.Contains(origWord, _repo.GetAllWords(_projId).Result);

            // Get the new deleted word from the database
            var frontier = _repo.GetFrontier(_projId).Result;

            // Ensure the word is valid
            Assert.IsTrue(frontier.Count == 1);
            Assert.IsTrue(frontier[0].Id != origWord.Id);
            Assert.IsTrue(frontier[0].History.Count == 1);

            // Test the frontier
            Assert.That(_repo.GetFrontier(_projId).Result, Has.Count.EqualTo(1));

            // Ensure the deleted word is in the frontier
            Assert.IsTrue(frontier.Count == 1);
            Assert.IsTrue(frontier[0].Id != origWord.Id);
            Assert.IsTrue(frontier[0].History.Count == 1);
        }

        [Test]
        public void MergeWordsIdentity()
        {
            var thisWord = RandomWord();
            thisWord = _repo.Create(thisWord).Result;

            var mergeObject = new MergeWords
            {
                Parent = thisWord,
                ChildrenWords = new List<MergeSourceWord>
                {
                    new MergeSourceWord
                    {
                        SrcWordId = thisWord.Id,
                        SenseStates = new List<State> {State.Sense, State.Sense, State.Sense}
                    }
                }
            };

            var newWords = _wordService.Merge(_projId, mergeObject).Result;

            // There should only be 1 word added and it should be identical to what we passed in
            Assert.That(newWords, Has.Count.EqualTo(1));
            Assert.IsTrue(newWords.First().ContentEquals(thisWord));

            // Check that the only word in the frontier is the new word
            var frontier = _repo.GetFrontier(_projId).Result;
            Assert.That(frontier, Has.Count.EqualTo(1));
            Assert.AreEqual(frontier.First(), newWords.First());

            // Check that new word has the right history
            Assert.That(newWords.First().History, Has.Count.EqualTo(1));
            var intermediateWord = _repo.GetWord(_projId, newWords.First().History.First()).Result;
            Assert.That(intermediateWord.History, Has.Count.EqualTo(1));
            Assert.AreEqual(intermediateWord.History.First(), thisWord.Id);
        }

        [Test]
        public void MergeWords()
        {
            // The parent word is inherently correct as it is calculated by the frontend as the desired result of the
            // merge
            var parentChildMergeObject = new MergeWords
            {
                Parent = RandomWord(),
                Time = Util.RandString(),
                ChildrenWords = new List<MergeSourceWord>()
            };

            // Set the child info
            var childWords = new List<Word> { RandomWord(), RandomWord(), RandomWord() };
            foreach (var child in childWords)
            {
                // Generate mergeSourceWord with new child Id and desired child state list
                var newGenChild = new MergeSourceWord
                {
                    SrcWordId = _repo.Add(child).Result.Id,
                    SenseStates = new List<State> { State.Duplicate, State.Sense, State.Separate }
                };
                parentChildMergeObject.ChildrenWords.Add(newGenChild);
            }

            var newWordList = _wordService.Merge(_projId, parentChildMergeObject).Result;

            // Check for parent is in the db
            var dbParent = newWordList.FirstOrDefault();
            Assert.IsNotNull(dbParent);
            Assert.AreEqual(dbParent.Senses.Count, 3);
            Assert.AreEqual(dbParent.History.Count, 3);

            // Check the separarte words were made
            Assert.AreEqual(newWordList.Count, 4);

            foreach (var word in newWordList)
            {
                Assert.Contains(_repo.GetWord(_projId, word.Id).Result, _repo.GetAllWords(_projId).Result);
            }
        }
    }
}
