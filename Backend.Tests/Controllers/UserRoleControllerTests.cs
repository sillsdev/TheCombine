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

        private const string ProjId = "PROJECT_ID";
        private const string MissingId = "MISSING_ID";

        [SetUp]
        public void Setup()
        {
            _userRepo = new UserRepositoryMock();
            _userRoleRepo = new UserRoleRepositoryMock();
            _permissionService = new PermissionServiceMock();
            _userRoleController = new UserRoleController(_userRepo, _userRoleRepo, _permissionService);
        }

        private static ProjectRole ProjectRoleInProj(Role role = Role.Harvester)
        {
            return new ProjectRole { ProjectId = ProjId, Role = role };
        }

        private static UserRole UserRoleInProj(Role role = Role.Harvester)
        {
            return new UserRole { ProjectId = ProjId, Role = role };
        }

        [Test]
        public async Task TestGetAllUserRoles()
        {
            var roles = new List<Role> { Role.Harvester, Role.Editor, Role.Administrator };
            foreach (var role in roles)
            {
                await _userRoleRepo.Create(UserRoleInProj(role));
            }

            var getResult = await _userRoleController.GetProjectUserRoles(ProjId);
            Assert.That(getResult, Is.InstanceOf<ObjectResult>());

            var userRoles = ((ObjectResult)getResult).Value as List<UserRole>;
            Assert.That(roles, Has.Count.EqualTo(3));
            var repoRoles = await _userRoleRepo.GetAllUserRoles(ProjId);
            repoRoles.ForEach(ur => Assert.That(userRoles, Does.Contain(ur).UsingPropertiesComparer()));
        }

        [Test]
        public async Task TestGetAllUserRolesNotAuthorized()
        {
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = await _userRoleController.GetProjectUserRoles(ProjId);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestHasPermissionNotAuthorized()
        {
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = await _userRoleController.HasPermission(ProjId, Permission.WordEntry);
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            Assert.That(((ObjectResult)result).Value, Is.False);
        }

        [Test]
        public async Task TestGetCurrentPermissions()
        {
            var userRole = await _userRoleRepo.Create(UserRoleInProj());
            var user = await _userRepo.Create(new User());
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.HttpContextWithUserId(user!.Id);
            user.ProjectRoles[ProjId] = userRole.Id;
            await _userRepo.Update(user.Id, user);

            await _userRoleRepo.Create(UserRoleInProj());
            await _userRoleRepo.Create(UserRoleInProj());

            var result = await _userRoleController.GetCurrentPermissions(ProjId);
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
            user.ProjectRoles[ProjId] = "id-for-nonexistent-user-role";
            await _userRepo.Update(user.Id, user);

            var result = await _userRoleController.GetCurrentPermissions(ProjId);
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            Assert.That(((ObjectResult)result).Value, Is.Empty);
        }

        [Test]
        public async Task TestGetCurrentPermissionsMissingUserRoleId()
        {
            var user = await _userRepo.Create(new User());
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.HttpContextWithUserId(user!.Id);

            var result = await _userRoleController.GetCurrentPermissions(ProjId);
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
        public async Task TestGetCurrentPermissionsNoUserInContext()
        {
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.HttpContextWithUserId("");
            var result = await _userRoleController.GetCurrentPermissions(ProjId);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestGetCurrentPermissionsNotAuthorized()
        {
            var user = await _userRepo.Create(new User());
            _userRoleController.ControllerContext.HttpContext =
                PermissionServiceMock.UnauthorizedHttpContext(user!.Id);
            var result = await _userRoleController.GetCurrentPermissions(ProjId);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestCreateUserRole()
        {
            var userRole = UserRoleInProj();
            var id = (string)((ObjectResult)await _userRoleController.CreateUserRole(ProjId, userRole)).Value!;
            userRole.Id = id;
            var repoRoles = await _userRoleRepo.GetAllUserRoles(ProjId);
            Assert.That(repoRoles, Does.Contain(userRole).UsingPropertiesComparer());
        }

        [Test]
        public async Task TestCreateUserRolesNoPermission()
        {
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var userRole = await _userRoleRepo.Create(UserRoleInProj());
            var result = await _userRoleController.CreateUserRole(ProjId, userRole);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestCreateUserRolesSecondOwner()
        {
            var firstOwner = await _userRoleController.CreateUserRole(ProjId, UserRoleInProj(Role.Owner));
            Assert.That(firstOwner, Is.InstanceOf<OkObjectResult>());
            var secondOwner = await _userRoleController.CreateUserRole(ProjId, UserRoleInProj(Role.Owner));
            Assert.That(secondOwner, Is.InstanceOf<BadRequestObjectResult>());
        }

        [Test]
        public async Task TestUpdateUserRole()
        {
            var userRole = UserRoleInProj(Role.Harvester);
            await _userRoleRepo.Create(userRole);
            var user = new User { ProjectRoles = { [ProjId] = userRole.Id } };
            var userId = (await _userRepo.Create(user))!.Id;
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.HttpContextWithUserId(userId);
            var projectRole = ProjectRoleInProj(Role.Editor);
            await _userRoleController.UpdateUserRole(userId, projectRole);
            var result = await _userRoleController.GetCurrentPermissions(ProjId);

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
            await _userRoleController.UpdateUserRole(userId, projectRole);
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.HttpContextWithUserId(userId);
            var permissionsResult = await _userRoleController.GetCurrentPermissions(ProjId);

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
            var user = new User { ProjectRoles = { [ProjId] = userRoleId } };
            var userId = (await _userRepo.Create(user))!.Id;
            var result = await _userRoleController.UpdateUserRole(userId, ProjectRoleInProj(Role.Owner));
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
        }

        [Test]
        public async Task TestUpdateUserRolesFromOwner()
        {
            var userRoleId = (await _userRoleRepo.Create(UserRoleInProj(Role.Owner))).Id;
            var user = new User { ProjectRoles = { [ProjId] = userRoleId } };
            var userId = (await _userRepo.Create(user))!.Id;
            var result = await _userRoleController.UpdateUserRole(userId, ProjectRoleInProj(Role.Administrator));
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
        }

        [Test]
        public async Task TestDeleteUserRole()
        {
            var userRole = UserRoleInProj();
            await _userRoleRepo.Create(userRole);
            var user = new User { ProjectRoles = { [ProjId] = userRole.Id } };
            var userId = (await _userRepo.Create(user))!.Id;

            Assert.That(await _userRoleRepo.GetAllUserRoles(ProjId), Has.Count.EqualTo(1));
            var fetchedUser = await _userRepo.GetUser(userId);
            Assert.That(fetchedUser, Is.Not.Null);
            Assert.That(fetchedUser!.ProjectRoles, Does.ContainKey(ProjId));
            Assert.That(fetchedUser.ProjectRoles, Does.ContainValue(userRole.Id));

            await _userRoleController.DeleteUserRole(ProjId, userId);

            Assert.That(await _userRoleRepo.GetAllUserRoles(ProjId), Is.Empty);
            fetchedUser = await _userRepo.GetUser(userId);
            Assert.That(fetchedUser, Is.Not.Null);
            Assert.That(fetchedUser!.ProjectRoles, Does.Not.ContainKey(ProjId));
            Assert.That(fetchedUser.ProjectRoles, Does.Not.ContainValue(userRole.Id));
        }

        [Test]
        public async Task TestDeleteUserRoleNoPermission()
        {
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var userRole = await _userRoleRepo.Create(UserRoleInProj());
            var user = new User { ProjectRoles = { [ProjId] = userRole.Id } };
            var userId = (await _userRepo.Create(user))!.Id;
            var result = await _userRoleController.DeleteUserRole(ProjId, userId);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestDeleteUserRoleOwner()
        {
            var userRole = await _userRoleRepo.Create(UserRoleInProj(Role.Owner));
            var user = new User { ProjectRoles = { [ProjId] = userRole.Id } };
            var userId = (await _userRepo.Create(user))!.Id;
            var result = await _userRoleController.DeleteUserRole(ProjId, userId);
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
        }

        [Test]
        public async Task TestDeleteUserRoleMissingUser()
        {
            var wordResult = await _userRoleController.DeleteUserRole(ProjId, MissingId);
            Assert.That(wordResult, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task TestDeleteAllUserRoles()
        {
            await _userRoleRepo.Create(UserRoleInProj());
            await _userRoleRepo.Create(UserRoleInProj());
            await _userRoleRepo.Create(UserRoleInProj());

            Assert.That(await _userRoleRepo.GetAllUserRoles(ProjId), Has.Count.EqualTo(3));

            await _userRoleController.DeleteProjectUserRoles(ProjId);
            Assert.That(await _userRoleRepo.GetAllUserRoles(ProjId), Is.Empty);
        }

        [Test]
        public async Task TestDeleteAllUserRolesNoPermission()
        {
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = await _userRoleController.DeleteProjectUserRoles(ProjId);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestChangeOwnerNoPermission()
        {
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var oldRole = await _userRoleRepo.Create(UserRoleInProj(Role.Owner));
            var oldOwner = new User { ProjectRoles = { [ProjId] = oldRole.Id } };
            var oldId = (await _userRepo.Create(oldOwner))!.Id;
            var newId = (await _userRepo.Create(new()))!.Id;

            var result = await _userRoleController.ChangeOwner(ProjId, oldId, newId);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestChangeOwnerSameId()
        {
            var oldRole = await _userRoleRepo.Create(UserRoleInProj(Role.Owner));
            var oldOwner = new User { ProjectRoles = { [ProjId] = oldRole.Id } };
            var oldId = (await _userRepo.Create(oldOwner))!.Id;
            var newId = (await _userRepo.Create(new()))!.Id;

            var result = await _userRoleController.ChangeOwner(ProjId, oldId, oldId);
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());

            result = await _userRoleController.ChangeOwner(ProjId, newId, newId);
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
        }

        [Test]
        public async Task TestChangeOwnerMissingUser()
        {
            var oldRole = await _userRoleRepo.Create(UserRoleInProj(Role.Owner));
            var oldOwner = new User { ProjectRoles = { [ProjId] = oldRole.Id } };
            var oldId = (await _userRepo.Create(oldOwner))!.Id;
            var newId = (await _userRepo.Create(new()))!.Id;

            var result = await _userRoleController.ChangeOwner(ProjId, MissingId, newId);
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());

            result = await _userRoleController.ChangeOwner(ProjId, oldId, MissingId);
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task TestChangeOwnerOldUserNotOwner()
        {
            var oldRole = await _userRoleRepo.Create(UserRoleInProj(Role.Editor));
            var oldEditor = new User { ProjectRoles = { [ProjId] = oldRole.Id } };
            var oldEditorId = (await _userRepo.Create(oldEditor))!.Id;
            var oldOtherId = (await _userRepo.Create(new()))!.Id;
            var newId = (await _userRepo.Create(new()))!.Id;

            var result = await _userRoleController.ChangeOwner(ProjId, oldEditorId, newId);
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());

            result = await _userRoleController.ChangeOwner(ProjId, oldOtherId, newId);
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
        }

        [Test]
        public async Task TestChangeOwnerNewRole()
        {
            var oldRole = await _userRoleRepo.Create(UserRoleInProj(Role.Owner));
            var oldOwner = new User { ProjectRoles = { [ProjId] = oldRole.Id } };
            var oldId = (await _userRepo.Create(oldOwner))!.Id;
            var newId = (await _userRepo.Create(new()))!.Id;

            var result = await _userRoleController.ChangeOwner(ProjId, oldId, newId);
            Assert.That(result, Is.InstanceOf<OkResult>());
            Assert.That((await _userRoleRepo.GetUserRole(ProjId, oldRole.Id))?.Role, Is.EqualTo(Role.Administrator));
            var newRoleId = (await _userRepo.GetUser(newId))!.ProjectRoles[ProjId];
            Assert.That((await _userRoleRepo.GetUserRole(ProjId, newRoleId))?.Role, Is.EqualTo(Role.Owner));
        }

        [Test]
        public async Task TestChangeOwnerUpdateRole()
        {
            var oldRole = await _userRoleRepo.Create(UserRoleInProj(Role.Owner));
            var oldOwner = new User { ProjectRoles = { [ProjId] = oldRole.Id } };
            var oldId = (await _userRepo.Create(oldOwner))!.Id;
            var newRole = await _userRoleRepo.Create(UserRoleInProj());
            var newOwner = new User { ProjectRoles = { [ProjId] = newRole.Id } };
            var newId = (await _userRepo.Create(newOwner))!.Id;

            var result = await _userRoleController.ChangeOwner(ProjId, oldId, newId);
            Assert.That(result, Is.InstanceOf<OkResult>());
            Assert.That((await _userRoleRepo.GetUserRole(ProjId, oldRole.Id))?.Role, Is.EqualTo(Role.Administrator));
            Assert.That((await _userRoleRepo.GetUserRole(ProjId, newRole.Id))?.Role, Is.EqualTo(Role.Owner));
        }
    }
}
