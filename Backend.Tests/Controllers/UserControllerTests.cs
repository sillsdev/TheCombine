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
    internal sealed class UserControllerTests : IDisposable
    {
        private IUserRepository _userRepo = null!;
        private IUserRoleRepository _userRoleRepo = null!;
        private IUserEditRepository _userEditRepo = null!;
        private IProjectRepository _projectRepo = null!;
        private UserController _userController = null!;

        public void Dispose()
        {
            _userController?.Dispose();
            GC.SuppressFinalize(this);
        }

        [SetUp]
        public void Setup()
        {
            _userRepo = new UserRepositoryMock();
            _userRoleRepo = new UserRoleRepositoryMock();
            _userEditRepo = new UserEditRepositoryMock();
            _projectRepo = new ProjectRepositoryMock();
            _userController = new UserController(
                _userRepo,
                new CaptchaServiceMock(),
                new PermissionServiceMock(_userRepo),
                _userRoleRepo,
                _userEditRepo,
                _projectRepo);
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
        public void TestDeleteUserWithRolesAndEdits()
        {
            // Create a user, project, user role, and user edit
            var user = _userRepo.Create(RandomUser()).Result ?? throw new UserCreationException();
            var project = new Project { Id = "proj1", Name = "Test Project" };
            _ = _projectRepo.Create(project).Result;

            var userRole = new UserRole { Id = "role1", ProjectId = project.Id, Role = Role.Editor };
            _ = _userRoleRepo.Create(userRole).Result;

            var userEdit = new UserEdit { Id = "edit1", ProjectId = project.Id };
            _ = _userEditRepo.Create(userEdit).Result;

            // Add role and edit to user
            user.ProjectRoles[project.Id] = userRole.Id;
            user.WorkedProjects[project.Id] = userEdit.Id;
            _ = _userRepo.Update(user.Id, user).Result;

            // Verify they exist
            Assert.That(_userRoleRepo.GetUserRole(project.Id, userRole.Id).Result, Is.Not.Null);
            Assert.That(_userEditRepo.GetUserEdit(project.Id, userEdit.Id).Result, Is.Not.Null);

            // Delete the user
            _ = _userController.DeleteUser(user.Id).Result;

            // Verify user is deleted
            Assert.That(_userRepo.GetAllUsers().Result, Is.Empty);

            // Verify user role and edit are deleted
            Assert.That(_userRoleRepo.GetUserRole(project.Id, userRole.Id).Result, Is.Null);
            Assert.That(_userEditRepo.GetUserEdit(project.Id, userEdit.Id).Result, Is.Null);
        }

        [Test]
        public void TestDeleteAdminUser()
        {
            // Create an admin user
            var user = _userRepo.Create(RandomUser()).Result ?? throw new UserCreationException();
            user.IsAdmin = true;
            _ = _userRepo.Update(user.Id, user, updateIsAdmin: true).Result;

            // Try to delete admin user
            var result = _userController.DeleteUser(user.Id).Result;

            // Should be forbidden
            Assert.That(result, Is.InstanceOf<ForbidResult>());

            // Verify user is not deleted
            Assert.That(_userRepo.GetAllUsers().Result, Has.Count.EqualTo(1));
        }

        [Test]
        public void TestGetUserProjects()
        {
            // Create a user and two projects
            var user = _userRepo.Create(RandomUser()).Result ?? throw new UserCreationException();
            var project1 = _projectRepo.Create(new() { Name = "Test Project 1" }).Result!;
            var project2 = _projectRepo.Create(new() { Name = "Test Project 2" }).Result!;

            // Create user roles for both projects
            var userRole1 = _userRoleRepo.Create(new() { ProjectId = project1.Id, Role = Role.Editor }).Result
                ?? throw new UserRoleCreationException();
            var userRole2 = _userRoleRepo.Create(new() { ProjectId = project2.Id, Role = Role.Administrator }).Result
                ?? throw new UserRoleCreationException();

            // Add roles to user
            user.ProjectRoles[project1.Id] = userRole1.Id;
            user.ProjectRoles[project2.Id] = userRole2.Id;
            _ = _userRepo.Update(user.Id, user).Result;

            // Get user projects
            var result = (ObjectResult)_userController.GetUserProjects(user.Id).Result;
            var projects = result.Value as List<UserProjectInfo>;

            // Verify both projects are returned with correct roles
            Assert.That(projects, Has.Count.EqualTo(2));
            Assert.That(projects!.Exists(
                p => p.ProjectId == project1.Id && p.ProjectName == project1.Name && p.Role == userRole1.Role));
            Assert.That(projects.Exists(
                p => p.ProjectId == project2.Id && p.ProjectName == project2.Name && p.Role == userRole2.Role));
        }

        [Test]
        public void TestGetUserProjectsNoPermission()
        {
            _userController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = _userController.GetUserProjects("anything").Result;
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public void TestGetUserProjectsNoUser()
        {
            var result = _userController.GetUserProjects("not-a-user").Result;
            Assert.That(result, Is.InstanceOf<NotFoundResult>());
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
    }
}
