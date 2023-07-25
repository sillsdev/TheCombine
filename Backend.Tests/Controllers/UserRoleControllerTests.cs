using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Tests.Mocks;
using BackendFramework.Controllers;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;

namespace Backend.Tests.Controllers
{
    public class UserRoleControllerTests : IDisposable
    {
        private IProjectRepository _projRepo = null!;
        private IUserRepository _userRepo = null!;
        private IUserRoleRepository _userRoleRepo = null!;
        private IPermissionService _permissionService = null!;
        private UserRoleController _userRoleController = null!;

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (disposing)
            {
                _userRoleController?.Dispose();
            }
        }

        private string _projId = null!;
        private const string MissingId = "MISSING_ID";

        [SetUp]
        public async Task Setup()
        {
            _projRepo = new ProjectRepositoryMock();
            _userRepo = new UserRepositoryMock();
            _userRoleRepo = new UserRoleRepositoryMock();
            _permissionService = new PermissionServiceMock();
            _userRoleController = new UserRoleController(_userRepo, _userRoleRepo, _projRepo, _permissionService);

            _projId = (await _projRepo.Create(new Project { Name = "UserRoleControllerTests" }))!.Id;
        }

        private UserRole RandomUserRole(Role role = Role.Harvester)
        {
            return new UserRole { ProjectId = _projId, Role = role };
        }

        [Test]
        public async Task TestGetAllUserRoles()
        {
            var roles = new List<Role> { Role.Harvester, Role.Editor, Role.Administrator };
            foreach (var role in roles)
            {
                await _userRoleRepo.Create(RandomUserRole(role));
            }

            var getResult = await _userRoleController.GetProjectUserRoles(_projId);
            Assert.That(getResult, Is.InstanceOf<ObjectResult>());

            var userRoles = ((ObjectResult)getResult).Value as List<UserRole>;
            Assert.That(roles, Has.Count.EqualTo(3));
            (await _userRoleRepo.GetAllUserRoles(_projId)).ForEach(ur => Assert.That(userRoles, Does.Contain(ur)));
        }

        [Test]
        public async Task TestGetAllUserRolesMissingProject()
        {
            var result = await _userRoleController.GetProjectUserRoles(MissingId);
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task TestGetAllUserRolesNotAuthorized()
        {
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = await _userRoleController.GetProjectUserRoles(_projId);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestGetCurrentPermissions()
        {
            var userRole = await _userRoleRepo.Create(RandomUserRole());
            var user = await _userRepo.Create(new User());
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.HttpContextWithUserId(user!.Id);
            user.ProjectRoles[_projId] = userRole.Id;
            await _userRepo.Update(user.Id, user);

            await _userRoleRepo.Create(RandomUserRole());
            await _userRoleRepo.Create(RandomUserRole());

            var result = await _userRoleController.GetCurrentPermissions(_projId);
            Assert.That(result, Is.InstanceOf<ObjectResult>());

            var foundPermissions = ((ObjectResult)result).Value as List<Permission>;
            var expectedPermissions = ProjectRole.RolePermissions(userRole.Role!);
            Assert.That(foundPermissions, Has.Count.EqualTo(expectedPermissions.Count));
            expectedPermissions.ForEach(p =>
            {
                Assert.That(foundPermissions, Does.Contain(p));
            });
        }

        [Test]
        public async Task TestGetCurrentPermissionsMissingUserRole()
        {
            var user = await _userRepo.Create(new User());
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.HttpContextWithUserId(user!.Id);
            user.ProjectRoles[_projId] = "id-for-nonexistent-user-role";
            await _userRepo.Update(user.Id, user);

            var result = await _userRoleController.GetCurrentPermissions(_projId);
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            Assert.That(((ObjectResult)result).Value, Is.Empty);
        }

        [Test]
        public async Task TestGetCurrentPermissionsMissingUserRoleId()
        {
            var user = await _userRepo.Create(new User());
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.HttpContextWithUserId(user!.Id);

            var result = await _userRoleController.GetCurrentPermissions(_projId);
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            Assert.That(((ObjectResult)result).Value, Is.Empty);
        }

        [Test]
        public async Task TestGetCurrentPermissionsMissingUser()
        {
            var result = await _userRoleController.GetCurrentPermissions(MissingId);
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task TestGetCurrentPermissionsMissingProject()
        {
            var user = await _userRepo.Create(new User());
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.HttpContextWithUserId(user!.Id);
            var result = await _userRoleController.GetCurrentPermissions(MissingId);
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task TestGetCurrentPermissionsNoUserInContext()
        {
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.HttpContextWithUserId("");
            var result = await _userRoleController.GetCurrentPermissions(_projId);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestGetCurrentPermissionsNotAuthorized()
        {
            var user = await _userRepo.Create(new User());
            _userRoleController.ControllerContext.HttpContext =
                PermissionServiceMock.UnauthorizedHttpContext(user!.Id);
            var result = await _userRoleController.GetCurrentPermissions(_projId);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestCreateUserRole()
        {
            var userRole = RandomUserRole();
            var id = (string)((ObjectResult)await _userRoleController.CreateUserRole(_projId, userRole)).Value!;
            userRole.Id = id;
            Assert.That(await _userRoleRepo.GetAllUserRoles(_projId), Does.Contain(userRole));
        }

        [Test]
        public async Task TestCreateUserRolesMissingProject()
        {
            var userRole = RandomUserRole();
            var result = await _userRoleController.CreateUserRole(MissingId, userRole);
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task TestCreateUserRolesNoPermission()
        {
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var userRole = await _userRoleRepo.Create(RandomUserRole());
            var result = await _userRoleController.CreateUserRole(_projId, userRole);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestUpdateUserRole()
        {
            var userRole = RandomUserRole(Role.Harvester);
            await _userRoleRepo.Create(userRole);
            var user = new User { ProjectRoles = { [_projId] = userRole.Id } };
            var userId = (await _userRepo.Create(user))!.Id;
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.HttpContextWithUserId(userId);
            var projectRole = new ProjectRole { ProjectId = _projId, Role = Role.Editor };
            await _userRoleController.UpdateUserRole(userId, projectRole);
            var result = await _userRoleController.GetCurrentPermissions(_projId);

            var updatedPermissions = ((ObjectResult)result).Value as List<Permission>;
            var expectedPermissions = ProjectRole.RolePermissions(projectRole.Role);
            Assert.That(updatedPermissions, Has.Count.EqualTo(expectedPermissions.Count));
            expectedPermissions.ForEach(p =>
            {
                Assert.That(updatedPermissions, Does.Contain(p));
            });
        }

        [Test]
        public async Task TestUpdateUserRoleNoChange()
        {
            var userRole = RandomUserRole(Role.Harvester);
            await _userRoleRepo.Create(userRole);
            var user = new User { ProjectRoles = { [_projId] = userRole.Id } };
            var userId = (await _userRepo.Create(user))!.Id;
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.HttpContextWithUserId(userId);
            var projectRole = new ProjectRole { ProjectId = _projId, Role = userRole.Role };
            var result = await _userRoleController.UpdateUserRole(userId, projectRole);
            Assert.That(((ObjectResult)result).StatusCode, Is.EqualTo(StatusCodes.Status304NotModified));
        }

        [Test]
        public async Task TestCreateNewUpdateUserRole()
        {
            var userId = (await _userRepo.Create(new User()))!.Id;
            var projectRole = new ProjectRole { ProjectId = _projId, Role = Role.Editor };
            var updateResult = await _userRoleController.UpdateUserRole(userId, projectRole);
            var newUserRoleId = (string)((OkObjectResult)updateResult).Value!;
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.HttpContextWithUserId(userId);
            var permissionsResult = await _userRoleController.GetCurrentPermissions(_projId);

            var updatedPermissions = ((ObjectResult)permissionsResult).Value as List<Permission>;
            var expectedPermissions = ProjectRole.RolePermissions(projectRole.Role);
            Assert.That(updatedPermissions, Has.Count.EqualTo(expectedPermissions.Count));
            expectedPermissions.ForEach(p =>
            {
                Assert.That(updatedPermissions, Does.Contain(p));
            });
        }

        [Test]
        public async Task TestUpdateUserRolesMissingIds()
        {
            var projectRole = new ProjectRole { ProjectId = _projId, Role = Role.Editor };

            var missingUserIdResult = await _userRoleController.UpdateUserRole(MissingId, projectRole);
            Assert.That(missingUserIdResult, Is.InstanceOf<NotFoundObjectResult>());

            var userRoleId = (await _userRoleRepo.Create(RandomUserRole(Role.Harvester))).Id;
            projectRole.ProjectId = MissingId;
            var missingProjIdResult = await _userRoleController.UpdateUserRole(userRoleId, projectRole);
            Assert.That(missingProjIdResult, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task TestUpdateUserRolesNoPermission()
        {
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var userRoleId = (await _userRoleRepo.Create(RandomUserRole(Role.Harvester))).Id;
            var result = await _userRoleController.UpdateUserRole(userRoleId, new ProjectRole());
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestDeleteUserRole()
        {
            var userRole = RandomUserRole();
            await _userRoleRepo.Create(userRole);
            var user = new User { ProjectRoles = { [_projId] = userRole.Id } };
            var userId = (await _userRepo.Create(user))!.Id;

            Assert.That(await _userRoleRepo.GetAllUserRoles(_projId), Has.Count.EqualTo(1));
            var fetchedUser = await _userRepo.GetUser(userId);
            Assert.That(fetchedUser, Is.Not.Null);
            Assert.That(fetchedUser!.ProjectRoles, Does.ContainKey(_projId));
            Assert.That(fetchedUser.ProjectRoles, Does.ContainValue(userRole.Id));

            await _userRoleController.DeleteUserRole(_projId, userId);

            Assert.That(await _userRoleRepo.GetAllUserRoles(_projId), Has.Count.EqualTo(0));
            fetchedUser = await _userRepo.GetUser(userId);
            Assert.That(fetchedUser, Is.Not.Null);
            Assert.That(fetchedUser!.ProjectRoles, Does.Not.ContainKey(_projId));
            Assert.That(fetchedUser.ProjectRoles, Does.Not.ContainValue(userRole.Id));
        }

        [Test]
        public async Task TestDeleteUserRoleNoPermission()
        {
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var userRole = await _userRoleRepo.Create(RandomUserRole());
            var result = await _userRoleController.DeleteUserRole(_projId, userRole.Id);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestDeleteUserRoleMissingIds()
        {
            var userRole = await _userRoleRepo.Create(RandomUserRole());
            var projectResult = await _userRoleController.DeleteUserRole(MissingId, userRole.Id);
            Assert.That(projectResult, Is.InstanceOf<NotFoundObjectResult>());

            var wordResult = await _userRoleController.DeleteUserRole(_projId, MissingId);
            Assert.That(wordResult, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task TestDeleteAllUserRoles()
        {
            await _userRoleRepo.Create(RandomUserRole());
            await _userRoleRepo.Create(RandomUserRole());
            await _userRoleRepo.Create(RandomUserRole());

            Assert.That(await _userRoleRepo.GetAllUserRoles(_projId), Has.Count.EqualTo(3));

            await _userRoleController.DeleteProjectUserRoles(_projId);
            Assert.That(await _userRoleRepo.GetAllUserRoles(_projId), Has.Count.EqualTo(0));
        }

        [Test]
        public async Task TestDeleteAllUserRolesMissingProject()
        {
            var result = await _userRoleController.DeleteProjectUserRoles(MissingId);
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task TestDeleteAllUserRolesNoPermission()
        {
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = await _userRoleController.DeleteProjectUserRoles(_projId);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }
    }
}
