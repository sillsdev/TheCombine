﻿using Backend.Tests;
using BackendFramework.Controllers;
using BackendFramework.Interfaces;
using BackendFramework.Services;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Http.Internal;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;
using System;
using System.IO;

namespace Backend.Tests
{
    public class AudioControllerTests
    {
        IWordRepository _wordrepo;
        WordService _wordService;
        WordController wordController;
        AudioController audioController;

        [SetUp]
        public void Setup()
        {
            _wordrepo = new WordRepositoryMock();
            _wordService = new WordService(_wordrepo);
            audioController = new AudioController(_wordrepo, _wordService);
            wordController = new WordController(_wordService, _wordrepo);
        }

        string RandomString(int length = 16)
        {
            return Convert.ToBase64String(Guid.NewGuid().ToByteArray()).Substring(0, length);
        }

        Word RandomWord()
        {
            Word word = new Word();
            word.Vernacular = RandomString(4);
            return word;
        }

        [Test]
        public void TestAudioImport()
        {
            //yell at mark if this makes it into the pull request
            string filePath = Path.Combine(Directory.GetParent(Directory.GetParent(Directory.GetParent(Environment.CurrentDirectory).ToString()).ToString()).ToString(), "Assets", "sound.mp3");

            FileStream fstream = File.OpenRead(filePath);

            FormFile formFile = new FormFile(fstream, 0, fstream.Length, "name", "sound.mp3");
            FileUpload fileUpload = new FileUpload();
            fileUpload.Name = "FileName";
            fileUpload.File = formFile;

            Word word = _wordrepo.Create(RandomWord()).Result;

            _ = audioController.UploadAudioFile(word.Id, fileUpload).Result;

            var action = wordController.Get(word.Id).Result;

            var foundWord = (action as ObjectResult).Value as Word;
            Assert.IsNotNull(foundWord.Audio);
        }
    }
}