using System;
using Backend.Tests.Mocks;
using BackendFramework.Controllers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;

namespace Backend.Tests.Controllers
{
    internal sealed class PasswordResetControllerTests : IDisposable
    {
        private PasswordResetServiceMock _passwordResetService = null!;
        private PasswordResetController _passwordResetController = null!;

        public void Dispose()
        {
            _passwordResetController?.Dispose();
            GC.SuppressFinalize(this);
        }

        [SetUp]
        public void Setup()
        {
            _passwordResetService = new PasswordResetServiceMock();
            _passwordResetController = new PasswordResetController(_passwordResetService);
        }

        [Test]
        public void TestResetPassword()
        {
            // No permissions should be required to reset password via a token.
            _passwordResetController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            _passwordResetService.SetNextBoolResponse(false);
            var falseResult = _passwordResetController.ResetPassword(new()).Result;
            Assert.That(falseResult, Is.TypeOf<ForbidResult>());

            _passwordResetService.SetNextBoolResponse(true);
            var trueResult = _passwordResetController.ResetPassword(new()).Result;
            Assert.That(trueResult, Is.TypeOf<OkResult>());
        }

        [Test]
        public void TestResetPasswordRequest()
        {
            // No permissions should be required to request a password reset.
            _passwordResetController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            _passwordResetService.SetNextBoolResponse(false);
            var falseResult = _passwordResetController.ResetPasswordRequest("username").Result;
            Assert.That(((StatusCodeResult)falseResult).StatusCode, Is.EqualTo(StatusCodes.Status500InternalServerError));

            _passwordResetService.SetNextBoolResponse(true);
            var trueResult = _passwordResetController.ResetPasswordRequest("username").Result;
            Assert.That(trueResult, Is.TypeOf<OkResult>());
        }

        [Test]
        public void TestValidateResetToken()
        {
            // No permissions should be required to validate a password reset token.
            _passwordResetController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            _passwordResetService.SetNextBoolResponse(false);
            var falseResult = _passwordResetController.ValidateResetToken("token").Result;
            Assert.That(falseResult, Is.TypeOf<OkObjectResult>());
            Assert.That(((OkObjectResult)falseResult).Value, Is.EqualTo(false));

            _passwordResetService.SetNextBoolResponse(true);
            var trueResult = _passwordResetController.ValidateResetToken("token").Result;
            Assert.That(trueResult, Is.TypeOf<OkObjectResult>());
            Assert.That(((OkObjectResult)trueResult).Value, Is.EqualTo(true));
        }
    }
}
