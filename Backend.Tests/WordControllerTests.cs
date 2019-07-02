using Backend.Tests;
using BackendFramework.Controllers;
using BackendFramework.Interfaces;
using BackendFramework.Services;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;
using System;
using System.Collections.Generic;

namespace Backend.Tests
{
    public class WordControllerTests
    {
        IWordRepository repo;
        WordController controller;

        [SetUp]
        public void Setup()
        {
            repo = new WordRepositoryMock();
            IWordService service = new WordService(repo);
            controller = new WordController(service, repo);
        }

        Word RandomWord()
        {
            Word word = new Word();
            word.Vernacular = Util.randString();
            word.Modified = Util.randString();
            word.PartOfSpeech = Util.randString();
            word.Plural = Util.randString();

            Random num = new Random();
            foreach (var sense in word.Senses)
            {
                sense.Accessability = num.Next() % 4;

                foreach (Gloss gloss in sense.Glosses) {
                    gloss.Def = Util.randString();
                    gloss.Language = Util.randString(3);
                }
            }

            word.Created = Util.randString();
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

        [Test]
        public void MergeWords()
        {
            Word CorrectParentWord = RandomWord();
            
        }
    }
}