using BackendFramework.Controllers;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Http.Internal;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;

namespace Backend.Tests
{
    public class LiftControllerTests
    {
        private IWordRepository _wordrepo;
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

        private FileUpload InitFile(FileStream fstream, string filename)
        {
            FormFile formFile = new FormFile(fstream, 0, fstream.Length, "name", filename);
            FileUpload fileUpload = new FileUpload();
            fileUpload.Name = "FileName";
            fileUpload.File = formFile;

            return fileUpload;
        }

        class RoundTipObj
        {
            public string language { get; set; }
            public List<string> audioFiles { get; set; }
            public int numOfWords { get; set; }

            public RoundTipObj(string lang, List<string> audio, int words)
            {
                language = lang;
                audioFiles = audio;
                numOfWords = words;
            }
        }

        [Test]
        public void TestRoundtrip()
        {
            /*
             * This test assumes you have the starting .zip included in your project files.
             */

            //get path to the starting dir
            string pathToStartZips = Path.Combine(Directory.GetParent(Directory.GetParent(Directory.GetParent(Environment.CurrentDirectory).ToString()).ToString()).ToString(), "Assets");
            var testZips = Directory.GetFiles(pathToStartZips, "*.zip");

            Dictionary<string, RoundTipObj> fileMapping = new Dictionary<string, RoundTipObj>();

            /*
             * Add new .zip file information here
             */
            RoundTipObj Gusillaay = new RoundTipObj("gsl-Qaaa-x-orth", new List<string>(), 8045 /*number of words*/);
            fileMapping.Add("Gusillaay.zip", Gusillaay);
            RoundTipObj Lotad = new RoundTipObj("dtr", new List<string>(), 5400);
            fileMapping.Add("Lotad.zip", Lotad);
            RoundTipObj Natqgu = new RoundTipObj("qaa-x-stc-natqgu", new List<string>(), 11570 /*number of words*/);
            fileMapping.Add("Natqgu.zip", Natqgu);
            RoundTipObj Resembli = new RoundTipObj("ags", new List<string>(), 255 /*number of words*/);
            fileMapping.Add("Resembli.zip", Resembli);
            RoundTipObj RWC = new RoundTipObj("es", new List<string>(), 132 /*number of words*/);
            fileMapping.Add("RWC.zip", RWC);
            RoundTipObj Sena = new RoundTipObj("seh", new List<string>(), 1462 /*number of words*/);
            fileMapping.Add("Sena.zip", Sena);
            RoundTipObj SingleEntryLiftWithSound = new RoundTipObj("ptn", new List<string> { "short.mp3" }, 1 /*number of words*/);
            fileMapping.Add("SingleEntryLiftWithSound.zip", SingleEntryLiftWithSound);
            RoundTipObj SingleEntryLiftWithTwoSound = new RoundTipObj("ptn", new List<string> { "short.mp3", "short1.mp3" }, 1 /*number of words*/);
            fileMapping.Add("SingleEntryLiftWithTwoSound.zip", SingleEntryLiftWithTwoSound);

            foreach (var dataSet in fileMapping)
            {
                string actualFilename = dataSet.Key;

                var pathToStartZip = Path.Combine(pathToStartZips, actualFilename);

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
                if (result is BadRequestObjectResult)
                {
                    Assert.That("The file was empty" != null);
                }

                proj = _projServ.GetProject(proj.Id).Result;

                Assert.AreEqual(proj.VernacularWritingSystem, dataSet.Value.language);

                fstream.Close();

                var allWords = _wordrepo.GetAllWords(proj.Id);
                Assert.AreEqual(allWords.Result.Count, dataSet.Value.numOfWords);

                //export
                string exportedFilepath = (_liftController.ExportLiftFile(proj.Id).Result as ObjectResult).Value as string;

                //Assert the file was created with desired heirarchy
                Assert.That(Directory.Exists(exportedFilepath));
                Assert.That(Directory.Exists(Path.Combine(exportedFilepath, "LiftExport", "Lift", "Audio")));
                foreach (var audioFile in dataSet.Value.audioFiles)
                {
                    Assert.That(File.Exists(Path.Combine(exportedFilepath, "LiftExport", "Lift", "Audio", audioFile)));
                }
                Assert.That(Directory.Exists(Path.Combine(exportedFilepath, "LiftExport", "Lift", "WritingSystems")));
                Assert.That(File.Exists(Path.Combine(exportedFilepath, "LiftExport", "Lift", "WritingSystems", dataSet.Value.language + ".ldml")));
                Assert.That(File.Exists(Path.Combine(exportedFilepath, "LiftExport", "Lift", "NewLiftFile.lift")));
                List<string> dirlst = new List<string>(Directory.GetDirectories(Path.GetDirectoryName(exportedFilepath)));
                dirlst.Remove(exportedFilepath);
                Assert.That(Directory.Exists(Path.Combine(Path.GetDirectoryName(exportedFilepath), dirlst.Single())));


                _wordrepo.DeleteAllWords(proj.Id);

                BackendFramework.Helper.Utilities util = new BackendFramework.Helper.Utilities();
                pathToStartZip = util.GenerateFilePath(BackendFramework.Helper.Utilities.Filetype.zip, true, "", Path.Combine(proj.Id, "Export", "LiftExportCompressed-" + proj.Id));
                pathToStartZip += ".zip";
                //upload the exported words again
                //init the project the .zip info is added to 
                var proj2 = RandomProject();
                _projServ.Create(proj2);

                //generate api perameter with filestream
                fstream = File.OpenRead(pathToStartZip);
                fileUpload = InitFile(fstream, actualFilename);

                //make api call
                var result2 = _liftController.UploadLiftFile(proj2.Id, fileUpload).Result;
                if (result2 is BadRequestObjectResult)
                {
                    Assert.That("The file was empty" != null);
                }

                proj2 = _projServ.GetProject(proj2.Id).Result;

                Assert.AreEqual(proj2.VernacularWritingSystem, dataSet.Value.language);

                fstream.Close();

                allWords = _wordrepo.GetAllWords(proj2.Id);
                Assert.AreEqual(allWords.Result.Count, dataSet.Value.numOfWords);

                //export
                exportedFilepath = (_liftController.ExportLiftFile(proj2.Id).Result as ObjectResult).Value as string;

                //Assert the file was created with desired heirarchy
                Assert.That(Directory.Exists(exportedFilepath));
                Assert.That(Directory.Exists(Path.Combine(exportedFilepath, "LiftExport", "Lift", "Audio")));
                foreach (var audioFile in dataSet.Value.audioFiles)
                {
                    var path = Path.Combine(exportedFilepath, "LiftExport", "Lift", "Audio", audioFile);
                    Assert.That(File.Exists(path), "The file " + audioFile + " can not be found at this path: " + path));
                }
                Assert.That(Directory.Exists(Path.Combine(exportedFilepath, "LiftExport", "Lift", "WritingSystems")));
                Assert.That(File.Exists(Path.Combine(exportedFilepath, "LiftExport", "Lift", "WritingSystems", dataSet.Value.language + ".ldml")));
                Assert.That(File.Exists(Path.Combine(exportedFilepath, "LiftExport", "Lift", "NewLiftFile.lift")));
                dirlst = new List<string>(Directory.GetDirectories(Path.GetDirectoryName(exportedFilepath)));
                dirlst.Remove(exportedFilepath);
                Assert.That(Directory.Exists(Path.Combine(Path.GetDirectoryName(exportedFilepath), dirlst.Single())));

                _wordrepo.DeleteAllWords(proj.Id);
            }
        }
    }
}
