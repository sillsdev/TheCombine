using System;
using System.Collections.Generic;
using System.IO;
using Backend.Tests.Mocks;
using BackendFramework.Controllers;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;

namespace Backend.Tests.Controllers
{
    public class SpeakerControllerTests : IDisposable
    {
        private ISpeakerRepository _speakerRepo = null!;
        private PermissionServiceMock _permissionService = null!;
        private SpeakerController _speakerController = null!;

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (disposing)
            {
                _speakerController?.Dispose();
            }
        }

        private const string ProjId = "proj-id";
        private const string Name = "Madam Name";
        private const string FileName = "sound.mp3"; // file in Backend.Tests/Assets/
        private Speaker _speaker = null!;
        private readonly Stream _stream = File.OpenRead(Path.Combine(Util.AssetsDir, FileName));
        private FormFile _file = null!;

        [SetUp]
        public void Setup()
        {
            _speakerRepo = new SpeakerRepositoryMock();
            _permissionService = new PermissionServiceMock();
            _speakerController = new SpeakerController(_speakerRepo, _permissionService);

            _speaker = _speakerRepo.Create(new Speaker { Name = Name, ProjectId = ProjId }).Result;

            _file = new FormFile(_stream, 0, _stream.Length, "name", FileName)
            {
                Headers = new HeaderDictionary(),
                ContentType = "audio"
            };
        }

        [Test]
        public void TestGetProjectSpeakersUnauthorized()
        {
            _speakerController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = _speakerController.GetProjectSpeakers(ProjId).Result;
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public void TestGetProjectSpeakersProjectSpeakers()
        {
            _ = _speakerRepo.Create(new Speaker { Name = "Sir Other", ProjectId = ProjId }).Result;
            var speakersInRepo = _speakerRepo.GetAllSpeakers(ProjId).Result;

            var result = _speakerController.GetProjectSpeakers(ProjId).Result;
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var value = ((ObjectResult)result).Value;
            Assert.That((List<Speaker>)value!, Has.Count.EqualTo(speakersInRepo.Count));
        }

        [Test]
        public void TestDeleteProjectSpeakersUnauthorized()
        {
            _speakerController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = _speakerController.DeleteProjectSpeakers(ProjId).Result;
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public void TestDeleteProjectSpeakers()
        {
            _ = _speakerRepo.Create(new Speaker { Name = "Sir Other", ProjectId = ProjId }).Result;
            Assert.That(_speakerRepo.GetAllSpeakers(ProjId).Result, Is.Not.Empty);

            var result = _speakerController.DeleteProjectSpeakers(ProjId).Result;
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            Assert.That(_speakerRepo.GetAllSpeakers(ProjId).Result, Is.Empty);
        }

        [Test]
        public void TestGetSpeakerUnauthorized()
        {
            _speakerController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = _speakerController.GetSpeaker(ProjId, _speaker.Id).Result;
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public void TestGetSpeakerNoSpeaker()
        {
            var result = _speakerController.GetSpeaker(ProjId, "other-id").Result;
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public void TestGetSpeakerSpeaker()
        {
            var result = _speakerController.GetSpeaker(ProjId, _speaker.Id).Result;
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var value = ((ObjectResult)result).Value;
            Assert.That(((Speaker)value!).Name, Is.EqualTo(_speaker.Name));
        }

        [Test]
        public void TestCreateSpeakerUnauthorized()
        {
            _speakerController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = _speakerController.CreateSpeaker(ProjId, "Miss Novel").Result;
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public void TestCreateEmptyName()
        {
            var result = _speakerController.CreateSpeaker(ProjId, " \n\t").Result;
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
        }

        [Test]
        public void TestCreateNameTaken()
        {
            var oldCount = _speakerRepo.GetAllSpeakers(ProjId).Result.Count;
            var result = _speakerController.CreateSpeaker(ProjId, $"\n{Name} ").Result;
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
            Assert.That(_speakerRepo.GetAllSpeakers(ProjId).Result, Has.Count.EqualTo(oldCount));
        }

        [Test]
        public void TestCreateSpeaker()
        {
            const string NewName = "Miss Novel";
            var result = _speakerController.CreateSpeaker(ProjId, NewName).Result;
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var speakerId = ((ObjectResult)result).Value as string;
            var speakerInRepo = _speakerRepo.GetSpeaker(ProjId, speakerId!).Result;
            Assert.That(speakerInRepo!.Name, Is.EqualTo(NewName));
        }

        [Test]
        public void TestDeleteSpeakerUnauthorized()
        {
            _speakerController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = _speakerController.DeleteSpeaker(ProjId, _speaker.Id).Result;
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public void TestDeleteSpeakerNoSpeaker()
        {
            var result = _speakerController.DeleteSpeaker(ProjId, "other-id").Result;
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public void TestDeleteSpeaker()
        {
            var result = _speakerController.DeleteSpeaker(ProjId, _speaker.Id).Result;
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            Assert.That(_speakerRepo.GetSpeaker(ProjId, _speaker.Id).Result, Is.Null);
        }

        [Test]
        public void TestRemoveConsentUnauthorized()
        {
            _speakerController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = _speakerController.RemoveConsent(ProjId, _speaker.Id).Result;
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public void TestRemoveConsentNoSpeaker()
        {
            var result = _speakerController.RemoveConsent(ProjId, "other-id").Result;
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public void TestRemoveConsent()
        {
            // Set ConsentType in repo
            _speaker.Consent = ConsentType.Audio;
            _ = _speakerRepo.Update(_speaker.Id, _speaker);
            var consentInRepo = _speakerRepo.GetSpeaker(ProjId, _speaker.Id).Result!.Consent;
            Assert.That(consentInRepo, Is.Not.EqualTo(ConsentType.None));

            // Remove consent
            var result = _speakerController.RemoveConsent(ProjId, _speaker.Id).Result;
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            consentInRepo = _speakerRepo.GetSpeaker(ProjId, _speaker.Id).Result!.Consent;
            Assert.That(consentInRepo, Is.EqualTo(ConsentType.None));

            // Try to remove again
            result = _speakerController.RemoveConsent(ProjId, _speaker.Id).Result;
            Assert.That(((StatusCodeResult)result).StatusCode, Is.EqualTo(StatusCodes.Status304NotModified));
        }

        [Test]
        public void TestUpdateSpeakerNameUnauthorized()
        {
            _speakerController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = _speakerController.UpdateSpeakerName(ProjId, _speaker.Id, "Mr. New").Result;
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public void TestUpdateSpeakerNameNoSpeaker()
        {
            var result = _speakerController.UpdateSpeakerName(ProjId, "other-id", "Mr. New").Result;
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public void TestUpdateSpeakerNameEmptyName()
        {
            var result = _speakerController.UpdateSpeakerName(ProjId, _speaker.Id, " \n\t").Result;
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
        }

        [Test]
        public void TestUpdateSpeakerNameNameTaken()
        {
            var result = _speakerController.UpdateSpeakerName(ProjId, _speaker.Id, $" {Name}\t").Result;
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());

            var idOfNewSpeaker = ((ObjectResult)_speakerController.CreateSpeaker(ProjId, "Ms. Other").Result).Value as string;
            result = _speakerController.UpdateSpeakerName(ProjId, idOfNewSpeaker!, $"\t{Name}\n").Result;
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
        }

        [Test]
        public void TestUpdateSpeakerNameNewName()
        {
            const string NewName = "Mr. New";
            var result = _speakerController.UpdateSpeakerName(ProjId, _speaker.Id, NewName).Result;
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var nameInRepo = _speakerRepo.GetSpeaker(ProjId, _speaker.Id).Result!.Name;
            Assert.That(nameInRepo, Is.EqualTo(NewName));
        }

        [Test]
        public void TestUploadConsentInvalidArguments()
        {
            var result = _speakerController.UploadConsent("invalid/projectId", _speaker.Id, _file).Result;
            Assert.That(result, Is.InstanceOf<UnsupportedMediaTypeResult>());

            result = _speakerController.UploadConsent(ProjId, "invalid/speakerId", _file).Result;
            Assert.That(result, Is.InstanceOf<UnsupportedMediaTypeResult>());
        }

        [Test]
        public void TestUploadConsentUnauthorized()
        {
            _speakerController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = _speakerController.UploadConsent(ProjId, _speaker.Id, _file).Result;
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public void TestUploadConsentNoSpeaker()
        {
            var result = _speakerController.UploadConsent(ProjId, "other", _file).Result;
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public void TestUploadConsentNullFile()
        {
            var result = _speakerController.UploadConsent(ProjId, _speaker.Id, null).Result;
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
        }

        [Test]
        public void TestUploadConsentEmptyFile()
        {
            // Use 0 for the third argument
            _file = new FormFile(_stream, 0, 0, "name", FileName)
            {
                Headers = new HeaderDictionary(),
                ContentType = "audio"
            };
            var result = _speakerController.UploadConsent(ProjId, _speaker.Id, _file).Result;
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
        }

        [Test]
        public void TestUploadConsentInvalidContentType()
        {
            _file.ContentType = "neither audi0 nor 1mage";
            var result = _speakerController.UploadConsent(ProjId, _speaker.Id, _file).Result;
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
        }

        [Test]
        public void TestUploadConsentAddAudioConsent()
        {
            _file.ContentType = "audio/something";
            var result = _speakerController.UploadConsent(ProjId, _speaker.Id, _file).Result;
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var value = (Speaker)((ObjectResult)result).Value!;
            Assert.That(value.Consent, Is.EqualTo(ConsentType.Audio));
            var consentInRepo = _speakerRepo.GetSpeaker(ProjId, _speaker.Id).Result!.Consent;
            Assert.That(consentInRepo, Is.EqualTo(ConsentType.Audio));
        }

        [Test]
        public void TestUploadConsentAddImageConsent()
        {
            _file.ContentType = "image/anything";
            var result = _speakerController.UploadConsent(ProjId, _speaker.Id, _file).Result;
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var value = (Speaker)((ObjectResult)result).Value!;
            Assert.That(value.Consent, Is.EqualTo(ConsentType.Image));
            var consentInRepo = _speakerRepo.GetSpeaker(ProjId, _speaker.Id).Result!.Consent;
            Assert.That(consentInRepo, Is.EqualTo(ConsentType.Image));
        }

        [Test]
        public void TestDownloadConsentInvalidArguments()
        {
            var result = _speakerController.DownloadConsent("invalid/speakerId");
            Assert.That(result, Is.TypeOf<UnsupportedMediaTypeResult>());
        }

        [Test]
        public void TestDownloadSpeakerFileNoFile()
        {
            var result = _speakerController.DownloadConsent("speakerId");
            Assert.That(result, Is.TypeOf<NotFoundObjectResult>());
        }
    }
}
