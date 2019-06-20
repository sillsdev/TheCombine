using Backend.Tests;
using BackendFramework.Controllers;
using BackendFramework.Interfaces;
using BackendFramework.Services;
using BackendFramework.ValueModels;
using NUnit.Framework;
using SIL.Lift.Parsing;
using System.IO;
using Microsoft.AspNetCore.Http.Internal;
using System.Text;
using System;

namespace Tests
{
    public class UploadControllerTests
    {
        IWordRepository _wordrepo;
        ILexiconMerger<LiftObject, LiftEntry, LiftSense, LiftExample> _merger;
        UploadContoller controller;
        

        [SetUp]
        public void Setup()
        {
            _wordrepo = new WordRepositoryMock();
            _merger = new LiftService(_wordrepo);
            controller = new UploadContoller(_merger);
        }

        public void testFile()
        {
            File.Delete("testFile.lift");
            FileStream fs = File.OpenWrite("testFile.lift");

            string header = "<?xml version=\"1.0\" encoding=\"UTF-8\" ?>\n" +
                "<lift producer = \"SIL.FLEx 8.3.12.43172\" version = \"0.13\" >\n" +
                "<header >\n" +
                "<ranges >\n" +
                "<range id = \"semantic-domain-ddp4\" href = \"file://C:/Users/DelaneyS/TheCombine/testingdata/testingdata.lift-ranges\" />\n" +
                "</ranges >\n" +
                "<fields >\n" +
                "<field tag = \"Plural\" >\n" +
                "<form lang = \"en\" ><text ></text ></form >\n" +
                "<form lang = \"qaa-x-spec\" ><text > Class = LexEntry; Type = String; WsSelector = kwsVern </text ></form >\n" +
                "</field >\n" +
                "</fields >\n" +
                "</header >\n";
            byte[] headerArray = Encoding.ASCII.GetBytes(header);

            fs.Write(headerArray);

            for(int i = 0; i <3; i++)
            {
                string dateCreated = "\"" + Convert.ToBase64String(Guid.NewGuid().ToByteArray()).Substring(0, 20) + "\"" ;
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

                string entry = "<entry dateCreated = " + dateCreated + " dateModified = " + dateModified + " id = " + id + " guid = " + guid + " >\n" +
                    "<lexical-unit >\n" +
                    "<form lang = " + vernLang + " ><text > " + vern + " </text ></form >\n" +
                    "</lexical-unit >\n" +
                    "<field type = \"Plural\" >\n" +
                    "<form lang = " + vernLang + " ><text > " + plural + " </text ></form >\n" +
                    "</field >" +
                    "<sense id = " + senseId + " >\n" +
                    "<gloss lang = " + transLang1 + " ><text > " + trans1 + " </text ></gloss >\n" +
                     "<gloss lang = " + transLang2 + " ><text > " + trans2 + " </text ></gloss >\n" +
                    "<trait name = \"semantic-domain-ddp4\" value = " + sdValue + " />\n" +
                    "</sense >\n" +
                    "</entry >\n";
                byte[] entryArray = Encoding.ASCII.GetBytes(entry);
                fs.Write(entryArray);
            }

            byte[] close = Encoding.ASCII.GetBytes("</lift >");
            fs.Write(close);

            fs.Close();
        }

        [Test]
        public void TestLiftImport()
        {
            testFile();
            FileStream fstream = File.OpenRead("testFile.lift");

            FormFile fmfl = new FormFile(fstream, 0, fstream.Length, "dave", "sena");
            FileUpload flupld = new FileUpload(fmfl, "FileName");
            var numberofelements = controller.Post(flupld).Result;

            var allWords = _wordrepo.GetAllWords();
            Assert.NotZero(allWords.Result.Count);
        }
    }
}