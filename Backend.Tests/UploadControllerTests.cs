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

        string RandomWord(int length = 0)
        {
            if (length == 0)
            {
                return Convert.ToBase64String(Guid.NewGuid().ToByteArray());
            }
            return Convert.ToBase64String(Guid.NewGuid().ToByteArray()).Substring(0, length);
        }

        User RandomUser()
        {
            User user = new User();
            user.Username = RandomWord(4);
            user.Password = RandomWord(4);
            return user;
        }

        Word RandomWord()
        {
            Word word = new Word();
            word.Vernacular = RandomWord(4);
            return word;
        }

        public string RandomLiftFile()
        {
            string name = RandomWord(4) + ".lift";
            FileStream fs = File.OpenWrite(name);

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
                string dateCreated = "\"" + RandomWord(20) + "\"";
                string dateModified = "\"" + RandomWord(20) + "\"";
                string id = "\"" + RandomWord() + "\"";
                string guid = "\"" + RandomWord() + "\"";
                string vernLang = "\"" + RandomWord(3) + "\"";
                string vern = RandomWord(6);
                string plural = RandomWord(8);
                string senseId = "\"" + RandomWord() + "\"";
                string transLang1 = "\"" + RandomWord(3) + "\"";
                string transLang2 = "\"" + RandomWord(3) + "\"";
                string trans1 = RandomWord(6);
                string trans2 = RandomWord(8);
                string sdValue = "\"" + RandomWord(4) + " " + RandomWord(4) + "\"";

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
            return name;
        }

        [Test]
        public void TestLiftImport()
        {
            string name = RandomLiftFile();
            FileStream fstream = File.OpenRead(name);

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
            string filePath = "../../../Assets/combine.png";

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
            string filePath = "../../../Assets/sound.mp3";

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