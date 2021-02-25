using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Backend.Tests.Mocks;
using BackendFramework.Controllers;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using NUnit.Framework;

namespace Backend.Tests.Controllers
{
    public class LiftControllerTests
    {
        private IWordRepository _wordRepo = null!;
        private IWordService _wordService = null!;
        private IProjectService _projServ = null!;
        private ILiftService _liftService = null!;
        private LiftController _liftController = null!;
        private IHubContext<CombineHub> _notifyService = null!;
        private IPermissionService _permissionService = null!;

        private string _projName = "LiftControllerTests";
        private string _projId = null!;

        [SetUp]
        public void Setup()
        {
            _permissionService = new PermissionServiceMock();
            _projServ = new ProjectServiceMock();
            _projId = _projServ.Create(new Project { Name = _projName }).Result!.Id;
            _wordRepo = new WordRepositoryMock();
            _liftService = new LiftService();
            _notifyService = new HubContextMock();
            _liftController = new LiftController(
                _wordRepo, _projServ, _permissionService, _liftService, _notifyService);
            _wordService = new WordService(_wordRepo);
        }

        [TearDown]
        public void TearDown()
        {
            _projServ.Delete(_projId);
        }

        private static Project RandomProject()
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
            var word = new Word { Senses = new List<Sense> { new Sense(), new Sense(), new Sense() } };

            foreach (var sense in word.Senses)
            {
                sense.Accessibility = State.Active;
                sense.Glosses = new List<Gloss> { new Gloss(), new Gloss(), new Gloss() };

                foreach (var gloss in sense.Glosses)
                {
                    gloss.Def = Util.RandString();
                    gloss.Language = Util.RandString(3);
                }

                sense.SemanticDomains = new List<SemanticDomain>
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

        private static FileUpload InitFile(Stream fstream, string filename)
        {
            var formFile = new FormFile(fstream, 0, fstream.Length, "name", filename);
            var fileUpload = new FileUpload { File = formFile, Name = "FileName" };

            return fileUpload;
        }

        /// <summary> Extract the binary contents of a zip file to a temporary directory. </summary>
        private static string ExtractZipFileContents(byte[] fileContents)
        {
            var zipFile = Path.GetTempFileName();
            File.WriteAllBytes(zipFile, fileContents);
            var extractionPath = FileOperations.ExtractZipFile(zipFile, null, true);
            return extractionPath;
        }

        public class RoundTripObj
        {
            public string Filename { get; }
            public string Language { get; }
            public List<string> AudioFiles { get; }
            public int NumOfWords { get; }
            public string EntryGuid { get; }
            public string SenseGuid { get; }

            public RoundTripObj(
                string filename, string language, List<string> audio,
                int numOfWords, string entryGuid = "", string senseGuid = "")
            {
                Filename = filename;
                Language = language;
                AudioFiles = audio;
                NumOfWords = numOfWords;
                EntryGuid = entryGuid;
                SenseGuid = senseGuid;
            }
        }

        /// <summary>  Read all of the bytes from a Stream into byte array. </summary>
        private static byte[] ReadAllBytes(Stream stream)
        {
            using var ms = new MemoryStream();
            stream.CopyTo(ms);
            return ms.ToArray();
        }

        [Test]
        public async Task TestExportDeleted()
        {
            var word = RandomWord(_projId);
            var secondWord = RandomWord(_projId);
            var wordToDelete = RandomWord(_projId);

            var wordToUpdate = _wordRepo.Create(word).Result;
            wordToDelete = _wordRepo.Create(wordToDelete).Result;

            // Create untouched word.
            _ = _wordRepo.Create(secondWord).Result;

            word.Id = "";
            word.Vernacular = "updated";

            await _wordService.Update(_projId, wordToUpdate.Id, word);
            await _wordService.DeleteFrontierWord(_projId, wordToDelete.Id);

            const string userId = "testId";
            _liftController.ExportLiftFile(_projId, userId).Wait();
            var result = (FileStreamResult)_liftController.DownloadLiftFile(_projId, userId).Result;
            Assert.NotNull(result);

            // Read contents.
            byte[] contents;
            await using (var fileStream = result.FileStream)
            {
                contents = ReadAllBytes(fileStream);
            }

            // Write LiftFile contents to a temporary directory.
            var extractedExportDir = ExtractZipFileContents(contents);
            var sanitizedProjName = Sanitization.MakeFriendlyForPath(_projName, "Lift");
            var exportPath = Path.Combine(
                extractedExportDir, sanitizedProjName, sanitizedProjName + ".lift");
            var text = await File.ReadAllTextAsync(exportPath, Encoding.UTF8);
            // TODO: Add SIL or other XML assertion library and verify with xpath that the correct entries are
            //      kept vs deleted
            // Make sure we exported 2 live and one dead entry
            Assert.That(Regex.Matches(text, "<entry").Count, Is.EqualTo(3));
            // There is only one deleted word
            Assert.That(text.IndexOf("dateDeleted"), Is.EqualTo(text.LastIndexOf("dateDeleted")));

            // Delete the export
            await _liftController.DeleteLiftFile(userId);
            var notFoundResult = _liftController.DownloadLiftFile(_projId, userId).Result as NotFoundObjectResult;
            Assert.NotNull(notFoundResult);
        }

        private static RoundTripObj[] _roundTripCases =
        {
            new RoundTripObj("Gusillaay.zip", "gsl-Qaaa-x-orth", new List<string>(), 8045),
            new RoundTripObj("Lotud.zip", "dtr", new List<string>(), 5400),
            new RoundTripObj("Natqgu.zip", "qaa-x-stc-natqgu", new List<string>(), 11570),
            new RoundTripObj("Resembli.zip", "ags", new List<string>(), 255),
            new RoundTripObj("RWC.zip", "es", new List<string>(), 132),
            new RoundTripObj("Sena.zip", "seh", new List<string>(), 1462),
            new RoundTripObj(
                "SingleEntryLiftWithSound.zip", "ptn", new List<string> { "short.mp3" }, 1,
                "50398a34-276a-415c-b29e-3186b0f08d8b" /*guid of the lone entry*/,
                "e44420dd-a867-4d71-a43f-e472fd3a8f82" /*id of its first sense*/),
            new RoundTripObj(
                "SingleEntryLiftWithTwoSound.zip", "ptn", new List<string> { "short.mp3", "short1.mp3" }, 1,
                "50398a34-276a-415c-b29e-3186b0f08d8b" /*guid of the lone entry*/,
                "e44420dd-a867-4d71-a43f-e472fd3a8f82" /*id of its first sense*/)
        };

        [TestCaseSource(nameof(_roundTripCases))]
        public void TestRoundtrip(RoundTripObj roundTripObj)
        {
            // This test assumes you have the starting .zip (Filename) included in your project files.
            var pathToStartZip = Path.Combine(Util.AssetsDir, roundTripObj.Filename);
            Assert.IsTrue(File.Exists(pathToStartZip));

            // Roundtrip Part 1

            // Init the project the .zip info is added to.
            var proj1 = _projServ.Create(RandomProject()).Result;

            // Upload the zip file.
            // Generate api parameter with filestream.
            using (var stream = File.OpenRead(pathToStartZip))
            {
                var fileUpload = InitFile(stream, roundTripObj.Filename);

                // Make api call.
                var result = _liftController.UploadLiftFile(proj1!.Id, fileUpload).Result;
                Assert.That(!(result is BadRequestObjectResult));
            }

            proj1 = _projServ.GetProject(proj1.Id).Result;
            if (proj1 is null)
            {
                Assert.Fail();
                return;
            }

            Assert.AreEqual(proj1.VernacularWritingSystem.Bcp47, roundTripObj.Language);
            Assert.That(proj1.LiftImported);

            var allWords = _wordRepo.GetAllWords(proj1.Id).Result;
            Assert.AreEqual(allWords.Count, roundTripObj.NumOfWords);

            // We are currently only testing guids on the single-entry data sets.
            if (roundTripObj.EntryGuid != "" && allWords.Count == 1)
            {
                Assert.AreEqual(allWords[0].Guid.ToString(), roundTripObj.EntryGuid);
                if (roundTripObj.SenseGuid != "")
                {
                    Assert.AreEqual(allWords[0].Senses[0].Guid.ToString(), roundTripObj.SenseGuid);
                }
            }

            // Export.
            var exportedFilePath = _liftController.CreateLiftExport(proj1.Id).Result;
            var exportedDirectory = FileOperations.ExtractZipFile(exportedFilePath, null, false);

            // Assert the file was created with desired hierarchy.
            Assert.That(Directory.Exists(exportedDirectory));
            var sanitizedProjName = Sanitization.MakeFriendlyForPath(proj1.Name, "Lift");
            var exportedProjDir = Path.Combine(exportedDirectory, sanitizedProjName);
            Assert.That(Directory.Exists(Path.Combine(exportedProjDir, "audio")));
            foreach (var audioFile in roundTripObj.AudioFiles)
            {
                Assert.That(File.Exists(Path.Combine(exportedProjDir, "audio", audioFile)));
            }
            Assert.That(Directory.Exists(Path.Combine(exportedProjDir, "WritingSystems")));
            Assert.That(File.Exists(Path.Combine(
                exportedProjDir, "WritingSystems", roundTripObj.Language + ".ldml")));
            Assert.That(File.Exists(Path.Combine(exportedProjDir, sanitizedProjName + ".lift")));
            Directory.Delete(exportedDirectory, true);

            // Clean up.
            _wordRepo.DeleteAllWords(proj1.Id);

            // Roundtrip Part 2

            // Init the project the .zip info is added to.
            var proj2 = _projServ.Create(RandomProject()).Result;

            // Upload the exported words again.
            // Generate api parameter with filestream.
            using (var fstream = File.OpenRead(exportedFilePath))
            {
                var fileUpload = InitFile(fstream, roundTripObj.Filename);

                // Make api call.
                var result2 = _liftController.UploadLiftFile(proj2!.Id, fileUpload).Result;
                Assert.That(!(result2 is BadRequestObjectResult));
            }

            proj2 = _projServ.GetProject(proj2.Id).Result;
            if (proj2 is null)
            {
                Assert.Fail();
                return;
            }

            Assert.AreEqual(proj2.VernacularWritingSystem.Bcp47, roundTripObj.Language);

            // Clean up zip file.
            File.Delete(exportedFilePath);

            allWords = _wordRepo.GetAllWords(proj2.Id).Result;
            Assert.AreEqual(allWords.Count, roundTripObj.NumOfWords);
            // We are currently only testing guids on the single-entry data sets.
            if (roundTripObj.EntryGuid != "" && allWords.Count == 1)
            {
                Assert.AreEqual(allWords[0].Guid.ToString(), roundTripObj.EntryGuid);
                if (roundTripObj.SenseGuid != "")
                {
                    Assert.AreEqual(allWords[0].Senses[0].Guid.ToString(), roundTripObj.SenseGuid);
                }
            }

            // Export.
            exportedFilePath = _liftController.CreateLiftExport(proj2.Id).Result;
            exportedDirectory = FileOperations.ExtractZipFile(exportedFilePath, null);

            // Assert the file was created with desired hierarchy.
            Assert.That(Directory.Exists(exportedDirectory));
            sanitizedProjName = Sanitization.MakeFriendlyForPath(proj2.Name, "Lift");
            exportedProjDir = Path.Combine(exportedDirectory, sanitizedProjName);
            Assert.That(Directory.Exists(Path.Combine(exportedProjDir, "audio")));
            foreach (var audioFile in roundTripObj.AudioFiles)
            {
                var path = Path.Combine(exportedProjDir, "audio", audioFile);
                Assert.That(File.Exists(path),
                    $"The file {audioFile} can not be found at this path: {path}");
            }
            Assert.That(Directory.Exists(Path.Combine(exportedProjDir, "WritingSystems")));
            Assert.That(File.Exists(Path.Combine(
                exportedProjDir, "WritingSystems", roundTripObj.Language + ".ldml")));
            Assert.That(File.Exists(Path.Combine(exportedProjDir, sanitizedProjName + ".lift")));
            Directory.Delete(exportedDirectory, true);

            // Clean up.
            _wordRepo.DeleteAllWords(proj2.Id);
            foreach (var project in new List<Project> { proj1, proj2 })
            {
                _projServ.Delete(project.Id);
            }
        }
    }
}
