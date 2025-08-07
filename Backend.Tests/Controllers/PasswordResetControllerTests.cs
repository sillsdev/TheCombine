using System;
using Backend.Tests.Mocks;
using BackendFramework.Controllers;
using BackendFramework.Interfaces;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;

namespace Backend.Tests.Controllers
{
    public class PasswordResetControllerTests : IDisposable
    {
        private IUserRepository _userRepo = null!;
        private IPasswordResetService _passwordResetService = null!;
        private PasswordResetController _passwordResetController = null!;

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (disposing)
            {
                _passwordResetController?.Dispose();
            }
        }

        [SetUp]
        public void Setup()
        {
            _userRepo = new UserRepositoryMock();
            _passwordResetService = new PasswordResetServiceMock();
            _passwordResetController = new PasswordResetController(_userRepo, new EmailServiceMock(), _passwordResetService);
        }

        [Test]
        public void TestResetPasswordRequest()
        {
            // No permissions should be required to request a password reset.
            _passwordResetController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            // Returns Ok regardless of if user exists.
            var noUserResult = _passwordResetController.ResetPasswordRequest("fake-username").Result;
            Assert.That(noUserResult, Is.TypeOf<OkResult>());

            var username = _userRepo.Create(new() { Username = "Imarealboy" }).Result!.Username;
            var yesUserResult = _passwordResetController.ResetPasswordRequest(username).Result;
            Assert.That(yesUserResult, Is.TypeOf<OkResult>());
        }

        [Test]
        public void TestValidateResetToken()
        {
            // No permissions should be required to validate a password reset token.
            _passwordResetController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            ((PasswordResetServiceMock)_passwordResetService).SetNextBoolResponse(false);
            var falseResult = _passwordResetController.ValidateResetToken("token").Result;
            Assert.That(falseResult, Is.TypeOf<OkObjectResult>());
            Assert.That(((OkObjectResult)falseResult).Value, Is.EqualTo(false));

            ((PasswordResetServiceMock)_passwordResetService).SetNextBoolResponse(true);
            var trueResult = _passwordResetController.ValidateResetToken("token").Result;
            Assert.That(trueResult, Is.TypeOf<OkObjectResult>());
            Assert.That(((OkObjectResult)trueResult).Value, Is.EqualTo(true));
        }

        [Test]
        public void TestResetPassword()
        {
            // No permissions should be required to reset password via a token.
            _passwordResetController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            ((PasswordResetServiceMock)_passwordResetService).SetNextBoolResponse(false);
            var falseResult = _passwordResetController.ResetPassword(new()).Result;
            Assert.That(falseResult, Is.TypeOf<ForbidResult>());

            ((PasswordResetServiceMock)_passwordResetService).SetNextBoolResponse(true);
            var trueResult = _passwordResetController.ResetPassword(new()).Result;
            Assert.That(trueResult, Is.TypeOf<OkResult>());
        }
    }
}
