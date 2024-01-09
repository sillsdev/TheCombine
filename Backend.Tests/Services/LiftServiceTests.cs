using System.Collections.Generic;
using System.IO;
using Backend.Tests.Mocks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Services;
using NUnit.Framework;

namespace Backend.Tests.Services
{
    public class LiftServiceTests
    {
        private ISemanticDomainRepository _semDomRepo = null!;
        private ISpeakerRepository _speakerRepo = null!;
        private ILiftService _liftService = null!;

        private const string FileName = "file.lift-ranges";
        private const string ProjId = "LiftServiceTestsProjId";
        private const string UserId = "LiftServiceTestsUserId";

        [SetUp]
        public void Setup()
        {
            _semDomRepo = new SemanticDomainRepositoryMock();
            _speakerRepo = new SpeakerRepositoryMock();
            _liftService = new LiftService(_semDomRepo, _speakerRepo);
        }

        [Test]
        public void ExportInProgressTest()
        {
            Assert.That(_liftService.IsExportInProgress(UserId), Is.False);
            _liftService.SetExportInProgress(UserId, true);
            Assert.That(_liftService.IsExportInProgress(UserId), Is.True);
            _liftService.SetExportInProgress(UserId, false);
            Assert.That(_liftService.IsExportInProgress(UserId), Is.False);
        }

        [Test]
        public void StoreRetrieveDeleteExportTest()
        {
            Assert.That(_liftService.RetrieveExport(UserId), Is.Null);
            Assert.That(_liftService.DeleteExport(UserId), Is.False);

            _liftService.SetExportInProgress(UserId, true);
            Assert.That(_liftService.RetrieveExport(UserId), Is.Null);
            Assert.That(_liftService.DeleteExport(UserId), Is.True);
            Assert.That(_liftService.DeleteExport(UserId), Is.False);

            _liftService.StoreExport(UserId, FileName);
            Assert.That(_liftService.RetrieveExport(UserId), Is.EqualTo(FileName));
            Assert.That(_liftService.DeleteExport(UserId), Is.True);
            Assert.That(_liftService.RetrieveExport(UserId), Is.Null);
        }

        [Test]
        public void StoreRetrieveDeleteImportTest()
        {
            Assert.That(_liftService.RetrieveImport(UserId), Is.Null);
            Assert.That(_liftService.DeleteImport(UserId), Is.False);

            _liftService.StoreImport(UserId, FileName);
            Assert.That(_liftService.RetrieveImport(UserId), Is.EqualTo(FileName));
            Assert.That(_liftService.DeleteImport(UserId), Is.True);
            Assert.That(_liftService.RetrieveImport(UserId), Is.Null);
        }

        [Test]
        public void CreateLiftRangesTest()
        {
            List<SemanticDomain> frDoms = new() { new() { Lang = "fr" }, new() };
            List<SemanticDomain> ptDoms = new() { new(), new() { Lang = "pt" } };
            List<SemanticDomain> zzDoms = new() { new() { Lang = "zz" } };
            List<Word> projWords = new()
            {
                // First semantic domain of the second sense of a word
                new() { Senses = new() { new(), new() { SemanticDomains = frDoms } } },
                // Second semantic domain of the first sense of a word
                new() { Senses = new() { new() { SemanticDomains = ptDoms }, new() } },
                // Semantic domain with unsupported language
                new() { Senses = new() { new() { SemanticDomains = zzDoms } } }
            };

            ((SemanticDomainRepositoryMock)_semDomRepo).SetValidLangs(new() { "en", "fr", "pt" });
            var langs = _liftService.CreateLiftRanges(projWords, new(), FileName).Result;
            Assert.That(langs, Has.Count.EqualTo(2));
            Assert.That(langs, Does.Contain("fr"));
            Assert.That(langs, Does.Contain("pt"));

            var liftRangesText = File.ReadAllText(FileName);
            Assert.That(liftRangesText, Does.Not.Contain("\"en\""));
            Assert.That(liftRangesText, Does.Contain("\"fr\""));
            Assert.That(liftRangesText, Does.Contain("\"pt\""));
            Assert.That(liftRangesText, Does.Not.Contain("\"zz\""));
        }
    }
}
