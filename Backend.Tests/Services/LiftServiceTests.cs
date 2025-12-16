using System;
using Backend.Tests.Mocks;
using BackendFramework.Interfaces;
using BackendFramework.Services;
using NUnit.Framework;

namespace Backend.Tests.Services
{
    internal sealed class LiftServiceTests : IDisposable
    {
        private ISemanticDomainRepository _semDomRepo = null!;
        private ISpeakerRepository _speakerRepo = null!;
        private ILiftService _liftService = null!;

        private const string FileName = "file.lift-ranges";
        private const string ExportId = "LiftServiceTestsExportId";
        private const string UserId = "LiftServiceTestsUserId";

        public void Dispose()
        {
            _liftService?.Dispose();
            GC.SuppressFinalize(this);
        }

        [SetUp]
        public void Setup()
        {
            _semDomRepo = new SemanticDomainRepositoryMock();
            _speakerRepo = new SpeakerRepositoryMock();
            var wordRepo = new WordRepositoryMock();
            var countRepo = new SemanticDomainCountRepositoryMock();
            var countService = new SemanticDomainCountService(countRepo, wordRepo);
            _liftService = new LiftService(_semDomRepo, _speakerRepo, countService);
        }

        [Test]
        public void TestExportInProgress()
        {
            Assert.That(_liftService.IsExportInProgress(UserId), Is.False);
            _liftService.SetExportInProgress(UserId, ExportId);
            Assert.That(_liftService.IsExportInProgress(UserId), Is.True);
            _liftService.CancelRecentExport(UserId);
            Assert.That(_liftService.IsExportInProgress(UserId), Is.False);
        }

        [Test]
        public void TestStoreRetrieveDeleteExport()
        {
            Assert.That(_liftService.RetrieveExport(UserId), Is.Null);
            Assert.That(_liftService.DeleteExport(UserId), Is.False);

            _liftService.SetExportInProgress(UserId, ExportId);
            Assert.That(_liftService.RetrieveExport(UserId), Is.Null);
            Assert.That(_liftService.DeleteExport(UserId), Is.True);
            Assert.That(_liftService.DeleteExport(UserId), Is.False);

            _liftService.SetExportInProgress(UserId, ExportId);
            _liftService.StoreExport(UserId, FileName, ExportId);
            Assert.That(_liftService.RetrieveExport(UserId), Is.EqualTo(FileName));
            Assert.That(_liftService.DeleteExport(UserId), Is.True);
            Assert.That(_liftService.RetrieveExport(UserId), Is.Null);
        }

        [Test]
        public void TestStoreOnlyValidExports()
        {
            _liftService.SetExportInProgress(UserId, ExportId);
            _liftService.StoreExport(UserId, FileName, "expiredExportId");
            Assert.That(_liftService.RetrieveExport(UserId), Is.Null);
            _liftService.StoreExport(UserId, FileName, ExportId);
            Assert.That(_liftService.RetrieveExport(UserId), Is.EqualTo(FileName));
        }

        [Test]
        public void TestStoreRetrieveDeleteImport()
        {
            Assert.That(_liftService.RetrieveImport(UserId), Is.Null);
            Assert.That(_liftService.DeleteImport(UserId), Is.False);

            _liftService.StoreImport(UserId, FileName);
            Assert.That(_liftService.RetrieveImport(UserId), Is.EqualTo(FileName));
            Assert.That(_liftService.DeleteImport(UserId), Is.True);
            Assert.That(_liftService.RetrieveImport(UserId), Is.Null);
        }
    }
}
