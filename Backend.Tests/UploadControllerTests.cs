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

            string header = @"<?xml version=""1.0"" encoding=""UTF-8"" ?>
                <lift producer = ""SIL.FLEx 8.3.12.43172"" version = ""0.13"" >
                <header >
                <ranges >
                <range id = ""semantic-domain-ddp4"" href = ""file://C:/Users/DelaneyS/TheCombine/testingdata/testingdata.lift-ranges"" />
                </ranges >
                <fields >
                <field tag = ""Plural"" >
                <form lang = ""en"" ><text ></text ></form >
                <form lang = ""qaa-x-spec"" ><text > Class = LexEntry; Type = String; WsSelector = kwsVern </text ></form >
                </field >
                </fields >
                </header >";
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

                string entry = $@"<entry dateCreated = {dateCreated} dateModified = {dateModified} id = {id} guid = {guid} >
                    <lexical-unit >
                    <form lang = {vernLang} ><text > {vern} </text ></form >
                    </lexical-unit >
                    <field type = ""Plural"" >
                    <form lang = {vernLang} ><text > {plural} </text ></form >
                    </field >
                    <sense id = {senseId} >
                    <gloss lang = {transLang1} ><text > {trans1} </text ></gloss >
                    <gloss lang = {transLang2} ><text > {trans2} </text ></gloss >
                    <trait name = ""semantic-domain-ddp4"" value = {sdValue} /> 
                    </sense > 
                    </entry >";
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

            FormFile formFile = new FormFile(fstream, 0, fstream.Length, "dave", "sena");
            FileUpload fileUpload = new FileUpload();
            fileUpload.name = "FileName";
            fileUpload.file = formFile;
            var numberofelements = controller.Post(fileUpload).Result;

            var allWords = _wordrepo.GetAllWords();
            Assert.NotZero(allWords.Result.Count);
        }
    }
}