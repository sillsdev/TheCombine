using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend.Tests.Mocks;
using BackendFramework.Controllers;
using BackendFramework.Interfaces;
using BackendFramework.Models;
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
            return new UserRole { Permissions = ProjectRole.RolePermissions(role), ProjectId = _projId };
        }

        [Test]
        public async Task TestGetAllUserRoles()
        {
            await _userRoleRepo.Create(RandomUserRole(Role.Harvester));
            await _userRoleRepo.Create(RandomUserRole(Role.Manager));
            await _userRoleRepo.Create(RandomUserRole(Role.Administrator));

            var getResult = await _userRoleController.GetProjectUserRoles(_projId);

            Assert.IsInstanceOf<ObjectResult>(getResult);

            var roles = ((ObjectResult)getResult).Value as List<UserRole>;
            Assert.That(roles, Has.Count.EqualTo(3));
            (await _userRoleRepo.GetAllUserRoles(_projId)).ForEach(role => Assert.Contains(role, roles));
        }

        [Test]
        public async Task TestGetAllUserRolesMissingProject()
        {
            var result = await _userRoleController.GetProjectUserRoles(MissingId);
            Assert.IsInstanceOf<NotFoundObjectResult>(result);
        }

        [Test]
        public async Task TestGetAllUserRolesNoPermission()
        {
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = await _userRoleController.GetProjectUserRoles(_projId);
            Assert.IsInstanceOf<ForbidResult>(result);
        }

        [Test]
        public async Task TestGetUserRole()
        {
            var userRole = await _userRoleRepo.Create(RandomUserRole());

            await _userRoleRepo.Create(RandomUserRole());
            await _userRoleRepo.Create(RandomUserRole());

            var action = await _userRoleController.GetUserRole(_projId, userRole.Id);
            Assert.IsInstanceOf<ObjectResult>(action);

            var foundUserRole = ((ObjectResult)action).Value as UserRole;
            Assert.AreEqual(userRole, foundUserRole);
        }

        [Test]
        public async Task TestGetMissingUserRole()
        {
            var action = await _userRoleController.GetUserRole(_projId, MissingId);
            Assert.IsInstanceOf<NotFoundObjectResult>(action);
        }

        [Test]
        public async Task TestGetUserRolesMissingProject()
        {
            var userRole = await _userRoleRepo.Create(RandomUserRole());
            var result = await _userRoleController.GetUserRole(MissingId, userRole.Id);
            Assert.IsInstanceOf<NotFoundObjectResult>(result);
        }

        [Test]
        public async Task TestGetUserRolesNoPermission()
        {
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var userRole = await _userRoleRepo.Create(RandomUserRole());
            var result = await _userRoleController.GetUserRole(_projId, userRole.Id);
            Assert.IsInstanceOf<ForbidResult>(result);
        }

        [Test]
        public async Task TestCreateUserRole()
        {
            var userRole = RandomUserRole();
            var id = (string)((ObjectResult)await _userRoleController.CreateUserRole(_projId, userRole)).Value!;
            userRole.Id = id;
            Assert.Contains(userRole, await _userRoleRepo.GetAllUserRoles(_projId));
        }

        [Test]
        public async Task TestCreateUserRolesMissingProject()
        {
            var userRole = RandomUserRole();
            var result = await _userRoleController.CreateUserRole(MissingId, userRole);
            Assert.IsInstanceOf<NotFoundObjectResult>(result);
        }

        [Test]
        public async Task TestCreateUserRolesNoPermission()
        {
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var userRole = await _userRoleRepo.Create(RandomUserRole());
            var result = await _userRoleController.CreateUserRole(_projId, userRole);
            Assert.IsInstanceOf<ForbidResult>(result);
        }

        [Test]
        public async Task TestUpdateUserRole()
        {
            var userRole = RandomUserRole(Role.Harvester);
            await _userRoleRepo.Create(userRole);
            var user = new User { ProjectRoles = { [_projId] = userRole.Id } };
            var userId = (await _userRepo.Create(user))!.Id;
            var projectRole = new ProjectRole { ProjectId = _projId, Role = Role.Manager };
            await _userRoleController.UpdateUserRole(userId, projectRole);
            var action = await _userRoleController.GetUserRole(_projId, userRole.Id);
            var updatedUserRole = ((ObjectResult)action).Value as UserRole;
            Assert.AreEqual(ProjectRole.RolePermissions(projectRole.Role), updatedUserRole?.Permissions);
        }

        [Test]
        public async Task TestCreateNewUpdateUserRole()
        {
            var userId = (await _userRepo.Create(new User()))!.Id;
            var projectRole = new ProjectRole { ProjectId = _projId, Role = Role.Manager };
            var result = await _userRoleController.UpdateUserRole(userId, projectRole);
            var newUserRoleId = (string)((OkObjectResult)result).Value!;
            var action = await _userRoleController.GetUserRole(_projId, newUserRoleId);
            var updatedUserRole = ((ObjectResult)action).Value as UserRole;
            Assert.AreEqual(ProjectRole.RolePermissions(projectRole.Role), updatedUserRole?.Permissions);
        }

        [Test]
        public async Task TestUpdateUserRolesMissingIds()
        {
            var projectRole = new ProjectRole { ProjectId = _projId, Role = Role.Manager };

            var missingUserIdResult = await _userRoleController.UpdateUserRole(MissingId, projectRole);
            Assert.IsInstanceOf<NotFoundObjectResult>(missingUserIdResult);

            var userRoleId = (await _userRoleRepo.Create(RandomUserRole(Role.Harvester))).Id;
            projectRole.ProjectId = MissingId;
            var missingProjIdResult = await _userRoleController.UpdateUserRole(userRoleId, projectRole);
            Assert.IsInstanceOf<NotFoundObjectResult>(missingProjIdResult);
        }

        [Test]
        public async Task TestUpdateUserRolesNoPermission()
        {
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var userRoleId = (await _userRoleRepo.Create(RandomUserRole(Role.Harvester))).Id;
            var result = await _userRoleController.UpdateUserRole(userRoleId, new ProjectRole());
            Assert.IsInstanceOf<ForbidResult>(result);
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
            Assert.IsNotNull(fetchedUser);
            Assert.That(fetchedUser!.ProjectRoles.ContainsKey(_projId));
            Assert.That(fetchedUser.ProjectRoles.ContainsValue(userRole.Id));

            await _userRoleController.DeleteUserRole(_projId, userId);

            Assert.That(await _userRoleRepo.GetAllUserRoles(_projId), Has.Count.EqualTo(0));
            fetchedUser = await _userRepo.GetUser(userId);
            Assert.IsNotNull(fetchedUser);
            Assert.False(fetchedUser!.ProjectRoles.ContainsKey(_projId));
            Assert.False(fetchedUser.ProjectRoles.ContainsValue(userRole.Id));
        }

        [Test]
        public async Task TestDeleteUserRoleNoPermission()
        {
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var userRole = await _userRoleRepo.Create(RandomUserRole());
            var result = await _userRoleController.DeleteUserRole(_projId, userRole.Id);
            Assert.IsInstanceOf<ForbidResult>(result);
        }

        [Test]
        public async Task TestDeleteUserRoleMissingIds()
        {
            var userRole = await _userRoleRepo.Create(RandomUserRole());
            var projectResult = await _userRoleController.DeleteUserRole(MissingId, userRole.Id);
            Assert.IsInstanceOf<NotFoundObjectResult>(projectResult);

            var wordResult = await _userRoleController.DeleteUserRole(_projId, MissingId);
            Assert.IsInstanceOf<NotFoundObjectResult>(wordResult);
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
            Assert.IsInstanceOf<NotFoundObjectResult>(result);
        }

        [Test]
        public async Task TestDeleteAllUserRolesNoPermission()
        {
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = await _userRoleController.DeleteProjectUserRoles(_projId);
            Assert.IsInstanceOf<ForbidResult>(result);
        }
    }
}
