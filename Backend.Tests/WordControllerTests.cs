using BackendFramework.Controllers;
using BackendFramework.Interfaces;
using BackendFramework.Services;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Backend.Tests
{
    public class WordControllerTests
    {
        private IWordRepository _repo;
        private IWordService _wordService;
        private WordController _wordController;
        private IProjectService _projectService;
        private string _projId;

        [SetUp]
        public void Setup()
        {
            _repo = new WordRepositoryMock();
            _wordService = new WordService(_repo);
            _wordController = new WordController(_repo, _wordService);
            _projectService = new ProjectServiceMock();
            _projId = _projectService.Create(new Project()).Result.Id;
        }

        Word RandomWord()
        {
            Word word = new Word();
            word.Senses = new List<Sense>() { new Sense(), new Sense(), new Sense()};

            foreach (Sense sense in word.Senses)
            {

                sense.Accessibility = (int)state.active;
                sense.Glosses = new List<Gloss>() { new Gloss(), new Gloss() , new Gloss() };

                foreach (Gloss gloss in sense.Glosses) {
                    gloss.Def = Util.randString();
                    gloss.Language = Util.randString(3);
                }

                sense.SemanticDomains = new List<SemanticDomain>() { new SemanticDomain(), new SemanticDomain(), new SemanticDomain() };

                foreach(SemanticDomain semdom in sense.SemanticDomains)
                {
                    semdom.Name = Util.randString();
                    semdom.Number = Util.randString();
                }
            }

            word.Created = Util.randString();
            word.Vernacular = Util.randString();
            word.Modified = Util.randString();
            word.PartOfSpeech = Util.randString();
            word.Plural = Util.randString();
            word.History = new List<string>();
            word.ProjectId = _projId;

            return word;
        }

        [Test]
        public void TestGetAllWords()
        {
            _repo.Create(RandomWord());
            _repo.Create(RandomWord());
            _repo.Create(RandomWord());

            var words = (_wordController.Get(_projId).Result as ObjectResult).Value as List<Word>;
            Assert.That(words, Has.Count.EqualTo(3));
            _repo.GetAllWords(_projId).Result.ForEach(word => Assert.Contains(word, words));
        }

        [Test]
        public void TestGetWord()
        {
            Word word = _repo.Create(RandomWord()).Result;

            _repo.Create(RandomWord());
            _repo.Create(RandomWord());

            var action = _wordController.Get(_projId, word.Id).Result;

            Assert.That(action, Is.InstanceOf<ObjectResult>());

            var foundWord = (action as ObjectResult).Value as Word;
            Assert.AreEqual(word, foundWord);
        }

        [Test]
        public void AddWord()
        {
            Word word = RandomWord();

            string id = (_wordController.Post(_projId, word).Result as ObjectResult).Value as string;
            word.Id = id;

            Assert.AreEqual(word, _repo.GetAllWords(_projId).Result[0]);
            Assert.AreEqual(word, _repo.GetFrontier(_projId).Result[0]);

            Word oldDuplicate = RandomWord();
            Word newDuplicate = oldDuplicate.Clone();

            _ = _wordController.Post(_projId, oldDuplicate).Result;
            var result = (_wordController.Post(_projId, newDuplicate).Result as ObjectResult).Value as string;
            Assert.AreEqual(result, "Duplicate");

            newDuplicate.Senses.RemoveAt(2);
            result = (_wordController.Post(_projId, newDuplicate).Result as ObjectResult).Value as string;
            Assert.AreEqual(result, "Duplicate");

            newDuplicate.Senses = new List<Sense>();
            result = (_wordController.Post(_projId, newDuplicate).Result as ObjectResult).Value as string;
            Assert.AreNotEqual(result, "Duplicate");
        }

        [Test]
        public void UpdateWord()
        {
            Word origWord = _repo.Create(RandomWord()).Result;

            Word modWord = origWord.Clone();
            modWord.Vernacular = "Yoink";

            string id = (_wordController.Put(_projId, modWord.Id, modWord).Result as ObjectResult).Value as string;

            Word finalWord = modWord.Clone();
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
            //fill test database
            Word origWord = _repo.Create(RandomWord()).Result;

            //test delete function
            var action = _wordController.Delete(_projId, origWord.Id).Result;

            //original word persists
            Assert.Contains(origWord, _repo.GetAllWords(_projId).Result);

            //get the new deleted word from the database
            var wordRepo = _repo.GetFrontier(_projId).Result;
            

            //ensure the word is valid
            Assert.IsTrue(wordRepo.Count == 1);
            Assert.IsTrue(wordRepo[0].Id != origWord.Id);
            Assert.IsTrue(wordRepo[0].History.Count == 1);

            //test the fronteir
            Assert.That(_repo.GetFrontier(_projId).Result, Has.Count.EqualTo(1));

            //ensure the deleted word is in the fronteir
            Assert.IsTrue(wordRepo.Count == 1);
            Assert.IsTrue(wordRepo[0].Id != origWord.Id);
            Assert.IsTrue(wordRepo[0].History.Count == 1);
        }

        [Test]
        public void MergeWords()
        {
            //the parent word is inherently correct as it is calculated by the frontend as the desired result of the merge
            MergeWords parentChildMergeObject = new MergeWords();
            parentChildMergeObject.Parent = RandomWord();
            parentChildMergeObject.Time = Util.randString();
            parentChildMergeObject.ChildrenWords = new List<MergeSourceWord>();

            //set the child info
            List<Word> childWords = new List<Word> { RandomWord(), RandomWord(), RandomWord() };
            foreach (Word child in childWords)
            {
                //generate mergeSourceWord with new child ID and desired child state list 
                MergeSourceWord newGenChild = new MergeSourceWord();
                newGenChild.SrcWordID = _repo.Add(child).Result.Id;
                newGenChild.SenseStates = new List<state> { state.duplicate, state.sense, state.separate };
                parentChildMergeObject.ChildrenWords.Add(newGenChild);
            }

            var newWordList = _wordService.Merge(_projId, parentChildMergeObject).Result;

            //check for parent is in the db
            var dbParent = newWordList.FirstOrDefault();
            Assert.IsNotNull(dbParent);
            Assert.AreEqual(dbParent.Senses.Count, 3);
            Assert.AreEqual(dbParent.History.Count, 3);

            //check the separarte words were made
            Assert.AreEqual(newWordList.Count, 4);

            foreach (var word in newWordList)
            {
                Assert.Contains(_repo.GetWord(_projId, word.Id).Result, _repo.GetAllWords(_projId).Result);
            }
        }
    }
}
