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
        public void TestRequestEmailVerify()
        {
            _emailVerifyService.SetNextBoolResponse(false);
            var falseResult = _emailVerifyController.RequestEmailVerify(Email).Result;
            Assert.That(((StatusCodeResult)falseResult).StatusCode,
                Is.EqualTo(StatusCodes.Status500InternalServerError));

            _emailVerifyService.SetNextBoolResponse(true);
            var trueResult = _emailVerifyController.RequestEmailVerify(Email).Result;
            Assert.That(trueResult, Is.TypeOf<OkResult>());
        }

        [Test]
        public void TestValidateResetToken()
        {
            // No permissions should be required to validate a password reset token.
            _emailVerifyController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            _emailVerifyService.SetNextBoolResponse(false);
            var falseResult = _emailVerifyController.ValidateEmailToken("token").Result;
            Assert.That(falseResult, Is.TypeOf<OkObjectResult>());
            Assert.That(((OkObjectResult)falseResult).Value, Is.EqualTo(false));

            _emailVerifyService.SetNextBoolResponse(true);
            var trueResult = _emailVerifyController.ValidateEmailToken("token").Result;
            Assert.That(trueResult, Is.TypeOf<OkObjectResult>());
            Assert.That(((OkObjectResult)trueResult).Value, Is.EqualTo(true));
        }
    }
}
