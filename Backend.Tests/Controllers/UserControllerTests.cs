using System;
using System.Collections.Generic;
using Backend.Tests.Mocks;
using BackendFramework.Controllers;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;

namespace Backend.Tests.Controllers
{
    public class UserControllerTests : IDisposable
    {
        private IUserRepository _userRepo = null!;
        private IEmailVerifyService _emailVerifyService = null!;
        private IPasswordResetService _passwordResetService = null!;
        private IPermissionService _permissionService = null!;
        private UserController _userController = null!;

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (disposing)
            {
                _userController?.Dispose();
            }
        }

        [SetUp]
        public void Setup()
        {
            _userRepo = new UserRepositoryMock();
            _emailVerifyService = new EmailVerifyServiceMock();
            _passwordResetService = new PasswordResetServiceMock();
            _permissionService = new PermissionServiceMock(_userRepo);
            _userController = new UserController(_userRepo, _permissionService,
                new CaptchaServiceMock(), new EmailServiceMock(), _emailVerifyService, _passwordResetService);
        }

        private static User RandomUser()
        {
            var user = new User
            {
                Username = Util.RandString(10),
                Password = Util.RandString(10),
                Email = $"{Util.RandString(5)}@{Util.RandString(5)}.com",
            };
            return user;
        }

        [Test]
        public void TestVerifyCaptchaToken()
        {
            // No permissions should be required to verify CAPTCHA.
            _userController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            var result = _userController.VerifyCaptchaToken("token").Result;
            Assert.That(result, Is.TypeOf<OkResult>());
        }

        [Test]
        public void TestVerifyEmailRequestNoUser()
        {
            var result = _userController.VerifyEmailRequest(new() { EmailOrUsername = "email" }).Result;
            Assert.That(result, Is.TypeOf<ForbidResult>());
        }

        [Test]
        public void TestVerifyEmailRequestNoPermission()
        {
            _userController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var user = _userRepo.Create(new() { Email = "e@mail" }).Result;
            var result = _userController.VerifyEmailRequest(new() { EmailOrUsername = user!.Email }).Result;
            Assert.That(result, Is.TypeOf<ForbidResult>());
        }

        [Test]
        public void TestVerifyEmailRequest()
        {
            var user = _userRepo.Create(new() { Email = "e@mail" }).Result;
            var result = _userController.VerifyEmailRequest(new() { EmailOrUsername = user!.Email }).Result;
            Assert.That(result, Is.TypeOf<OkResult>());
        }

        [Test]
        public void TestVerifyEmail()
        {
            // No permissions should be required to verify email via a token.
            _userController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            ((EmailVerifyServiceMock)_emailVerifyService).SetNextBoolResponse(false);
            var falseResult = _userController.VerifyEmail("token").Result;
            Assert.That(falseResult, Is.TypeOf<OkObjectResult>());
            Assert.That(((OkObjectResult)falseResult).Value, Is.EqualTo(false));

            ((EmailVerifyServiceMock)_emailVerifyService).SetNextBoolResponse(true);
            var trueResult = _userController.VerifyEmail("token").Result;
            Assert.That(trueResult, Is.TypeOf<OkObjectResult>());
            Assert.That(((OkObjectResult)trueResult).Value, Is.EqualTo(true));
        }

        [Test]
        public void TestResetPasswordRequest()
        {
            // No permissions should be required to request a password reset.
            _userController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            // Returns Ok regardless of if user exists.
            var noUserResult = _userController.ResetPasswordRequest(new()).Result;
            Assert.That(noUserResult, Is.TypeOf<OkResult>());
            var username = _userRepo.Create(new() { Username = "Imarealboy" }).Result!.Username;
            var yesUserResult = _userController.ResetPasswordRequest(new() { EmailOrUsername = username }).Result;
            Assert.That(yesUserResult, Is.TypeOf<OkResult>());
        }

        [Test]
        public void TestValidateResetToken()
        {
            // No permissions should be required to validate a password reset token.
            _userController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            ((PasswordResetServiceMock)_passwordResetService).SetNextBoolResponse(false);
            var falseResult = _userController.ValidateResetToken("token").Result;
            Assert.That(falseResult, Is.TypeOf<OkObjectResult>());
            Assert.That(((OkObjectResult)falseResult).Value, Is.EqualTo(false));

            ((PasswordResetServiceMock)_passwordResetService).SetNextBoolResponse(true);
            var trueResult = _userController.ValidateResetToken("token").Result;
            Assert.That(trueResult, Is.TypeOf<OkObjectResult>());
            Assert.That(((OkObjectResult)trueResult).Value, Is.EqualTo(true));
        }

        [Test]
        public void TestResetPassword()
        {
            // No permissions should be required to reset password via a token.
            _userController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();

            ((PasswordResetServiceMock)_passwordResetService).SetNextBoolResponse(false);
            var falseResult = _userController.ResetPassword(new()).Result;
            Assert.That(falseResult, Is.TypeOf<ForbidResult>());

            ((PasswordResetServiceMock)_passwordResetService).SetNextBoolResponse(true);
            var trueResult = _userController.ResetPassword(new()).Result;
            Assert.That(trueResult, Is.TypeOf<OkResult>());
        }

        [Test]
        public void TestGetAllUsers()
        {
            _userRepo.Create(RandomUser());
            _userRepo.Create(RandomUser());
            _userRepo.Create(RandomUser());

            var users = ((ObjectResult)_userController.GetAllUsers().Result).Value as List<User>;
            Assert.That(users, Has.Count.EqualTo(3));
            _userRepo.GetAllUsers().Result.ForEach(
                user => Assert.That(users, Does.Contain(user).UsingPropertiesComparer()));
        }

        [Test]
        public void TestGetAllUsersNoPermission()
        {
            _userController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = _userController.GetAllUsers().Result;
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public void TestAuthenticateBadCredentials()
        {
            _userController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = _userController.Authenticate(new() { EmailOrUsername = "no", Password = "no" }).Result;
            Assert.That(result, Is.InstanceOf<UnauthorizedObjectResult>());
        }

        [Test]
        public void TestGetCurrentUserNoneAuthenticated()
        {
            var result = _userController.GetCurrentUser().Result;
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public void TestGetUserNoPermission()
        {
            _userController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = _userController.GetUser("any-user").Result;
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public void TestGetUser()
        {
            var user = _userRepo.Create(RandomUser()).Result ?? throw new UserCreationException();

            _userRepo.Create(RandomUser());
            _userRepo.Create(RandomUser());

            var result = _userController.GetUser(user.Id).Result;
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            Assert.That(((ObjectResult)result).Value, Is.EqualTo(new UserStub(user)).UsingPropertiesComparer());
        }

        [Test]
        public void TestGetUserMissingUser()
        {
            var result = _userController.GetUser("INVALID_USER_ID").Result;
            Assert.That(result, Is.InstanceOf<NotFoundResult>());
        }

        [Test]
        public void TestGetUserIdByEmailOrUsernameWithEmail()
        {
            const string email = "example@gmail.com";
            var user = _userRepo.Create(
                new User { Email = email, Username = Util.RandString(10), Password = Util.RandString(10) }
            ).Result ?? throw new UserCreationException();

            var result = _userController.GetUserIdByEmailOrUsername(email).Result;
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            Assert.That(((ObjectResult)result).Value, Is.EqualTo(user.Id));
        }

        [Test]
        public void TestGetUserIdByEmailOrUsernameWithUsername()
        {
            const string username = "example-name";
            var user = _userRepo.Create(
                new User { Username = username, Password = Util.RandString(10) }
            ).Result ?? throw new UserCreationException();

            var result = _userController.GetUserIdByEmailOrUsername(username).Result;
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            Assert.That(((ObjectResult)result).Value, Is.EqualTo(user.Id));
        }

        [Test]
        public void TestGetUserIdByEmailOrUsernameMissing()
        {
            var result = _userController.GetUserIdByEmailOrUsername("INVALID_EMAIL@gmail.com").Result;
            Assert.That(result, Is.InstanceOf<NotFoundResult>());
        }

        [Test]
        public void TestGetUserIdByEmailOrUsernameNoPermission()
        {
            _userController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            const string email = "example@gmail.com";
            _ = _userRepo.Create(
                new User { Email = email, Username = Util.RandString(10), Password = Util.RandString(10) }
            ).Result ?? throw new UserCreationException();

            var result = _userController.GetUserIdByEmailOrUsername(email).Result;
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public void TestCreateUser()
        {
            var user = RandomUser();
            var id = (string)((ObjectResult)_userController.CreateUser(user).Result).Value!;
            user.Id = id;
            Assert.That(_userRepo.GetAllUsers().Result, Does.Contain(user).UsingPropertiesComparer());
        }

        [Test]
        public void TestCreateUserBadUsername()
        {
            var user = RandomUser();
            _userRepo.Create(user);

            var user2 = RandomUser();
            user2.Username = " ";
            Assert.That(_userController.CreateUser(user2).Result, Is.TypeOf<BadRequestObjectResult>());
            user2.Username = user.Username;
            Assert.That(_userController.CreateUser(user2).Result, Is.TypeOf<BadRequestObjectResult>());
            user2.Username = user.Email;
            Assert.That(_userController.CreateUser(user2).Result, Is.TypeOf<BadRequestObjectResult>());
        }

        [Test]
        public void TestCreateUserBadEmail()
        {
            var user = RandomUser();
            _userRepo.Create(user);

            var user2 = RandomUser();
            user2.Email = " ";
            Assert.That(_userController.CreateUser(user2).Result, Is.TypeOf<BadRequestObjectResult>());
            user2.Email = user.Email;
            Assert.That(_userController.CreateUser(user2).Result, Is.TypeOf<BadRequestObjectResult>());
            user2.Email = user.Username;
            Assert.That(_userController.CreateUser(user2).Result, Is.TypeOf<BadRequestObjectResult>());
        }

        [Test]
        public void TestUpdateUser()
        {
            var origUser = _userRepo.Create(RandomUser()).Result ?? throw new UserCreationException();
            var modUser = origUser.Clone();
            modUser.Username = "Mark";

            _ = _userController.UpdateUser(modUser.Id, modUser);

            var users = _userRepo.GetAllUsers().Result;
            Assert.That(users, Has.Count.EqualTo(1));
            Assert.That(users, Does.Contain(modUser).UsingPropertiesComparer());
        }

        [Test]
        public void TestUpdateUserCantUpdateIsAdmin()
        {
            var origUser = _userRepo.Create(RandomUser()).Result ?? throw new UserCreationException();
            var modUser = origUser.Clone() ?? throw new UserCreationException();
            modUser.IsAdmin = true;

            _ = _userController.UpdateUser(modUser.Id, modUser);

            var users = _userRepo.GetAllUsers().Result;
            Assert.That(users, Has.Count.EqualTo(1));
            Assert.That(users, Does.Contain(modUser).UsingPropertiesComparer());
        }

        [Test]
        public void TestUpdateUserNoPermission()
        {
            _userController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = _userController.UpdateUser("any-user", new()).Result;
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public void TestDeleteUser()
        {
            var origUser = _userRepo.Create(RandomUser()).Result ?? throw new UserCreationException();
            Assert.That(_userRepo.GetAllUsers().Result, Has.Count.EqualTo(1));

            _ = _userController.DeleteUser(origUser.Id).Result;
            Assert.That(_userRepo.GetAllUsers().Result, Is.Empty);
        }

        [Test]
        public void TestDeleteUserNoUser()
        {
            var result = _userController.DeleteUser("not-a-user").Result;
            Assert.That(result, Is.InstanceOf<NotFoundResult>());
        }

        [Test]
        public void TestDeleteUserNoPermission()
        {
            _userController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = _userController.DeleteUser("anything").Result;
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public void TestIsEmailOrUsernameAvailable()
        {
            var user1 = RandomUser();
            var user2 = RandomUser();
            var email1 = user1.Email;
            var email2 = user2.Email;
            _userRepo.Create(user1);
            _userRepo.Create(user2);

            var result1 = (ObjectResult)_userController.IsEmailOrUsernameAvailable(email1.ToLowerInvariant()).Result;
            Assert.That(result1.Value, Is.False);

            var result2 = (ObjectResult)_userController.IsEmailOrUsernameAvailable(email2.ToUpperInvariant()).Result;
            Assert.That(result2.Value, Is.False);

            var result3 = (ObjectResult)_userController.IsEmailOrUsernameAvailable(email1).Result;
            Assert.That(result3.Value, Is.False);

            var result4 = (ObjectResult)_userController.IsEmailOrUsernameAvailable("new@e.mail").Result;
            Assert.That(result4.Value, Is.True);

            var result5 = (ObjectResult)_userController.IsEmailOrUsernameAvailable("").Result;
            Assert.That(result5.Value, Is.False);
        }

        [Test]
        public void TestIsUserSiteAdminNoPermission()
        {
            _userController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = _userController.IsUserSiteAdmin().Result;
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            Assert.That(((ObjectResult)result).Value, Is.False);
        }
    }
}
