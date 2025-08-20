using System;
using Backend.Tests.Mocks;
using BackendFramework.Controllers;
using BackendFramework.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;

namespace Backend.Tests.Controllers
{
    internal sealed class EmailVerifyControllerTests : IDisposable
    {
        private EmailVerifyServiceMock _emailVerifyService = null!;
        private IPermissionService _permissionService = null!;
        private EmailVerifyController _emailVerifyController = null!;

        private const string Email = "test@e.mail";

        public void Dispose()
        {
            _emailVerifyController?.Dispose();
            GC.SuppressFinalize(this);
        }

        [SetUp]
        public void Setup()
        {
            var userRepo = new UserRepositoryMock();
            _emailVerifyService = new EmailVerifyServiceMock();
            _permissionService = new PermissionServiceMock();
            _emailVerifyController = new EmailVerifyController(userRepo, _emailVerifyService, _permissionService);

            userRepo.Create(new() { Email = Email });
        }

        [Test]
        public void TestRequestEmailVerifyNoUser()
        {
            var result = _emailVerifyController.RequestEmailVerify("email_of@no.user").Result;
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public void TestRequestEmailVerifyNoPermission()
        {
            _emailVerifyController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            var result = _emailVerifyController.RequestEmailVerify(Email).Result;
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public void TestRequestEmailVerifyFalse()
        {
            _emailVerifyService.SetNextBoolResponse(false);
            var result = _emailVerifyController.RequestEmailVerify(Email).Result;
            Assert.That(((StatusCodeResult)result).StatusCode, Is.EqualTo(StatusCodes.Status500InternalServerError));
        }

        [Test]
        public void TestRequestEmailVerifyTrue()
        {
            _emailVerifyService.SetNextBoolResponse(true);
            var result = _emailVerifyController.RequestEmailVerify(Email).Result;
            Assert.That(result, Is.TypeOf<OkResult>());
        }

        [Test]
        public void TestValidateResetTokenFalse()
        {
            // No permissions should be required to validate a password reset token.
            _emailVerifyController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            _emailVerifyService.SetNextBoolResponse(false);
            var result = _emailVerifyController.ValidateEmailToken("token").Result;
            Assert.That(result, Is.TypeOf<OkObjectResult>());
            Assert.That(((OkObjectResult)result).Value, Is.EqualTo(false));
        }

        [Test]
        public void TestValidateResetTokenTrue()
        {
            // No permissions should be required to validate a password reset token.
            _emailVerifyController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            _emailVerifyService.SetNextBoolResponse(true);
            var result = _emailVerifyController.ValidateEmailToken("token").Result;
            Assert.That(result, Is.TypeOf<OkObjectResult>());
            Assert.That(((OkObjectResult)result).Value, Is.EqualTo(true));
        }
    }
}
