using BackendFramework.Controllers;
using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;
using System;
using System.Collections.Generic;

namespace Tests
{
    public class WordControllerTests
    {
        IWordService service;
        WordController controller;
        [SetUp]
        public void Setup()
        {
            service = new WordServiceMock();
            controller = new WordController(service);
        }

        Word testWord()
        {
            Word word = new Word();
            // lets add some random data
            word.Vernacular = Convert.ToBase64String(Guid.NewGuid().ToByteArray()).Substring(0, 4); ;
            word.Gloss = Convert.ToBase64String(Guid.NewGuid().ToByteArray()).Substring(0, 4); ;
            return word;
        }

        [Test]
        public void TestGetAllWords()
        {
            service.Create(testWord());
            service.Create(testWord());
            service.Create(testWord());

            var action = controller.Get().Result;

            Assert.That(action, Is.InstanceOf<ObjectResult>());

            var result = action as ObjectResult;
            Assert.That(result.Value, Has.Count.EqualTo(3));
            service.GetAllWords().Result.ForEach(word => Assert.Contains(word, result.Value as List<Word>));
        }

        [Test]
        public void TestGetWord()
        {
            Word word = service.Create(testWord()).Result;

            service.Create(testWord());
            service.Create(testWord());

            var action = controller.Get(word.Id).Result;

            Assert.That(action, Is.InstanceOf<ObjectResult>());

            var foundWords = (action as ObjectResult).Value as List<Word>;
            Assert.AreEqual(1, foundWords.Count);
            Assert.AreEqual(word, foundWords[0]);
        }

        [Test]
        public void AddWord()
        {
            Word word = testWord();
            string id = (controller.Post(word).Result as ObjectResult).Value as string;
            word.Id = id;
            Assert.AreEqual(word, service.GetAllWords().Result[0]);
            Assert.AreEqual(word, service.GetFrontier().Result[0]);
        }

        [Test]
        public void UpdateWord()
        {
            Word origWord = service.Create(testWord()).Result;



            Word modWord = origWord.Copy();
            modWord.Vernacular = "Yoink";
            modWord.Gloss = "Hello";

            string id = (controller.Put(modWord.Id, modWord).Result as ObjectResult).Value as string;

            Word finalWord = modWord.Copy();
            finalWord.Id = id;
            finalWord.History = new List<string> { origWord.Id };

            Assert.Contains(origWord, service.GetAllWords().Result);
            Assert.Contains(finalWord, service.GetAllWords().Result);
            Assert.That(service.GetFrontier().Result, Has.Count.EqualTo(1));
            Assert.Contains(finalWord, service.GetFrontier().Result);
        }

        [Test]
        public void DeleteWord()
        {
            Word origWord = service.Create(testWord()).Result;
            var action = controller.Delete(origWord.Id).Result;
            Word delWord = origWord.Copy();
            delWord.Accessability = (int)state.deleted;
            delWord.Id = service.GetAllWords().Result.Find(word => word.Accessability == (int)state.deleted).Id;
            delWord.History = new List<string> { origWord.Id };
            Assert.Contains(origWord, service.GetAllWords().Result);
            Assert.Contains(delWord, service.GetAllWords().Result);
            Assert.That(service.GetFrontier().Result, Has.Count.EqualTo(1));
            Assert.Contains(delWord, service.GetFrontier().Result);
        }

        [Test]
        public void MergeWords()
        {
            Word parent = service.Create(testWord()).Result;
            Word child1 = service.Create(testWord()).Result;
            Word child2 = service.Create(testWord()).Result;

            MergeWords merge = new MergeWords();
            merge.parent = parent.Id;
            merge.children = new List<string> { child1.Id, child2.Id };
            merge.mergeType = state.duplicate;
            string id = (controller.Put(merge).Result as ObjectResult).Value as string;

            List<Word> words = service.GetAllWords().Result;

            // make sure we didn't remove anything
            Assert.Contains(parent, words);
            Assert.Contains(child1, words);
            Assert.Contains(child2, words);
            // find the dups
            Word dup1 = child1.Copy();
            dup1.Accessability = (int)state.duplicate;
            dup1.History = new List<string> { child1.Id };
            dup1 = words.Find(word => word.ContentEquals(dup1));

            Word dup2 = child2.Copy();
            dup2.Accessability = (int)state.duplicate;
            dup2.History = new List<string> { child2.Id };
            dup2 = words.Find(word => word.ContentEquals(dup2));

            Assert.NotNull(dup1);
            Assert.NotNull(dup2);
            Assert.Contains(dup1, words);
            Assert.Contains(dup2, words);

            // find the endpoint
            Word end = parent.Copy();
            end.History = new List<string> { parent.Id, dup1.Id, dup2.Id };
            end = words.Find(word => word.ContentEquals(end));

            Assert.NotNull(end);
            Assert.Contains(end, words);
            Assert.That(service.GetFrontier().Result, Has.Count.EqualTo(1));
            Assert.Contains(end, service.GetFrontier().Result);
            
        }
    }
}