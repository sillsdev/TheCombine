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
using Microsoft.Extensions.Logging;
using NUnit.Framework;
using static System.Linq.Enumerable;

namespace Backend.Tests.Controllers
{
    internal sealed class LiftControllerTests : IDisposable
    {
        private IProjectRepository _projRepo = null!;
        private ISpeakerRepository _speakerRepo = null!;
        private IWordRepository _wordRepo = null!;
        private ILiftService _liftService = null!;
        private IWordService _wordService = null!;
        private LiftController _liftController = null!;

        private const string FileName = "SingleEntryLiftWithSound.zip"; // file in Backend.Tests/Assets/
        private readonly Stream _stream = File.OpenRead(Path.Combine(Util.AssetsDir, FileName));
        private FormFile _file = null!;

        public void Dispose()
        {
            _liftController?.Dispose();
            GC.SuppressFinalize(this);
        }

        private string _projId = null!;
        private const string ProjName = "LiftControllerTests";
        private const string ExportId = "LiftControllerTestExportId";
        private const string UserId = "LiftControllerTestUserId";

        [SetUp]
        public void Setup()
        {
            _projRepo = new ProjectRepositoryMock();
            _speakerRepo = new SpeakerRepositoryMock();
            _wordRepo = new WordRepositoryMock();
            _liftService = new LiftService(new SemanticDomainRepositoryMock(), _speakerRepo);
            _wordService = new WordService(_wordRepo);
            _liftController = new LiftController(_wordRepo, _projRepo, new PermissionServiceMock(), _liftService,
                new HubContextMock<ExportHub>(), new MockLogger());

            _projId = _projRepo.Create(new Project { Name = ProjName }).Result!.Id;
            _file = new FormFile(_stream, 0, _stream.Length, "Name", FileName);
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

            const string liftHeader = $@"<?xml version=""1.0"" encoding=""UTF-8""?>
                <lift producer = ""SIL.FLEx 8.3.12.43172"" version = ""0.13"">
                    <header>
                        <ranges>
                            <range id = ""semantic-domain-ddp4"" href = ""file://C:/Users/DelaneyS/TheCombine/testingdata/testingdata.lift-ranges""/>
                        </ranges>
                        <fields>
                            <field tag = ""{LiftHelper.FlagFieldTag}"">
                                <form lang = ""en""><text></text></form>
                                <form lang = ""qaa-x-spec""><text> Class = LexEntry; Type = MultiUnicode; WsSelector = kwsAnals </text></form>
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
                var flag = Util.RandString(10);
                var note = Util.RandString(12);
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
                            <field type = ""{LiftHelper.FlagFieldTag}"">
                                <form lang = {transLang1}><text> {flag} </text></form>
                            </field>
                            <note>
                                <form lang = {transLang1}><text> {note} </text></form>
                            </note>
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

        private static FormFile InitFile(Stream stream, string filename)
        {
            return new(stream, 0, stream.Length, "name", filename);
        }

        /// <summary> Extract the binary contents of a zip file to a temporary directory. </summary>
        private static string ExtractZipFileContents(byte[] fileContents)
        {
            var zipFile = Path.GetTempFileName();
            File.WriteAllBytes(zipFile, fileContents);
            var extractionPath = FileOperations.ExtractZipFile(zipFile, null, true);
            return extractionPath;
        }

        /// <summary> Return the given file name with its .webm extension (if it has one) changed to .wav. </summary>
        private static string ChangeWebmToWav(string fileName)
        {
            if (Path.GetExtension(fileName).Equals(".webm", StringComparison.OrdinalIgnoreCase))
            {
                return Path.ChangeExtension(fileName, ".wav");
            }
            return fileName;
        }

        internal sealed class RoundTripObj(string filename, string language, List<string> audio, int numOfWords,
            string entryGuid = "", string senseGuid = "", bool hasGramInfo = false, bool hasDefs = false)
        {
            public string Filename { get; } = filename;
            public string Language { get; } = language;
            public List<string> AudioFiles { get; } = audio;
            public int NumOfWords { get; } = numOfWords;
            public string EntryGuid { get; } = entryGuid;
            public string SenseGuid { get; } = senseGuid;
            public bool HasGramInfo { get; } = hasGramInfo;
            public bool HasDefs { get; } = hasDefs;
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
        public void TestUploadLiftFileNoPermission()
        {
            _liftController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = _liftController.UploadLiftFile(_projId, _file).Result;
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public void TestUploadLiftFileInvalidProjectId()
        {
            var result = _liftController.UploadLiftFile("../hack", _file).Result;
            Assert.That(result, Is.InstanceOf<UnsupportedMediaTypeResult>());
        }

        [Test]
        public void TestUploadLiftFileAlreadyImported()
        {
            var projId = _projRepo.Create(new Project { Name = "already has import", LiftImported = true }).Result!.Id;
            var result = _liftController.UploadLiftFile(projId, _file).Result;
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
            Assert.That(((BadRequestObjectResult)result).Value, Contains.Substring("LIFT"));
        }

        [Test]
        public void TestUploadLiftFileBadFile()
        {
            var result = _liftController.UploadLiftFile(_projId, null).Result;
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
            Assert.That(((BadRequestObjectResult)result).Value, Is.InstanceOf<string>());
        }

        [Test]
        public void TestUploadLiftFileAndGetWritingSystems()
        {
            var fileName = "Natqgu.zip";
            var pathToZip = Path.Combine(Util.AssetsDir, fileName);

            Assert.That(_liftService.RetrieveImport(UserId), Is.Null);

            // Upload the zip file.
            // Generate api parameter with file stream.
            using (var fileStream = File.OpenRead(pathToZip))
            {
                var fileUpload = InitFile(fileStream, fileName);
                var result = _liftController.UploadLiftFileAndGetWritingSystems(fileUpload, UserId).Result;
                Assert.That(result, Is.TypeOf<OkObjectResult>());
                var writingSystems = (result as OkObjectResult)!.Value as List<WritingSystem>;
                Assert.That(writingSystems, Has.Count.Not.Zero);
            }

            Assert.That(_liftService.RetrieveImport(UserId), Is.Not.Null);
            _liftService.DeleteImport(UserId);
        }

        [Test]
        public void TestDeleteFrontierAndFinishUploadLiftFileNoPermission()
        {
            _liftController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = _liftController.DeleteFrontierAndFinishUploadLiftFile(_projId).Result;
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public void TestDeleteFrontierAndFinishUploadLiftFileInvalidProjectId()
        {
            var result = _liftController.DeleteFrontierAndFinishUploadLiftFile("../hack").Result;
            Assert.That(result, Is.InstanceOf<UnsupportedMediaTypeResult>());
        }

        [Test]
        public void TestFinishUploadLiftFileNothingToFinish()
        {
            var proj = Util.RandomProject();
            proj = _projRepo.Create(proj).Result;

            // No extracted import dir stored for user.
            Assert.That(_liftService.RetrieveImport(UserId), Is.Null);
            var result = _liftController.FinishUploadLiftFile(proj!.Id, UserId).Result;
            Assert.That(result, Is.TypeOf<BadRequestObjectResult>());

            // Empty extracted import dir stored for user.
            _liftService.StoreImport(UserId, "  ");
            result = _liftController.FinishUploadLiftFile(proj!.Id, UserId).Result;
            Assert.That(result, Is.TypeOf<BadRequestObjectResult>());

            // Nonsense extracted import dir stored for user.
            _liftService.StoreImport(UserId, "not-a-real-path");
            result = _liftController.FinishUploadLiftFile(proj!.Id, UserId).Result;
            Assert.That(result, Is.TypeOf<BadRequestObjectResult>());
            Assert.That(_liftService.RetrieveImport(UserId), Is.Null);
        }

        [Test]
        public void TestFinishUploadLiftFileNoPermission()
        {
            _liftController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = _liftController.FinishUploadLiftFile(_projId).Result;
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public void TestFinishUploadLiftFileInvalidProjectId()
        {
            var result = _liftController.FinishUploadLiftFile("../hack", UserId).Result;
            Assert.That(result, Is.InstanceOf<UnsupportedMediaTypeResult>());
        }

        [Test]
        public async Task TestModifiedTimeExportsToLift()
        {
            var word = Util.RandomWord(_projId);
            word.Created = Time.ToUtcIso8601(new DateTime(1000, 1, 1));
            word.Modified = Time.ToUtcIso8601(new DateTime(2000, 1, 1));
            await _wordRepo.Create(word);

            _liftService.SetExportInProgress(UserId, ExportId);
            await _liftController.CreateLiftExportThenSignal(_projId, UserId, ExportId);
            var liftContents = await DownloadAndReadLift(_liftController, _projId);
            Assert.That(liftContents, Does.Contain("dateCreated=\"1000-01-01T00:00:00Z\""));
            Assert.That(liftContents, Does.Contain("dateModified=\"2000-01-01T00:00:00Z\""));
        }

        [Test]
        public void TestExportLiftFileNoPermission()
        {
            _liftController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = _liftController.ExportLiftFile(_projId).Result;
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public void TestExportLiftFileInvalidProjectId()
        {
            var result = _liftController.ExportLiftFile("../hack").Result;
            Assert.That(result, Is.InstanceOf<UnsupportedMediaTypeResult>());
        }

        [Test]
        public void TestExportLiftFileNoProject()
        {
            var result = _liftController.ExportLiftFile("non-existent-project").Result;
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public void TestExportLiftFileNoWordsInProject()
        {
            var result = _liftController.ExportLiftFile(_projId).Result;
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
        }

        [Test]
        public void TestExportInvalidProjectId()
        {
            const string invalidProjectId = "INVALID_ID";
            Assert.That(
                async () =>
                {
                    _liftService.SetExportInProgress(UserId, ExportId);
                    await _liftController.CreateLiftExportThenSignal(invalidProjectId, UserId, ExportId);
                },
                Throws.TypeOf<MissingProjectException>());
        }

        [Test]
        public async Task TestCancelLiftExport()
        {
            _liftController.ControllerContext.HttpContext = PermissionServiceMock.HttpContextWithUserId(UserId);
            _liftService.SetExportInProgress(UserId, ExportId);
            var active = await _liftController.CreateLiftExportThenSignal(_projId, UserId, ExportId);
            Assert.That(active, Is.True);

            _liftService.SetExportInProgress(UserId, ExportId);
            _liftController.CancelLiftExport();
            active = await _liftController.CreateLiftExportThenSignal(_projId, UserId, ExportId);
            Assert.That(active, Is.False);
        }

        [Test]
        public void TestDownloadLiftFileNoPermission()
        {
            _liftController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = _liftController.DownloadLiftFile(_projId).Result;
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        /// <summary>
        /// Create three words and delete one. Ensure that the deleted word is still exported to LIFT format and marked
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

            await _wordService.Update(_projId, UserId, wordToUpdate.Id, word);
            await _wordService.DeleteFrontierWord(_projId, UserId, wordToDelete.Id);

            _liftService.SetExportInProgress(UserId, ExportId);
            await _liftController.CreateLiftExportThenSignal(_projId, UserId, ExportId);
            var text = await DownloadAndReadLift(_liftController, _projId);
            // TODO: Add SIL or other XML assertion library and verify with xpath that the correct entries are
            //      kept vs deleted
            // Make sure we exported 2 live and one dead entry
            Assert.That(Regex.Matches(text, "<entry"), Has.Count.EqualTo(3));
            // There is only one deleted word
            Assert.That(text.IndexOf("dateDeleted", StringComparison.Ordinal),
                Is.EqualTo(text.LastIndexOf("dateDeleted", StringComparison.Ordinal)));

            // Delete the export
            _liftController.DeleteLiftFile(UserId);
            var notFoundResult = await _liftController.DownloadLiftFile(_projId, UserId);
            Assert.That(notFoundResult, Is.TypeOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task TestExportConsentFileWithSpeakerName()
        {
            // Add word so there's something to export
            await _wordRepo.Create(Util.RandomWord(_projId));

            // Add speakers to project with names that will collide when sanitized
            await _speakerRepo.Create(new Speaker { Name = "No consent!", ProjectId = _projId });

            var nameNoExt = "Underscored_name";
            var speakerNoExt = await _speakerRepo.Create(
                new Speaker { Name = nameNoExt, ProjectId = _projId, Consent = ConsentType.Image });
            var speakerNoExt1 = await _speakerRepo.Create(
                new Speaker { Name = "Underscored name", ProjectId = _projId, Consent = ConsentType.Image });
            var speakerNoExt2 = await _speakerRepo.Create(
                new Speaker { Name = "Underscored_náme", ProjectId = _projId, Consent = ConsentType.Image });

            var nameExts = "Imagination";
            var speakerExts = await _speakerRepo.Create(
                new Speaker { Name = nameExts, ProjectId = _projId, Consent = ConsentType.Image });
            var speakerExts1 = await _speakerRepo.Create(
                new Speaker { Name = "Imágination", ProjectId = _projId, Consent = ConsentType.Image });

            // Create mock consent files tied to speaker ids
            var pathNoExt = FileStorage.GenerateConsentFilePath(speakerNoExt.Id);
            var pathNoExt1 = FileStorage.GenerateConsentFilePath(speakerNoExt1.Id);
            var pathNoExt2 = FileStorage.GenerateConsentFilePath(speakerNoExt2.Id);
            var expectedFileNames = new List<string> { nameNoExt, $"{nameNoExt}1", $"{nameNoExt}2" };

            var ext = ".png";
            var pathExt = FileStorage.GenerateConsentFilePath(speakerExts.Id, ext);
            var pathExt1 = FileStorage.GenerateConsentFilePath(speakerExts1.Id, ext);
            expectedFileNames.AddRange(new List<string> { $"{nameExts}{ext}", $"{nameExts}1{ext}" });

            var mockFiles = new List<string> { pathNoExt, pathNoExt1, pathNoExt2, pathExt, pathExt1 };
            mockFiles.ForEach(path => File.Create(path).Dispose());

            // Export the project
            var exportedFilePath = await _liftController.CreateLiftExport(_projId);
            var exportedDirectory = FileOperations.ExtractZipFile(exportedFilePath, null);
            var exportedProjDir = Directory.GetDirectories(exportedDirectory).First();

            // Verify all consent files were copied over with speaker names
            var consentFiles = Directory.GetFiles(Path.Combine(exportedProjDir, "consent"));
            var consentFileNames = consentFiles.Select(path => Path.GetFileName(path)).ToList();
            Assert.That(consentFileNames, Has.Count.EqualTo(expectedFileNames.Count));
            foreach (var file in expectedFileNames)
            {
                Assert.That(consentFileNames.Contains(file));
            }

            // Delete everything
            mockFiles.ForEach(path => File.Delete(path));
            File.Delete(exportedFilePath);
            Directory.Delete(exportedDirectory, true);
        }

        private static RoundTripObj[] _roundTripCases =
        {
            new("Gusillaay.zip", "gsl-Qaaa-x-orth", new List<string>(), 8045),
            new("GusillaayNoTopLevelFolder.zip", "gsl-Qaaa-x-orth", new List<string>(), 8045),
            new("Lotud.zip", "dtr", new List<string>(), 5400, "", "", true, true),
            new("Natqgu.zip", "qaa-x-stc-natqgu", new List<string>(), 11570, "", "", true, true),
            new("Resembli.zip", "ags", new List<string>(), 255, "", "", true, true),
            new("RWC.zip", "es", new List<string>(), 132, "", "", true),
            new("Sena.zip", "seh", new List<string>(), 1462, "", "", true, true),
            new(
                "SingleEntryLiftWithSound.zip", "ptn", new List<string> { "short.mp3" }, 1,
                "50398a34-276a-415c-b29e-3186b0f08d8b" /*guid of the lone entry*/,
                "e44420dd-a867-4d71-a43f-e472fd3a8f82" /*id of its first sense*/, true),
            new(
                "SingleEntryLiftWithTwoSound.zip", "ptn", new List<string> { "short.mp3", "short1.mp3" }, 1,
                "50398a34-276a-415c-b29e-3186b0f08d8b" /*guid of the lone entry*/,
                "e44420dd-a867-4d71-a43f-e472fd3a8f82" /*id of its first sense*/, true),
            new(
                "SingleEntryLiftWithWebmSound.zip", "ptn", new List<string> { "short.webm" }, 1,
                "50398a34-276a-415c-b29e-3186b0f08d8b" /*guid of the lone entry*/,
                "e44420dd-a867-4d71-a43f-e472fd3a8f82" /*id of its first sense*/, true)
        };

        [TestCaseSource(nameof(_roundTripCases))]
        public void TestRoundtrip(RoundTripObj roundTripObj)
        {
            // This test assumes you have the starting .zip (Filename) included in your project files.
            var pathToStartZip = Path.Combine(Util.AssetsDir, roundTripObj.Filename);
            Assert.That(File.Exists(pathToStartZip), Is.True);

            // Roundtrip Part 1

            // Init the project the .zip info is added to.
            var proj1 = Util.RandomProject();
            proj1.VernacularWritingSystem.Bcp47 = roundTripObj.Language;
            proj1 = _projRepo.Create(proj1).Result;

            // Upload the zip file.
            // Generate api parameter with file stream.
            using (var fileStream = File.OpenRead(pathToStartZip))
            {
                var fileUpload = InitFile(fileStream, roundTripObj.Filename);

                // Make api call.
                var result = _liftController.UploadLiftFile(proj1!.Id, fileUpload).Result;
                Assert.That(result, Is.TypeOf<OkObjectResult>());
            }

            proj1 = _projRepo.GetProject(proj1.Id).Result;
            Assert.That(proj1, Is.Not.Null);
            Assert.That(proj1!.LiftImported, Is.True);
            Assert.That(proj1.DefinitionsEnabled, Is.EqualTo(roundTripObj.HasDefs));
            Assert.That(proj1.GrammaticalInfoEnabled, Is.EqualTo(roundTripObj.HasGramInfo));

            var allWords = _wordRepo.GetAllWords(proj1.Id).Result;
            Assert.That(allWords.Count, Is.EqualTo(roundTripObj.NumOfWords));

            // We are currently only testing guids and imported audio on the single-entry data sets.
            if (allWords.Count == 1)
            {
                var word = allWords[0].Clone();
                Assert.That(roundTripObj.EntryGuid, Is.Not.EqualTo(""));
                Assert.That(word.Guid.ToString(), Is.EqualTo(roundTripObj.EntryGuid));
                if (roundTripObj.SenseGuid != "")
                {
                    Assert.That(word.Senses[0].Guid.ToString(), Is.EqualTo(roundTripObj.SenseGuid));
                }
                foreach (var audio in word.Audio)
                {
                    Assert.That(roundTripObj.AudioFiles, Does.Contain(Path.GetFileName(audio.FileName)));
                    Assert.That(audio.Protected, Is.True);
                }
            }

            // Export.
            var exportedFilePath = _liftController.CreateLiftExport(proj1.Id).Result;
            var exportedDirectory = FileOperations.ExtractZipFile(exportedFilePath, null);

            // Assert the file was created with desired hierarchy.
            Assert.That(Directory.Exists(exportedDirectory), Is.True);
            var sanitizedProjName = Sanitization.MakeFriendlyForPath(proj1.Name, "Lift");
            var exportedProjDir = Path.Combine(exportedDirectory, sanitizedProjName);
            Assert.That(Directory.Exists(Path.Combine(exportedProjDir, "audio")), Is.True);
            foreach (var audioFile in roundTripObj.AudioFiles)
            {
                var path = Path.Combine(exportedProjDir, "audio", ChangeWebmToWav(audioFile));
                Assert.That(File.Exists(path), Is.True, $"No file exists at this path: {path}");
            }
            var writingSystemsDir = FileStorage.GenerateWritingsSystemsSubdirPath(exportedProjDir);
            Assert.That(Directory.Exists(writingSystemsDir), Is.True);
            Assert.That(File.Exists(Path.Combine(writingSystemsDir, roundTripObj.Language + ".ldml")), Is.True);
            Assert.That(File.Exists(Path.Combine(exportedProjDir, sanitizedProjName + ".lift")), Is.True);
            Directory.Delete(exportedDirectory, true);

            // Clean up.
            _wordRepo.DeleteAllWords(proj1.Id);

            // Roundtrip Part 2

            // Init the project the .zip info is added to.
            var proj2 = Util.RandomProject();
            proj2.VernacularWritingSystem.Bcp47 = roundTripObj.Language;
            proj2 = _projRepo.Create(proj2).Result;

            // Upload the exported words again.
            // Generate api parameter with file stream.
            using (var fileStream = File.OpenRead(exportedFilePath))
            {
                var fileUpload = InitFile(fileStream, roundTripObj.Filename);

                // Make api call.
                var result2 = _liftController.UploadLiftFile(proj2!.Id, fileUpload).Result;
                Assert.That(result2, Is.TypeOf<OkObjectResult>());
            }

            proj2 = _projRepo.GetProject(proj2.Id).Result;
            Assert.That(proj2, Is.Not.Null);

            // Clean up zip file.
            File.Delete(exportedFilePath);

            // Ensure that the definitions and grammatical info weren't all lost.
            Assert.That(proj2!.DefinitionsEnabled, Is.EqualTo(roundTripObj.HasDefs));
            Assert.That(proj2.GrammaticalInfoEnabled, Is.EqualTo(roundTripObj.HasGramInfo));

            allWords = _wordRepo.GetAllWords(proj2.Id).Result;
            Assert.That(allWords, Has.Count.EqualTo(roundTripObj.NumOfWords));

            // We are currently only testing guids on the single-entry data sets.
            if (roundTripObj.EntryGuid != "" && allWords.Count == 1)
            {
                var word = allWords[0];
                Assert.That(word.Guid.ToString(), Is.EqualTo(roundTripObj.EntryGuid));
                if (roundTripObj.SenseGuid != "")
                {
                    Assert.That(word.Senses[0].Guid.ToString(), Is.EqualTo(roundTripObj.SenseGuid));
                }
            }

            // Export.
            exportedFilePath = _liftController.CreateLiftExport(proj2.Id).Result;
            exportedDirectory = FileOperations.ExtractZipFile(exportedFilePath, null);

            // Assert the file was created with desired hierarchy.
            Assert.That(Directory.Exists(exportedDirectory), Is.True);
            sanitizedProjName = Sanitization.MakeFriendlyForPath(proj2.Name, "Lift");
            exportedProjDir = Path.Combine(exportedDirectory, sanitizedProjName);
            Assert.That(Directory.Exists(Path.Combine(exportedProjDir, "audio")), Is.True);
            foreach (var audioFile in roundTripObj.AudioFiles)
            {
                var path = Path.Combine(exportedProjDir, "audio", ChangeWebmToWav(audioFile));
                Assert.That(File.Exists(path), Is.True, $"No file exists at this path: {path}");
            }
            writingSystemsDir = FileStorage.GenerateWritingsSystemsSubdirPath(exportedProjDir);
            Assert.That(Directory.Exists(writingSystemsDir), Is.True);
            Assert.That(File.Exists(Path.Combine(writingSystemsDir, roundTripObj.Language + ".ldml")), Is.True);
            Assert.That(File.Exists(Path.Combine(exportedProjDir, sanitizedProjName + ".lift")), Is.True);
            Directory.Delete(exportedDirectory, true);

            // Clean up.
            _wordRepo.DeleteAllWords(proj2.Id);
            foreach (var project in new List<Project> { proj1, proj2 })
            {
                _projRepo.Delete(project.Id);
            }
        }

        private sealed class MockLogger : ILogger<LiftController>
        {
#pragma warning disable CS8633
            public IDisposable BeginScope<TState>(TState state)
#pragma warning restore CS8633
            {
                throw new NotImplementedException();
            }

            public bool IsEnabled(LogLevel logLevel)
            {
                return true;
            }

            public void Log<TState>(
                LogLevel logLevel, EventId eventId, TState state, Exception? exception, Func<TState, Exception, string> formatter)
            {
                var message = "";
                if (exception is not null)
                {
                    message = exception.Message;
                }

                Console.WriteLine($"{logLevel}: {eventId} {state} {message}");
            }
        }
    }
}
