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
using Microsoft.Extensions.Logging;
using NUnit.Framework;
using static System.Linq.Enumerable;

namespace Backend.Tests.Controllers
{
    public class LiftControllerTests
    {
        private IProjectRepository _projRepo = null!;
        private IWordRepository _wordRepo = null!;
        private ILiftService _liftService = null!;
        private IHubContext<CombineHub> _notifyService = null!;
        private IPermissionService _permissionService = null!;
        private IWordService _wordService = null!;
        private LiftController _liftController = null!;

        private ILogger<LiftController> _logger = null!;
        private string _projId = null!;
        private const string ProjName = "LiftControllerTests";
        private const string UserId = "LiftControllerTestUserId";

        [SetUp]
        public void Setup()
        {
            _projRepo = new ProjectRepositoryMock();
            _wordRepo = new WordRepositoryMock();
            _liftService = new LiftService();
            _notifyService = new HubContextMock();
            _permissionService = new PermissionServiceMock();
            _wordService = new WordService(_wordRepo);
            _liftController = new LiftController(
                _wordRepo, _projRepo, _permissionService, _liftService, _notifyService, _logger);

            _logger = new MockLogger();
            _projId = _projRepo.Create(new Project { Name = ProjName }).Result!.Id;
        }

        [TearDown]
        public void TearDown()
        {
            _projRepo.Delete(_projId);
        }

        public static string RandomLiftFile(string path)
        {
            var name = "TEST-TO_BE_STREAMED-" + Util.RandString() + ".lift";
            name = Path.Combine(path, name);
            var fs = File.OpenWrite(name);

            const string liftHeader = @"<?xml version=""1.0"" encoding=""UTF-8""?>
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

            var headerArray = Encoding.ASCII.GetBytes(liftHeader);
            fs.Write(headerArray);

            foreach (var _ in Range(0, 3))
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

        private static async Task<string> DownloadAndReadLift(LiftController liftController, string projId)
        {
            var liftFile = (FileStreamResult)await liftController.DownloadLiftFile(projId, UserId);

            // Read contents.
            byte[] contents;
            await using (var fileStream = liftFile.FileStream)
            {
                contents = ReadAllBytes(fileStream);
            }

            // Write LiftFile contents to a temporary directory.
            var extractedExportDir = ExtractZipFileContents(contents);
            var sanitizedProjName = Sanitization.MakeFriendlyForPath(ProjName, "Lift");
            var exportPath = Path.Combine(
                extractedExportDir, sanitizedProjName, sanitizedProjName + ".lift");
            var liftText = await File.ReadAllTextAsync(exportPath, Encoding.UTF8);

            // Clean up temporary directory.
            Directory.Delete(extractedExportDir, true);
            return liftText;
        }

        [Test]
        public async Task TestModifiedTimeExportsToLift()
        {
            var word = Util.RandomWord(_projId);
            word.Created = Time.ToUtcIso8601(new DateTime(1000, 1, 1));
            word.Modified = Time.ToUtcIso8601(new DateTime(2000, 1, 1));
            await _wordRepo.Create(word);

            await _liftController.CreateLiftExportThenSignal(_projId, UserId);
            var liftContents = await DownloadAndReadLift(_liftController, _projId);
            Assert.That(liftContents, Contains.Substring("dateCreated=\"1000-01-01T00:00:00Z\""));
            Assert.That(liftContents, Contains.Substring("dateModified=\"2000-01-01T00:00:00Z\""));
        }

        /// <summary>
        /// Create three words and delete one. Ensure that the deleted word is still exported to Lift format and marked
        /// as deleted.
        /// </summary>
        [Test]
        public async Task TestDeletedWordsExportToLift()
        {
            var word = Util.RandomWord(_projId);
            var secondWord = Util.RandomWord(_projId);
            var wordToDelete = Util.RandomWord(_projId);

            var wordToUpdate = await _wordRepo.Create(word);
            wordToDelete = await _wordRepo.Create(wordToDelete);

            // Create untouched word.
            await _wordRepo.Create(secondWord);

            word.Id = "";
            word.Vernacular = "updated";

            await _wordService.Update(_projId, wordToUpdate.Id, word);
            await _wordService.DeleteFrontierWord(_projId, wordToDelete.Id);

            await _liftController.CreateLiftExportThenSignal(_projId, UserId);
            var text = await DownloadAndReadLift(_liftController, _projId);
            // TODO: Add SIL or other XML assertion library and verify with xpath that the correct entries are
            //      kept vs deleted
            // Make sure we exported 2 live and one dead entry
            Assert.That(Regex.Matches(text, "<entry").Count, Is.EqualTo(3));
            // There is only one deleted word
            Assert.That(text.IndexOf("dateDeleted"), Is.EqualTo(text.LastIndexOf("dateDeleted")));

            // Delete the export
            await _liftController.DeleteLiftFile(UserId);
            var notFoundResult = await _liftController.DownloadLiftFile(_projId, UserId);
            Assert.That(notFoundResult is NotFoundObjectResult);
        }

        private static RoundTripObj[] _roundTripCases =
        {
            new("Gusillaay.zip", "gsl-Qaaa-x-orth", new List<string>(), 8045),
            new("GusillaayNoTopLevelFolder.zip", "gsl-Qaaa-x-orth", new List<string>(), 8045),
            new("Lotud.zip", "dtr", new List<string>(), 5400),
            new("Natqgu.zip", "qaa-x-stc-natqgu", new List<string>(), 11570),
            new("Resembli.zip", "ags", new List<string>(), 255),
            new("RWC.zip", "es", new List<string>(), 132),
            new("Sena.zip", "seh", new List<string>(), 1462),
            new(
                "SingleEntryLiftWithSound.zip", "ptn", new List<string> { "short.mp3" }, 1,
                "50398a34-276a-415c-b29e-3186b0f08d8b" /*guid of the lone entry*/,
                "e44420dd-a867-4d71-a43f-e472fd3a8f82" /*id of its first sense*/),
            new(
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
            var proj1 = Util.RandomProject();
            proj1.VernacularWritingSystem.Bcp47 = roundTripObj.Language;
            proj1 = _projRepo.Create(proj1).Result;

            // Upload the zip file.
            // Generate api parameter with filestream.
            using (var stream = File.OpenRead(pathToStartZip))
            {
                var fileUpload = InitFile(stream, roundTripObj.Filename);

                // Make api call.
                var result = _liftController.UploadLiftFile(proj1!.Id, fileUpload).Result;
                Assert.That(result is OkObjectResult);
            }

            proj1 = _projRepo.GetProject(proj1.Id).Result;
            if (proj1 is null)
            {
                Assert.Fail();
                return;
            }

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
            var exportedDirectory = FileOperations.ExtractZipFile(exportedFilePath, null);

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
            var proj2 = Util.RandomProject();
            proj2.VernacularWritingSystem.Bcp47 = roundTripObj.Language;
            proj2 = _projRepo.Create(proj2).Result;

            // Upload the exported words again.
            // Generate api parameter with filestream.
            using (var fstream = File.OpenRead(exportedFilePath))
            {
                var fileUpload = InitFile(fstream, roundTripObj.Filename);

                // Make api call.
                var result2 = _liftController.UploadLiftFile(proj2!.Id, fileUpload).Result;
                Assert.That(result2 is OkObjectResult);
            }

            proj2 = _projRepo.GetProject(proj2.Id).Result;
            if (proj2 is null)
            {
                Assert.Fail();
                return;
            }

            // Clean up zip file.
            File.Delete(exportedFilePath);

            allWords = _wordRepo.GetAllWords(proj2.Id).Result;
            Assert.That(allWords, Has.Count.EqualTo(roundTripObj.NumOfWords));
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
                _projRepo.Delete(project.Id);
            }
        }

        private class MockLogger : ILogger<LiftController>
        {
            public IDisposable BeginScope<TState>(TState state)
            {
                throw new NotImplementedException();
            }

            public bool IsEnabled(LogLevel logLevel)
            {
                return true;
            }

            public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception exception, Func<TState, Exception, string> formatter)
            {
                Console.WriteLine($"{logLevel}: {eventId} {state} {exception.Message}");
            }
        }
    }
}
