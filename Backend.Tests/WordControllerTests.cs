using Backend.Tests;
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
        IWordRepository repo;
        WordController controller;
        IWordService service;

        [SetUp]
        public void Setup()
        {
            repo = new WordRepositoryMock();
            service = new WordService(repo);
            controller = new WordController(service, repo);
        }

        Word RandomWord()
        {
            Word word = new Word();
            Random num = new Random();
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
            word.Id = null;

            return word;
        }

        [Test]
        public void TestGetAllWords()
        {
            repo.Create(RandomWord());
            repo.Create(RandomWord());
            repo.Create(RandomWord());

            var words = (controller.Get().Result as ObjectResult).Value as List<Word>;
            Assert.That(words, Has.Count.EqualTo(3));
            repo.GetAllWords().Result.ForEach(word => Assert.Contains(word, words));
        }

        [Test]
        public void TestGetWord()
        {
            Word word = repo.Create(RandomWord()).Result;

            repo.Create(RandomWord());
            repo.Create(RandomWord());

            var action = controller.Get(word.Id).Result;

            Assert.That(action, Is.InstanceOf<ObjectResult>());

            var foundWord = (action as ObjectResult).Value as Word;
            Assert.AreEqual(word, foundWord);
        }

        [Test]
        public void AddWord()
        {
            Word word = RandomWord();

            string id = (controller.Post(word).Result as ObjectResult).Value as string;
            word.Id = id;

            Assert.AreEqual(word, repo.GetAllWords().Result[0]);
            Assert.AreEqual(word, repo.GetFrontier().Result[0]);
        }

        [Test]
        public void UpdateWord()
        {
            Word origWord = repo.Create(RandomWord()).Result;

            Word modWord = origWord.Clone();
            modWord.Vernacular = "Yoink";

            string id = (controller.Put(modWord.Id, modWord).Result as ObjectResult).Value as string;

            Word finalWord = modWord.Clone();
            finalWord.Id = id;
            finalWord.History = new List<string> { origWord.Id };

            Assert.Contains(origWord, repo.GetAllWords().Result);
            Assert.Contains(finalWord, repo.GetAllWords().Result);

            Assert.That(repo.GetFrontier().Result, Has.Count.EqualTo(1));
            Assert.Contains(finalWord, repo.GetFrontier().Result);
        }

        [Test]
        public void DeleteWord()
        {
            //fill test database
            Word origWord = repo.Create(RandomWord()).Result;

            //test delete function
            var action = controller.Delete(origWord.Id).Result;

            //original word persists
            Assert.Contains(origWord, repo.GetAllWords().Result);

            //get the new deleted word from the database
            var wordRepo = repo.GetAllWords().Result;
            wordRepo.Remove(origWord);

            //ensure the word is valid
            Assert.IsTrue(wordRepo.Count == 1);
            Assert.IsTrue(wordRepo[0].Id != origWord.Id);
            Assert.IsTrue(wordRepo[0].History.Count == 1);

            //test the fronteir
            Assert.That(repo.GetFrontier().Result, Has.Count.EqualTo(1));

            //ensure the deleted word is in the fronteir
            Assert.IsTrue(wordRepo.Count == 1);
            Assert.IsTrue(wordRepo[0].Id != origWord.Id);
            Assert.IsTrue(wordRepo[0].History.Count == 1);
        }

        private state RandState()
        {
            Random num = new Random();
            int numberOfStates = 4;
            return (state)(num.Next() % numberOfStates);
        }

        [Test]
        public void MergeWords()
        {
            MergeWords parentChildMergeObject = new MergeWords();
            parentChildMergeObject.ChildrenWords = new List<MergeSourceWord>();
            

            //the parent word is inherently correct
            parentChildMergeObject.Parent = RandomWord();
            List<Word> childWords = new List<Word> { RandomWord(), RandomWord(), RandomWord() };
            parentChildMergeObject.Time = Util.randString();

            //set the child info 
            int childCount = childWords.Count();
            foreach (Word child in childWords)
            {
                //generate state list of children
                List<state> childStatesLst = new List<state> { RandState(), RandState(), RandState() };

                //generate tuple with new child ID and desired child state list 
                MergeSourceWord newGenChild = new MergeSourceWord();
                newGenChild.SrcWordID = repo.Add(child).Result.Id;
                newGenChild.SenseStates = childStatesLst;
                parentChildMergeObject.ChildrenWords.Add(newGenChild);
            }

            var newParentId = service.Merge(parentChildMergeObject).Result;

            //2 * child number + 1, there are duplicate child nodes and one extra for the parent
            Assert.AreEqual(repo.GetAllWords().Result.Count, 2 * childCount + 1);
            //make sure the parent is in the db
            Assert.AreEqual(parentChildMergeObject.Parent, repo.GetWord(parentChildMergeObject.Parent.Id).Result);

            //assert the children are in the database
            var dbWords = repo.GetAllWords().Result;
            dbWords.RemoveAll(StartingChildren);

            // 4 = the number of elements in the database - the childCOunt
            Assert.AreEqual(4, dbWords.Count);
            
            for(int childIndex = 0; childIndex < childCount; ++childIndex)
            {
                //check for children in db
                Assert.Contains(repo.GetWord(parentChildMergeObject.ChildrenWords[childIndex].SrcWordID).Result, repo.GetAllWords().Result);
            }
        }

        private static bool StartingChildren(Word word)
        {
            //in this test the histories of the original child words are going to have no history
            return word.History.Count <= 0;
        }
    }
}
