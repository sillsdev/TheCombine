using Backend.Tests;
using BackendFramework.Controllers;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Services;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Http.Internal;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using NUnit.Framework;
using SIL.Lift.Parsing;
using System;
using System.IO;
using System.Text;

namespace Tests
{
    public class UploadControllerTests
    {
        IWordRepository _wordrepo;
        private WordService _wordService;
        ILexiconMerger<LiftObject, LiftEntry, LiftSense, LiftExample> _merger;
        IUserService _userService;
        UserController userController;
        WordController wordController;
        UploadContoller controller;

        [SetUp]
        public void Setup()
        {
            _wordrepo = new WordRepositoryMock();
            _wordService = new WordService(_wordrepo);
            _merger = new LiftService(_wordrepo);
            _userService = new UserServiceMock();

            userController = new UserController(_userService);
            wordController = new WordController(_wordService, _wordrepo);
            controller = new UploadContoller(_merger, _wordrepo, _wordService, _userService);

        }

        User RandomUser()
        {
            User user = new User();
            user.Username = Convert.ToBase64String(Guid.NewGuid().ToByteArray()).Substring(0, 4);
            user.Password = Convert.ToBase64String(Guid.NewGuid().ToByteArray()).Substring(0, 4);
            return user;
        }

        Word RandomWord()
        {
            Word word = new Word();
            word.Vernacular = Convert.ToBase64String(Guid.NewGuid().ToByteArray()).Substring(0, 4);
            return word;
        }

        public void RandomLiftFile()
        {
            File.Delete("testFile.lift");
            FileStream fs = File.OpenWrite("testFile.lift");

            string header = @"<?xml version=""1.0"" encoding=""UTF-8""?>
                <lift producer = ""SIL.FLEx 8.3.12.43172"" version = ""0.13"">
                <header>
                <ranges>
                <range id = ""semantic-domain-ddp4"" href = ""file://C:/Users/DelaneyS/TheCombine/testingdata/testingdata.lift-ranges""/>
                </ranges>
                <fields>
                <field tag = ""Plural"">
                <form lang = ""en""><text></text></form>
                <form lang = ""qaa-x-spec""><text> Class = LexEntry; Type = String; WsSelector = kwsVern </text></form>
                </field>
                </fields>
                </header>";
            byte[] headerArray = Encoding.ASCII.GetBytes(header);

            fs.Write(headerArray);

            for (int i = 0; i < 3; i++)
            {
                string dateCreated = "\"" + Convert.ToBase64String(Guid.NewGuid().ToByteArray()).Substring(0, 20) + "\"";
                string dateModified = "\"" + Convert.ToBase64String(Guid.NewGuid().ToByteArray()).Substring(0, 20) + "\"";
                string id = "\"" + Convert.ToBase64String(Guid.NewGuid().ToByteArray()) + "\"";
                string guid = "\"" + Convert.ToBase64String(Guid.NewGuid().ToByteArray()) + "\"";
                string vernLang = "\"" + Convert.ToBase64String(Guid.NewGuid().ToByteArray()).Substring(0, 3) + "\"";
                string vern = Convert.ToBase64String(Guid.NewGuid().ToByteArray()).Substring(0, 6);
                string plural = Convert.ToBase64String(Guid.NewGuid().ToByteArray()).Substring(0, 8);
                string senseId = "\"" + Convert.ToBase64String(Guid.NewGuid().ToByteArray()) + "\"";
                string transLang1 = "\"" + Convert.ToBase64String(Guid.NewGuid().ToByteArray()).Substring(0, 3) + "\"";
                string transLang2 = "\"" + Convert.ToBase64String(Guid.NewGuid().ToByteArray()).Substring(0, 3) + "\"";
                string trans1 = Convert.ToBase64String(Guid.NewGuid().ToByteArray()).Substring(0, 6);
                string trans2 = Convert.ToBase64String(Guid.NewGuid().ToByteArray()).Substring(0, 8);
                string sdValue = "\"" + Convert.ToBase64String(Guid.NewGuid().ToByteArray()).Substring(0, 4) + " " + Convert.ToBase64String(Guid.NewGuid().ToByteArray()).Substring(0, 4) + "\"";

                string entry = $@"<entry dateCreated = {dateCreated} dateModified = {dateModified} id = {id} guid = {guid}>
                    <lexical-unit>
                    <form lang = {vernLang}><text> {vern} </text></form>
                    </lexical-unit>
                    <field type = ""Plural"">
                    <form lang = {vernLang}><text> {plural} </text></form>
                    </field>
                    <sense id = {senseId}>
                    <gloss lang = {transLang1}><text> {trans1} </text></gloss>
                    <gloss lang = {transLang2}><text> {trans2} </text></gloss>
                    <trait name = ""semantic-domain-ddp4"" value = {sdValue}/> 
                    </sense> 
                    </entry>";
                byte[] entryArray = Encoding.ASCII.GetBytes(entry);
                fs.Write(entryArray);
            }

            byte[] close = Encoding.ASCII.GetBytes("</lift>");
            fs.Write(close);

            fs.Close();
        }

        [Test]
        public void TestLiftImport()
        {
            RandomLiftFile();
            FileStream fstream = File.OpenRead("testFile.lift");

            FormFile formFile = new FormFile(fstream, 0, fstream.Length, "dave", "sena");
            FileUpload fileUpload = new FileUpload();
            fileUpload.Name = "FileName";
            fileUpload.File = formFile;

            _ = controller.UploadLiftFile(fileUpload).Result;

            var allWords = _wordrepo.GetAllWords();
            Assert.NotZero(allWords.Result.Count);
        }

        [Test]
        public void TestAvatarImport()
        {
            string filePath = "..\\..\\..\\Assets\\combine.png";

            FileStream fstream = File.OpenRead(filePath);

            FormFile formFile = new FormFile(fstream, 0, fstream.Length, "dave", "sena");
            FileUpload fileUpload = new FileUpload();
            fileUpload.Name = "FileName";
            fileUpload.File = formFile;

            User user = _userService.Create(RandomUser()).Result;

            _ = controller.UploadAvatar(user.Id, fileUpload).Result;

            var action = userController.Get(user.Id).Result;

            var foundUser = (action as ObjectResult).Value as User;
            Assert.IsNotNull(foundUser.Avatar);
        }

        [Test]
        public void TestAudioImport()
        {
            string filePath = "..\\..\\..\\Assets\\sound.mp3";

            FileStream fstream = File.OpenRead(filePath);

            FormFile formFile = new FormFile(fstream, 0, fstream.Length, "dave", "sena");
            FileUpload fileUpload = new FileUpload();
            fileUpload.Name = "FileName";
            fileUpload.File = formFile;

            Word word = _wordrepo.Create(RandomWord()).Result;

            _ = controller.UploadAudioFile(word.Id, fileUpload).Result;

            var action = wordController.Get(word.Id).Result;

            var foundWord = (action as ObjectResult).Value as Word;
            Assert.IsNotNull(foundWord.Audio);
        }
    }
}