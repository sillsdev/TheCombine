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
            Word origWord = repo.Create(RandomWord()).Result;

            var action = controller.Delete(origWord.Id).Result;

            Word delWord = origWord.Clone();
            delWord.Accessability = (int)state.deleted;
            delWord.Id = repo.GetAllWords().Result.Find(word => word.Accessability == (int)state.deleted).Id;
            delWord.History = new List<string> { origWord.Id };

            Assert.Contains(origWord, repo.GetAllWords().Result);
            Assert.Contains(delWord, repo.GetAllWords().Result);

            Assert.That(repo.GetFrontier().Result, Has.Count.EqualTo(1));
            Assert.Contains(delWord, repo.GetFrontier().Result);
        }

        [Test]
        public void MergeWords()
        {
            Word parent = repo.Create(RandomWord()).Result;
            Word child1 = repo.Create(RandomWord()).Result;
            Word child2 = repo.Create(RandomWord()).Result;

            MergeWords merge = new MergeWords();
            merge.Parent = parent.Id;
            merge.Children = new List<string> { child1.Id, child2.Id };
            merge.MergeType = state.duplicate;
            string id = (controller.Put(merge).Result as ObjectResult).Value as string;

            List<Word> words = repo.GetAllWords().Result;

            // make sure we didn't remove anything
            Assert.Contains(parent, words);
            Assert.Contains(child1, words);
            Assert.Contains(child2, words);

            // find the dups
            Word dup1 = child1.Clone();
            dup1.Accessability = (int)state.duplicate;
            dup1.History = new List<string> { child1.Id };
            dup1 = words.Find(word => word.ContentEquals(dup1));

            Word dup2 = child2.Clone();
            dup2.Accessability = (int)state.duplicate;
            dup2.History = new List<string> { child2.Id };
            dup2 = words.Find(word => word.ContentEquals(dup2));

            Assert.NotNull(dup1);
            Assert.NotNull(dup2);
            Assert.Contains(dup1, words);
            Assert.Contains(dup2, words);

            // find the endpoint
            Word end = parent.Clone();
            end.History = new List<string> { parent.Id, dup1.Id, dup2.Id };
            end = words.Find(word => word.ContentEquals(end));

            Assert.NotNull(end);
            Assert.Contains(end, words);
            Assert.That(repo.GetFrontier().Result, Has.Count.EqualTo(1));
            Assert.Contains(end, repo.GetFrontier().Result);
        }
    }
}