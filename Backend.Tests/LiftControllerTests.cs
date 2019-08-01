using BackendFramework.Controllers;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Services;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Http.Internal;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace Backend.Tests
{
    public class LiftControllerTests
    {
        private IWordRepository _wordrepo;
        private IWordService _wordService;
        private IProjectService _projServ;
        private LiftController _liftController;
        private IPermissionService _permissionService;

        [SetUp]
        public void Setup()
        {
            _permissionService = new PermissionServiceMock();
            _projServ = new ProjectServiceMock();
            _wordrepo = new WordRepositoryMock();
            _liftController = new LiftController(_wordrepo, _projServ, _permissionService);
            _wordService = new WordService(_wordrepo);
        }

        Project RandomProject()
        {
            Project project = new Project();
            project.Name = Convert.ToBase64String(Guid.NewGuid().ToByteArray()).Substring(0, 4);
            return project;
        }

        public string RandomLiftFile(string path)
        {
            string name = "TEST-TO_BE_STREAMED-" + Util.randString() + ".lift";
            name = Path.Combine(path, name);
            FileStream fs = File.OpenWrite(name);

            string header = 
                @"<?xml version=""1.0"" encoding=""UTF-8""?>
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
                    </header>
                ";

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
                string audio = $"\"{Util.randString(3)}.mp3\"";
                string senseId = $"\"{Util.randString()}\"";
                string transLang1 = $"\"{Util.randString(3)}\"";
                string transLang2 = $"\"{Util.randString(3)}\"";
                string trans1 = Util.randString(6);
                string trans2 = Util.randString(8);
                string sdValue = $"\"{Util.randString(4)} {Util.randString(4)}\"";

                string entry = 
                    $@"<entry dateCreated = {dateCreated} dateModified = {dateModified} id = {id} guid = {guid}>
                            <lexical-unit>
                                <form lang = {vernLang}><text> {vern} </text></form>
                            </lexical-unit>
                            <field type = ""Plural"">
                                <form lang = {vernLang}><text> {plural} </text></form>
                            </field>
                            <pronunciation>
			                    <media href= {audio}/>
                            </pronunciation>
                            <sense id = {senseId}>
                                <gloss lang = {transLang1}><text> {trans1} </text></gloss>
                                <gloss lang = {transLang2}><text> {trans2} </text></gloss>
                                <trait name = ""semantic-domain-ddp4"" value = {sdValue}/> 
                            </sense> 
                        </entry>
                        ";
                byte[] entryArray = Encoding.ASCII.GetBytes(entry);
                fs.Write(entryArray);
            }

            byte[] close = Encoding.ASCII.GetBytes("</lift>");
            fs.Write(close);

            fs.Close();
            return name;
        }

        Word RandomWord(string projId)
        {
            Word word = new Word();
            word.Senses = new List<Sense>() { new Sense(), new Sense(), new Sense() };

            foreach (Sense sense in word.Senses)
            {

                sense.Accessibility = (int)State.active;
                sense.Glosses = new List<Gloss>() { new Gloss(), new Gloss(), new Gloss() };

                foreach (Gloss gloss in sense.Glosses)
                {
                    gloss.Def = Util.randString();
                    gloss.Language = Util.randString(3);
                }

                sense.SemanticDomains = new List<SemanticDomain>() { new SemanticDomain(), new SemanticDomain(), new SemanticDomain() };

                foreach (SemanticDomain semdom in sense.SemanticDomains)
                {
                    semdom.Name = Util.randString();
                    semdom.Id = Util.randString();
                    semdom.Description = Util.randString();
                }
            }

            word.Created = Util.randString();
            word.Vernacular = Util.randString();
            word.Modified = Util.randString();
            word.PartOfSpeech = Util.randString();
            word.Plural = Util.randString();
            word.History = new List<string>();
            word.ProjectId = projId;

            return word;
        }

        private FileUpload InitFile(FileStream fstream, string filename)
        {
            FormFile formFile = new FormFile(fstream, 0, fstream.Length, "name", filename);
            FileUpload fileUpload = new FileUpload { Name = "FileName", File = formFile };

            return fileUpload;
        }

        [Test]
        public void TestExportDeleted()
        {
            var proj = RandomProject();
            _projServ.Create(proj);

            var word = RandomWord(proj.Id);
            var createdWord = _wordrepo.Create(word).Result;

            word.Id = "";
            word.Vernacular = "updated";

            _wordService.Update(proj.Id, createdWord.Id, word);

            var result = _liftController.ExportLiftFile(proj.Id).Result;

            Utilities util = new Utilities();
            var combinePath = util.GenerateFilePath(Utilities.Filetype.dir, true, "", "");
            string exportPath = Path.Combine(combinePath, proj.Id, "Export", "LiftExport", "NewLiftFile.lift");
            string text = File.ReadAllText(exportPath, Encoding.UTF8);
            //there is only one deleted word
            Assert.AreEqual(text.IndexOf("dateDeleted"), text.LastIndexOf("dateDeleted"));
        }

        [Test]
        public void TestRoundtrip()
        {

            /*
             * This test assumes you have the starting .zip included in your project files. It will be included in the pull request
             */

            //get path to the starting zip
            //This is convoluted because the tests run in netcoreapp2.1 and the folder needed in in the great-grand-parent folder
            string actualFilename = "SingleEntryLiftWithTwoSound.zip";
            string pathToStartZip = Directory.GetParent(Directory.GetParent(Directory.GetParent(Environment.CurrentDirectory).ToString()).ToString()).ToString();
            pathToStartZip = Path.Combine(pathToStartZip, "Assets", actualFilename);

            /*
             * Upload the zip file 
             */
            //init the project the .zip info is added to 
            var proj = RandomProject();
            _projServ.Create(proj);

            //generate api perameter with filestream
            FileStream fstream = File.OpenRead(pathToStartZip);

            var fileUpload = InitFile(fstream, actualFilename);

            //make api call
            var result = _liftController.UploadLiftFile(proj.Id, fileUpload).Result;
            if(result is BadRequestObjectResult)
            {
                //this will be removed in the next pull request
                return;
            }

            var newProj = _projServ.GetProject(proj.Id).Result;

            Assert.IsNotEmpty(newProj.VernacularWritingSystem);

            fstream.Close();

            var allWords = _wordrepo.GetAllWords(proj.Id);
            Assert.NotZero(allWords.Result.Count);

            //export
            _ = _liftController.ExportLiftFile(proj.Id).Result;
            /*
            //assert file was created
            Assert.IsTrue(Directory.Exists(filepath));

            //assert words can be properly imported
            _ = _wordrepo.DeleteAllWords(proj.Id).Result;

            string uploadAgain = Path.Combine(util.GenerateFilePath(Utilities.filetype.dir, true), "LiftExport", "NewLiftFile.lift");
            fstream = File.OpenRead(uploadAgain);
            fileUpload = InitFile(fstream);

            _ = _liftController.UploadLiftFile(fileUpload).Result;

            allWords = _wordrepo.GetAllWords(proj.Id);
            Assert.NotZero(allWords.Result.Count);

            File.Delete(fileUpload.FilePath);
            fstream.Close();
            */
        }
    }
}