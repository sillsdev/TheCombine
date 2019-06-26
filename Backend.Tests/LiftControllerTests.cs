using Backend.Tests;
using BackendFramework.Controllers;
using BackendFramework.Interfaces;
using BackendFramework.Services;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Http.Internal;
using NUnit.Framework;
using SIL.Lift.Parsing;
using System;
using System.IO;
using System.Text;

namespace Tests
{
    public class LiftControllerTests
    {
        IWordRepository _wordrepo;
        private IWordService _wordService;
        ILexiconMerger<LiftObject, LiftEntry, LiftSense, LiftExample> _merger;
        private LiftController liftController;
        private IProjectService _projServ;

        [SetUp]
        public void Setup()
        {
            _projServ = new ProjectServiceMock();
            _wordrepo = new WordRepositoryMock();
            _wordService = new WordService(_wordrepo);
            _merger = new LiftService(_wordrepo, _projServ);
            liftController = new LiftController(_merger, _wordrepo, _wordService, _projServ);
        }

        User RandomUser()
        {
            User user = new User();
            user.Username = Util.randString();
            user.Password = Util.randString();
            return user;
        }

        Word RandomWord()
        {
            Word word = new Word();
            word.Vernacular = Util.randString();
            return word;
        }

        Project RandomProject()
        {
            Project project = new Project();
            project.Name = Convert.ToBase64String(Guid.NewGuid().ToByteArray()).Substring(0, 4);
            return project;
        }

        public string RandomLiftFile()
        {
            string name = Util.randString() + ".lift";
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
                string dateCreated = $"\"{Util.randString(20)}\"";
                string dateModified = $"\"{Util.randString(20)}\"";
                string id = $"\"{Util.randString()}\"";
                string guid = $"\"{Util.randString()}\"";
                string vernLang = $"\"{Util.randString(3)}\"";
                string vern = Util.randString(6);
                string plural = Util.randString(8);
                string senseId = $"\"{Util.randString()}\"";
                string transLang1 = $"\"{Util.randString(3)}\"";
                string transLang2 = $"\"{Util.randString(3)}\"";
                string trans1 = Util.randString(6);
                string trans2 = Util.randString(8);
                string sdValue = $"\"{Util.randString(4)} {Util.randString(4)}\"";

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

        public FileUpload initFile()
        {
            string name = RandomLiftFile();
            FileStream fstream = File.OpenRead(name);

            FormFile formFile = new FormFile(fstream, 0, fstream.Length, "dave", "sena");
            FileUpload fileUpload = new FileUpload();
            fileUpload.Name = "FileName";
            fileUpload.File = formFile;

            return fileUpload;
        }

        [Test]
        public void TestLiftImport()
        {
            var fileUpload = initFile();
            _ = liftController.UploadLiftFile(fileUpload).Result;

            var allWords = _wordrepo.GetAllWords();
            Assert.NotZero(allWords.Result.Count);
        }

        [Test]
        public void TestLiftExport()
        {
            var fileUpload = initFile();
            var proj = RandomProject();
            proj.VernacularWritingSystem = "seh";
            _projServ.Create(proj);

            _ = liftController.UploadLiftFile(fileUpload).Result;

            var foundWord = _wordrepo.GetAllWords().Result[0];
            foundWord.Audio = "sound.mp3";

            _ = _wordService.Update(foundWord.Id, foundWord).Result;

            //export
            _ = liftController.ExportLiftFile(proj.Id).Result;
            
            //assert if the file is missing

            //assert if import fails
        }
    }
}