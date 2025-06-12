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

        private ProjectRole ProjectRoleInProj(Role role = Role.Harvester)
        {
            return new ProjectRole { ProjectId = _projId, Role = role };
        }

        private UserRole UserRoleInProj(Role role = Role.Harvester)
        {
            return new UserRole { ProjectId = _projId, Role = role };
        }

        [Test]
        public async Task TestGetAllUserRoles()
        {
            var roles = new List<Role> { Role.Harvester, Role.Editor, Role.Administrator };
            foreach (var role in roles)
            {
                await _userRoleRepo.Create(UserRoleInProj(role));
            }

            var getResult = await _userRoleController.GetProjectUserRoles(_projId);
            Assert.That(getResult, Is.InstanceOf<ObjectResult>());

            var userRoles = ((ObjectResult)getResult).Value as List<UserRole>;
            Assert.That(roles, Has.Count.EqualTo(3));
            var repoRoles = await _userRoleRepo.GetAllUserRoles(_projId);
            repoRoles.ForEach(ur => Assert.That(userRoles, Does.Contain(ur).UsingPropertiesComparer()));
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
        public async Task TestHasPermissionNotAuthorized()
        {
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = await _userRoleController.HasPermission(_projId, Permission.WordEntry);
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            Assert.That(((ObjectResult)result).Value, Is.False);
        }

        [Test]
        public async Task TestGetCurrentPermissions()
        {
            var userRole = await _userRoleRepo.Create(UserRoleInProj());
            var user = await _userRepo.Create(new User());
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.HttpContextWithUserId(user!.Id);
            user.ProjectRoles[_projId] = userRole.Id;
            await _userRepo.Update(user.Id, user);

            await _userRoleRepo.Create(UserRoleInProj());
            await _userRoleRepo.Create(UserRoleInProj());

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
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.HttpContextWithUserId("user-id");
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
            var userRole = UserRoleInProj();
            var id = (string)((ObjectResult)await _userRoleController.CreateUserRole(_projId, userRole)).Value!;
            userRole.Id = id;
            var repoRoles = await _userRoleRepo.GetAllUserRoles(_projId);
            Assert.That(repoRoles, Does.Contain(userRole).UsingPropertiesComparer());
        }

        [Test]
        public async Task TestCreateUserRolesMissingProject()
        {
            var userRole = UserRoleInProj();
            var result = await _userRoleController.CreateUserRole(MissingId, userRole);
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task TestCreateUserRolesNoPermission()
        {
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var userRole = await _userRoleRepo.Create(UserRoleInProj());
            var result = await _userRoleController.CreateUserRole(_projId, userRole);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestCreateUserRolesSecondOwner()
        {
            var firstOwner = await _userRoleController.CreateUserRole(_projId, UserRoleInProj(Role.Owner));
            Assert.That(firstOwner, Is.InstanceOf<OkObjectResult>());
            var secondOwner = await _userRoleController.CreateUserRole(_projId, UserRoleInProj(Role.Owner));
            Assert.That(secondOwner, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestUpdateUserRole()
        {
            var userRole = UserRoleInProj(Role.Harvester);
            await _userRoleRepo.Create(userRole);
            var user = new User { ProjectRoles = { [_projId] = userRole.Id } };
            var userId = (await _userRepo.Create(user))!.Id;
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.HttpContextWithUserId(userId);
            var projectRole = ProjectRoleInProj(Role.Editor);
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
        public async Task TestCreateNewUpdateUserRole()
        {
            var userId = (await _userRepo.Create(new User()))!.Id;
            var projectRole = ProjectRoleInProj(Role.Editor);
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
            var projectRole = ProjectRoleInProj(Role.Editor);
            var missingUserIdResult = await _userRoleController.UpdateUserRole(MissingId, projectRole);
            Assert.That(missingUserIdResult, Is.InstanceOf<NotFoundObjectResult>());

            var userRoleId = (await _userRoleRepo.Create(UserRoleInProj(Role.Harvester))).Id;
            projectRole.ProjectId = MissingId;
            var missingProjIdResult = await _userRoleController.UpdateUserRole(userRoleId, projectRole);
            Assert.That(missingProjIdResult, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task TestUpdateUserRolesNoPermission()
        {
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var userRoleId = (await _userRoleRepo.Create(UserRoleInProj(Role.Harvester))).Id;
            var result = await _userRoleController.UpdateUserRole(userRoleId, ProjectRoleInProj());
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestUpdateUserRolesToOwner()
        {
            var userRoleId = (await _userRoleRepo.Create(UserRoleInProj(Role.Administrator))).Id;
            var user = new User { ProjectRoles = { [_projId] = userRoleId } };
            var userId = (await _userRepo.Create(user))!.Id;
            var result = await _userRoleController.UpdateUserRole(userId, ProjectRoleInProj(Role.Owner));
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestUpdateUserRolesFromOwner()
        {
            var userRoleId = (await _userRoleRepo.Create(UserRoleInProj(Role.Owner))).Id;
            var user = new User { ProjectRoles = { [_projId] = userRoleId } };
            var userId = (await _userRepo.Create(user))!.Id;
            var result = await _userRoleController.UpdateUserRole(userId, ProjectRoleInProj(Role.Administrator));
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestDeleteUserRole()
        {
            var userRole = UserRoleInProj();
            await _userRoleRepo.Create(userRole);
            var user = new User { ProjectRoles = { [_projId] = userRole.Id } };
            var userId = (await _userRepo.Create(user))!.Id;

            Assert.That(await _userRoleRepo.GetAllUserRoles(_projId), Has.Count.EqualTo(1));
            var fetchedUser = await _userRepo.GetUser(userId);
            Assert.That(fetchedUser, Is.Not.Null);
            Assert.That(fetchedUser!.ProjectRoles, Does.ContainKey(_projId));
            Assert.That(fetchedUser.ProjectRoles, Does.ContainValue(userRole.Id));

            await _userRoleController.DeleteUserRole(_projId, userId);

            Assert.That(await _userRoleRepo.GetAllUserRoles(_projId), Is.Empty);
            fetchedUser = await _userRepo.GetUser(userId);
            Assert.That(fetchedUser, Is.Not.Null);
            Assert.That(fetchedUser!.ProjectRoles, Does.Not.ContainKey(_projId));
            Assert.That(fetchedUser.ProjectRoles, Does.Not.ContainValue(userRole.Id));
        }

        [Test]
        public async Task TestDeleteUserRoleNoPermission()
        {
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var userRole = await _userRoleRepo.Create(UserRoleInProj());
            var user = new User { ProjectRoles = { [_projId] = userRole.Id } };
            var userId = (await _userRepo.Create(user))!.Id;
            var result = await _userRoleController.DeleteUserRole(_projId, userId);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestDeleteUserRoleOwner()
        {
            var userRole = await _userRoleRepo.Create(UserRoleInProj(Role.Owner));
            var user = new User { ProjectRoles = { [_projId] = userRole.Id } };
            var userId = (await _userRepo.Create(user))!.Id;
            var result = await _userRoleController.DeleteUserRole(_projId, userId);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestDeleteUserRoleMissingIds()
        {
            var userRole = await _userRoleRepo.Create(UserRoleInProj());
            var user = new User { ProjectRoles = { [_projId] = userRole.Id } };
            var userId = (await _userRepo.Create(user))!.Id;
            var projectResult = await _userRoleController.DeleteUserRole(MissingId, userId);
            Assert.That(projectResult, Is.InstanceOf<NotFoundObjectResult>());

            var wordResult = await _userRoleController.DeleteUserRole(_projId, MissingId);
            Assert.That(wordResult, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task TestDeleteAllUserRoles()
        {
            await _userRoleRepo.Create(UserRoleInProj());
            await _userRoleRepo.Create(UserRoleInProj());
            await _userRoleRepo.Create(UserRoleInProj());

            Assert.That(await _userRoleRepo.GetAllUserRoles(_projId), Has.Count.EqualTo(3));

            await _userRoleController.DeleteProjectUserRoles(_projId);
            Assert.That(await _userRoleRepo.GetAllUserRoles(_projId), Is.Empty);
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

        [Test]
        public async Task TestChangeOwnerNoPermission()
        {
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var oldRole = await _userRoleRepo.Create(UserRoleInProj(Role.Owner));
            var oldOwner = new User { ProjectRoles = { [_projId] = oldRole.Id } };
            var oldId = (await _userRepo.Create(oldOwner))!.Id;
            var newId = (await _userRepo.Create(new()))!.Id;

            var result = await _userRoleController.ChangeOwner(_projId, oldId, newId);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestChangeOwnerSameId()
        {
            var oldRole = await _userRoleRepo.Create(UserRoleInProj(Role.Owner));
            var oldOwner = new User { ProjectRoles = { [_projId] = oldRole.Id } };
            var oldId = (await _userRepo.Create(oldOwner))!.Id;
            var newId = (await _userRepo.Create(new()))!.Id;

            var result = await _userRoleController.ChangeOwner(_projId, oldId, oldId);
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());

            result = await _userRoleController.ChangeOwner(_projId, newId, newId);
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
        }

        [Test]
        public async Task TestChangeOwnerMissingProjectOrUser()
        {
            var oldRole = await _userRoleRepo.Create(UserRoleInProj(Role.Owner));
            var oldOwner = new User { ProjectRoles = { [_projId] = oldRole.Id } };
            var oldId = (await _userRepo.Create(oldOwner))!.Id;
            var newId = (await _userRepo.Create(new()))!.Id;

            var result = await _userRoleController.ChangeOwner(MissingId, oldId, newId);
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());

            result = await _userRoleController.ChangeOwner(_projId, MissingId, newId);
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());

            result = await _userRoleController.ChangeOwner(_projId, oldId, MissingId);
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task TestChangeOwnerOldUserNotOwner()
        {
            var oldRole = await _userRoleRepo.Create(UserRoleInProj(Role.Editor));
            var oldEditor = new User { ProjectRoles = { [_projId] = oldRole.Id } };
            var oldEditorId = (await _userRepo.Create(oldEditor))!.Id;
            var oldOtherId = (await _userRepo.Create(new()))!.Id;
            var newId = (await _userRepo.Create(new()))!.Id;

            var result = await _userRoleController.ChangeOwner(_projId, oldEditorId, newId);
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());

            result = await _userRoleController.ChangeOwner(_projId, oldOtherId, newId);
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
        }

        [Test]
        public async Task TestChangeOwnerNewRole()
        {
            var oldRole = await _userRoleRepo.Create(UserRoleInProj(Role.Owner));
            var oldOwner = new User { ProjectRoles = { [_projId] = oldRole.Id } };
            var oldId = (await _userRepo.Create(oldOwner))!.Id;
            var newId = (await _userRepo.Create(new()))!.Id;

            var result = await _userRoleController.ChangeOwner(_projId, oldId, newId);
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            Assert.That((await _userRoleRepo.GetUserRole(_projId, oldRole.Id))?.Role, Is.EqualTo(Role.Administrator));
            var newRoleId = (await _userRepo.GetUser(newId))!.ProjectRoles[_projId];
            Assert.That((await _userRoleRepo.GetUserRole(_projId, newRoleId))?.Role, Is.EqualTo(Role.Owner));
        }

        [Test]
        public async Task TestChangeOwnerUpdateRole()
        {
            var oldRole = await _userRoleRepo.Create(UserRoleInProj(Role.Owner));
            var oldOwner = new User { ProjectRoles = { [_projId] = oldRole.Id } };
            var oldId = (await _userRepo.Create(oldOwner))!.Id;
            var newRole = await _userRoleRepo.Create(UserRoleInProj());
            var newOwner = new User { ProjectRoles = { [_projId] = newRole.Id } };
            var newId = (await _userRepo.Create(newOwner))!.Id;

            var result = await _userRoleController.ChangeOwner(_projId, oldId, newId);
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            Assert.That((await _userRoleRepo.GetUserRole(_projId, oldRole.Id))?.Role, Is.EqualTo(Role.Administrator));
            Assert.That((await _userRoleRepo.GetUserRole(_projId, newRole.Id))?.Role, Is.EqualTo(Role.Owner));
        }
    }
}
