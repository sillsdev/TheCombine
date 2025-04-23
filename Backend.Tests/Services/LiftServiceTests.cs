using Backend.Tests.Mocks;
using BackendFramework.Interfaces;
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
        private const string ExportId = "LiftServiceTestsExportId";
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
            _liftService.SetExportInProgress(UserId, ExportId);
            Assert.That(_liftService.IsExportInProgress(UserId), Is.True);
            _liftService.CancelRecentExport(UserId);
            Assert.That(_liftService.IsExportInProgress(UserId), Is.False);
        }

        [Test]
        public void StoreRetrieveDeleteExportTest()
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
        public void StoreOnlyValidExportsTest()
        {
            _liftService.SetExportInProgress(UserId, ExportId);
            _liftService.StoreExport(UserId, FileName, "expiredExportId");
            Assert.That(_liftService.RetrieveExport(UserId), Is.Null);
            _liftService.StoreExport(UserId, FileName, ExportId);
            Assert.That(_liftService.RetrieveExport(UserId), Is.EqualTo(FileName));
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
    }
}
