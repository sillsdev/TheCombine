using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using BackendFramework.Controllers;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;

namespace Backend.Tests
{
    public class LiftControllerTests
    {
        private IWordRepository _wordrepo;
        private IWordContext _wordContext;
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
            _wordService = new WordService(_wordrepo, _wordContext);
        }

        static Project RandomProject()
        {
            var project = new Project
            {
                Name = Convert.ToBase64String(Guid.NewGuid().ToByteArray()).Substring(0, 4)
            };
            return project;
        }

        public string RandomLiftFile(string path)
        {
            var name = "TEST-TO_BE_STREAMED-" + Util.RandString() + ".lift";
            name = Path.Combine(path, name);
            var fs = File.OpenWrite(name);

            const string header = @"<?xml version=""1.0"" encoding=""UTF-8""?>
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

            var headerArray = Encoding.ASCII.GetBytes(header);
            fs.Write(headerArray);

            for (var i = 0; i < 3; i++)
            {
                var dateCreated = $"\"{Util.RandString(20)}\"";
                var dateModified = $"\"{Util.RandString(20)}\"";
                var id = $"\"{Util.RandString()}\"";
                var guid = $"\"{Util.RandString()}\"";
                var vernLang = $"\"{Util.RandString(3)}\"";
                var vern = Util.RandString(6);
                var plural = Util.RandString(8);
                var audio = $"\"{Util.RandString(3)}.mp3\"";
                var senseId = $"\"{Util.RandString()}\"";
                var transLang1 = $"\"{Util.RandString(3)}\"";
                var transLang2 = $"\"{Util.RandString(3)}\"";
                var trans1 = Util.RandString(6);
                var trans2 = Util.RandString(8);
                var sdValue = $"\"{Util.RandString(4)} {Util.RandString(4)}\"";

                var entry =
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
                var entryArray = Encoding.ASCII.GetBytes(entry);
                fs.Write(entryArray);
            }

            var close = Encoding.ASCII.GetBytes("</lift>");
            fs.Write(close);

            fs.Close();
            return name;
        }

        private static Word RandomWord(string projId)
        {
            var word = new Word { Senses = new List<Sense>() { new Sense(), new Sense(), new Sense() } };

            foreach (var sense in word.Senses)
            {
                sense.Accessibility = (int)State.Active;
                sense.Glosses = new List<Gloss>() { new Gloss(), new Gloss(), new Gloss() };

                foreach (var gloss in sense.Glosses)
                {
                    gloss.Def = Util.RandString();
                    gloss.Language = Util.RandString(3);
                }

                sense.SemanticDomains = new List<SemanticDomain>()
                {
                    new SemanticDomain(), new SemanticDomain(), new SemanticDomain()
                };

                foreach (var semdom in sense.SemanticDomains)
                {
                    semdom.Name = Util.RandString();
                    semdom.Id = Util.RandString();
                    semdom.Description = Util.RandString();
                }
            }

            word.Created = Util.RandString();
            word.Vernacular = Util.RandString();
            word.Modified = Util.RandString();
            word.PartOfSpeech = Util.RandString();
            word.Plural = Util.RandString();
            word.History = new List<string>();
            word.ProjectId = projId;

            return word;
        }

        private static FileUpload InitFile(FileStream fstream, string filename)
        {
            var formFile = new FormFile(fstream, 0, fstream.Length, "name", filename);
            var fileUpload = new FileUpload { Name = "FileName", File = formFile };

            return fileUpload;
        }

        private class RoundTripObj
        {
            public string Language { get; set; }
            public List<string> AudioFiles { get; set; }
            public int NumOfWords { get; set; }

            public RoundTripObj(string lang, List<string> audio, int words)
            {
                Language = lang;
                AudioFiles = audio;
                NumOfWords = words;
            }
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

            var combinePath = FileUtilities.GenerateFilePath(FileUtilities.FileType.Dir, true, "", "");
            var exportPath = Path.Combine(combinePath, proj.Id, "Export", "LiftExport",
                Path.Combine("Lift", "NewLiftFile.lift"));
            var text = File.ReadAllText(exportPath, Encoding.UTF8);
            // There is only one deleted word
            Assert.AreEqual(text.IndexOf("dateDeleted"), text.LastIndexOf("dateDeleted"));
        }

        [Test]
        public void TestRoundtrip()
        {
            // This test assumes you have the starting .zip included in your project files.

            // Get path to the starting dir
            var pathToStartZips = Path.Combine(Directory.GetParent(Directory.GetParent(
                Directory.GetParent(Environment.CurrentDirectory).ToString()).ToString()).ToString(), "Assets");
            var testZips = Directory.GetFiles(pathToStartZips, "*.zip");

            var fileMapping = new Dictionary<string, RoundTripObj>();

            // Add new .zip file information here
            var gusillaay = new RoundTripObj("gsl-Qaaa-x-orth", new List<string>(), 8045 /*number of words*/);
            fileMapping.Add("Gusillaay.zip", gusillaay);
            var lotad = new RoundTripObj("dtr", new List<string>(), 5400);
            fileMapping.Add("Lotad.zip", lotad);
            var natqgu = new RoundTripObj("qaa-x-stc-natqgu", new List<string>(), 11570 /*number of words*/);
            fileMapping.Add("Natqgu.zip", natqgu);
            var resembli = new RoundTripObj("ags", new List<string>(), 255 /*number of words*/);
            fileMapping.Add("Resembli.zip", resembli);
            var rwc = new RoundTripObj("es", new List<string>(), 132 /*number of words*/);
            fileMapping.Add("RWC.zip", rwc);
            var sena = new RoundTripObj("seh", new List<string>(), 1462 /*number of words*/);
            fileMapping.Add("Sena.zip", sena);
            var singleEntryLiftWithSound = new RoundTripObj(
                "ptn", new List<string> { "short.mp3" }, 1 /*number of words*/);
            fileMapping.Add("SingleEntryLiftWithSound.zip", singleEntryLiftWithSound);
            var singleEntryLiftWithTwoSound = new RoundTripObj(
                "ptn",
                new List<string> { "short.mp3", "short1.mp3" }, 1 /*number of words*/);
            fileMapping.Add("SingleEntryLiftWithTwoSound.zip", singleEntryLiftWithTwoSound);

            foreach (var dataSet in fileMapping)
            {
                var actualFilename = dataSet.Key;
                var pathToStartZip = Path.Combine(pathToStartZips, actualFilename);

                // Upload the zip file

                // Init the project the .zip info is added to
                var proj = RandomProject();
                _projServ.Create(proj);

                // Generate api parameter with filestream
                if (File.Exists(pathToStartZip))
                {
                    var fstream = File.OpenRead(pathToStartZip);
                    var fileUpload = InitFile(fstream, actualFilename);

                    // Make api call
                    var result = _liftController.UploadLiftFile(proj.Id, fileUpload).Result;
                    Assert.That(!(result is BadRequestObjectResult));

                    proj = _projServ.GetProject(proj.Id).Result;
                    Assert.AreEqual(proj.VernacularWritingSystem.Bcp47, dataSet.Value.Language);

                    fstream.Close();

                    var allWords = _wordrepo.GetAllWords(proj.Id);
                    // Export
                    var exportedFilePath = _liftController.CreateLiftExport(proj.Id);
                    var exportedDirectory = Path.GetDirectoryName(exportedFilePath);

                    // Assert the file was created with desired heirarchy
                    Assert.That(Directory.Exists(exportedDirectory));
                    Assert.That(Directory.Exists(Path.Combine(exportedDirectory, "LiftExport", "Lift", "audio")));
                    foreach (var audioFile in dataSet.Value.AudioFiles)
                    {
                        Assert.That(File.Exists(Path.Combine(
                            exportedDirectory, "LiftExport", "Lift", "audio", audioFile)));
                    }
                    Assert.That(Directory.Exists(Path.Combine(exportedDirectory, "LiftExport", "Lift", "WritingSystems")));
                    Assert.That(File.Exists(Path.Combine(
                        exportedDirectory,
                        "LiftExport", "Lift", "WritingSystems", dataSet.Value.Language + ".ldml")));
                    Assert.That(File.Exists(Path.Combine(exportedDirectory, "LiftExport", "Lift", "NewLiftFile.lift")));
                    var dirList = new List<string>(
                        Directory.GetDirectories(Path.GetDirectoryName(exportedDirectory)));
                    dirList.Remove(exportedDirectory);
                    Assert.That(Directory.Exists(Path.Combine(Path.GetDirectoryName(exportedDirectory), dirList.Single())));

                    _wordrepo.DeleteAllWords(proj.Id);

                    // Roundtrip Part 2

                    // Upload the exported words again
                    // Init the project the .zip info is added to
                    var proj2 = RandomProject();
                    _projServ.Create(proj2);

                    // Generate api parameter with filestream
                    fstream = File.OpenRead(exportedFilePath);
                    fileUpload = InitFile(fstream, actualFilename);

                    // Make api call
                    var result2 = _liftController.UploadLiftFile(proj2.Id, fileUpload).Result;
                    Assert.That(!(result is BadRequestObjectResult));

                    proj2 = _projServ.GetProject(proj2.Id).Result;
                    Assert.AreEqual(proj2.VernacularWritingSystem.Bcp47, dataSet.Value.Language);

                    fstream.Close();

                    allWords = _wordrepo.GetAllWords(proj2.Id);
                    Assert.AreEqual(allWords.Result.Count, dataSet.Value.NumOfWords);

                    // Export
                    exportedFilePath = _liftController.CreateLiftExport(proj2.Id);
                    exportedDirectory = Path.GetDirectoryName(exportedFilePath);

                    // Assert the file was created with desired hierarchy
                    Assert.That(Directory.Exists(exportedDirectory));
                    Assert.That(Directory.Exists(Path.Combine(exportedDirectory, "LiftExport", "Lift", "audio")));
                    foreach (var audioFile in dataSet.Value.AudioFiles)
                    {
                        var path = Path.Combine(exportedDirectory, "LiftExport", "Lift", "audio", audioFile);
                        Assert.That(File.Exists(path),
                            "The file " + audioFile + " can not be found at this path: " + path);
                    }
                    Assert.That(Directory.Exists(Path.Combine(exportedDirectory, "LiftExport", "Lift", "WritingSystems")));
                    Assert.That(File.Exists(Path.Combine(
                        exportedDirectory,
                        "LiftExport", "Lift", "WritingSystems", dataSet.Value.Language + ".ldml")));
                    Assert.That(File.Exists(Path.Combine(exportedDirectory, "LiftExport", "Lift", "NewLiftFile.lift")));
                    dirList = new List<string>(Directory.GetDirectories(Path.GetDirectoryName(exportedDirectory)));
                    dirList.Remove(exportedDirectory);
                    Assert.That(Directory.Exists(Path.Combine(Path.GetDirectoryName(exportedDirectory), dirList.Single())));

                    _wordrepo.DeleteAllWords(proj.Id);
                }
            }
        }
    }
}
