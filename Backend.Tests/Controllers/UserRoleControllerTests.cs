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
    internal sealed class UserRoleControllerTests : IDisposable
    {
        private IUserRepository _userRepo = null!;
        private IUserRoleRepository _userRoleRepo = null!;
        private IPermissionService _permissionService = null!;
        private UserRoleController _userRoleController = null!;

        public void Dispose()
        {
            _userRoleController?.Dispose();
            GC.SuppressFinalize(this);
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
        public async Task TestGetAllUserRolesUnauthorized()
        {
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = await _userRoleController.GetProjectUserRoles(ProjId);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestHasPermissionUnauthorized()
        {
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = (OkObjectResult)await _userRoleController.HasPermission(ProjId, Permission.WordEntry);
            Assert.That(result.Value, Is.False);
        }

        [Test]
        public async Task TestGetCurrentPermissions()
        {
            var userRole = await _userRoleRepo.Create(UserRoleInProj());
            var user = await _userRepo.Create(new User());
            Assert.That(user, Is.Not.Null);
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.HttpContextWithUserId(user.Id);
            user.ProjectRoles[ProjId] = userRole.Id;
            await _userRepo.Update(user.Id, user);

            await _userRoleRepo.Create(UserRoleInProj());
            await _userRoleRepo.Create(UserRoleInProj());

            var result = (OkObjectResult)await _userRoleController.GetCurrentPermissions(ProjId);
            Assert.That(result.Value, Is.InstanceOf<List<Permission>>());
            var foundPermissions = (List<Permission>)result.Value;
            var expectedPermissions = ProjectRole.RolePermissions(userRole.Role);
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
            Assert.That(user, Is.Not.Null);
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.HttpContextWithUserId(user.Id);
            user.ProjectRoles[ProjId] = "id-for-nonexistent-user-role";
            await _userRepo.Update(user.Id, user);

            var result = (OkObjectResult)await _userRoleController.GetCurrentPermissions(ProjId);
            Assert.That(result.Value, Is.Empty);
        }

        [Test]
        public async Task TestGetCurrentPermissionsMissingUserRoleId()
        {
            var user = await _userRepo.Create(new User());
            Assert.That(user, Is.Not.Null);
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.HttpContextWithUserId(user.Id);

            var result = (OkObjectResult)await _userRoleController.GetCurrentPermissions(ProjId);
            Assert.That(result.Value, Is.Empty);
        }

        [Test]
        public async Task TestGetCurrentPermissionsMissingUser()
        {
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.HttpContextWithUserId("user-id");
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
        public async Task TestGetCurrentPermissionsUnauthorized()
        {
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var result = await _userRoleController.GetCurrentPermissions(ProjId);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestCreateUserRole()
        {
            var userRole = UserRoleInProj();
            var result = (OkObjectResult)await _userRoleController.CreateUserRole(ProjId, userRole);
            Assert.That(result.Value, Is.InstanceOf<string>());
            userRole.Id = (string)result.Value;
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
            var user = await _userRepo.Create(new() { ProjectRoles = { [ProjId] = userRole.Id } });
            Assert.That(user, Is.Not.Null);
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.HttpContextWithUserId(user.Id);
            var projectRole = ProjectRoleInProj(Role.Editor);

            await _userRoleController.UpdateUserRole(user.Id, projectRole);
            var result = (OkObjectResult)await _userRoleController.GetCurrentPermissions(ProjId);
            Assert.That(result.Value, Is.InstanceOf<List<Permission>>());
            var updatedPermissions = (List<Permission>)result.Value;
            var expectedPermissions = ProjectRole.RolePermissions(projectRole.Role);
            Assert.That(updatedPermissions, Has.Count.EqualTo(expectedPermissions.Count));
            expectedPermissions.ForEach(p =>
            {
                Assert.That(updatedPermissions, Does.Contain(p));
            });
        }

        [Test]
        public async Task TestUpdateUserRoleCreateNew()
        {
            var user = await _userRepo.Create(new User());
            Assert.That(user, Is.Not.Null);
            var projectRole = ProjectRoleInProj(Role.Editor);

            await _userRoleController.UpdateUserRole(user.Id, projectRole);
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.HttpContextWithUserId(user.Id);
            var permissionsResult = (OkObjectResult)await _userRoleController.GetCurrentPermissions(ProjId);
            Assert.That(permissionsResult.Value, Is.InstanceOf<List<Permission>>());
            var updatedPermissions = (List<Permission>)permissionsResult.Value;
            var expectedPermissions = ProjectRole.RolePermissions(projectRole.Role);
            Assert.That(updatedPermissions, Has.Count.EqualTo(expectedPermissions.Count));
            expectedPermissions.ForEach(p =>
            {
                Assert.That(updatedPermissions, Does.Contain(p));
            });
        }

        [Test]
        public async Task TestUpdateUserRolesMissingUser()
        {
            var result = await _userRoleController.UpdateUserRole(MissingId, ProjectRoleInProj(Role.Editor));
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task TestUpdateUserRolesMissingUserEdit()
        {
            var user = await _userRepo.Create(new() { ProjectRoles = { [ProjId] = MissingId } });
            Assert.That(user, Is.Not.Null);
            Assert.That(user.ProjectRoles, Does.ContainKey(ProjId));

            var result = await _userRoleController.UpdateUserRole(user.Id, ProjectRoleInProj(Role.Editor));
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
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
            var user = await _userRepo.Create(new User { ProjectRoles = { [ProjId] = userRoleId } });
            Assert.That(user, Is.Not.Null);

            var result = await _userRoleController.UpdateUserRole(user.Id, ProjectRoleInProj(Role.Owner));
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
        }

        [Test]
        public async Task TestUpdateUserRolesFromOwner()
        {
            var userRoleId = (await _userRoleRepo.Create(UserRoleInProj(Role.Owner))).Id;
            var user = await _userRepo.Create(new User { ProjectRoles = { [ProjId] = userRoleId } });
            Assert.That(user, Is.Not.Null);

            var result = await _userRoleController.UpdateUserRole(user.Id, ProjectRoleInProj(Role.Administrator));
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
        }

        [Test]
        public async Task TestDeleteUserRole()
        {
            var userRole = UserRoleInProj();
            await _userRoleRepo.Create(userRole);
            var user = new User { ProjectRoles = { [ProjId] = userRole.Id } };
            await _userRepo.Create(user);
            Assert.That(user, Is.Not.Null);
            var userId = user.Id;

            Assert.That(await _userRoleRepo.GetAllUserRoles(ProjId), Has.Count.EqualTo(1));
            var fetchedUser = await _userRepo.GetUser(userId);
            Assert.That(fetchedUser, Is.Not.Null);
            Assert.That(fetchedUser.ProjectRoles, Does.ContainKey(ProjId));
            Assert.That(fetchedUser.ProjectRoles, Does.ContainValue(userRole.Id));

            await _userRoleController.DeleteUserRole(ProjId, userId);

            Assert.That(await _userRoleRepo.GetAllUserRoles(ProjId), Is.Empty);
            fetchedUser = await _userRepo.GetUser(userId);
            Assert.That(fetchedUser, Is.Not.Null);
            Assert.That(fetchedUser.ProjectRoles, Does.Not.ContainKey(ProjId));
            Assert.That(fetchedUser.ProjectRoles, Does.Not.ContainValue(userRole.Id));
        }

        [Test]
        public async Task TestDeleteUserRoleNoPermission()
        {
            _userRoleController.ControllerContext.HttpContext = PermissionServiceMock.UnauthorizedHttpContext();
            var userRole = await _userRoleRepo.Create(UserRoleInProj());
            var user = await _userRepo.Create(new User { ProjectRoles = { [ProjId] = userRole.Id } });
            Assert.That(user, Is.Not.Null);
            var result = await _userRoleController.DeleteUserRole(ProjId, user.Id);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestDeleteUserRoleOwner()
        {
            var userRole = await _userRoleRepo.Create(UserRoleInProj(Role.Owner));
            var user = await _userRepo.Create(new User { ProjectRoles = { [ProjId] = userRole.Id } });
            Assert.That(user, Is.Not.Null);
            var result = await _userRoleController.DeleteUserRole(ProjId, user.Id);
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
        }

        [Test]
        public async Task TestDeleteUserRoleMissingUser()
        {
            var result = await _userRoleController.DeleteUserRole(ProjId, MissingId);
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task TestDeleteUserRoleMissingRole()
        {
            var user = await _userRepo.Create(new() { ProjectRoles = { [ProjId] = MissingId } });
            Assert.That(user, Is.Not.Null);
            Assert.That(user.ProjectRoles, Does.ContainKey(ProjId));

            var result = await _userRoleController.DeleteUserRole(ProjId, user.Id);
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
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
            var oldOwner = await _userRepo.Create(new User { ProjectRoles = { [ProjId] = oldRole.Id } });
            Assert.That(oldOwner, Is.Not.Null);
            var newUser = await _userRepo.Create(new());
            Assert.That(newUser, Is.Not.Null);

            var result = await _userRoleController.ChangeOwner(ProjId, oldOwner.Id, newUser.Id);
            Assert.That(result, Is.InstanceOf<ForbidResult>());
        }

        [Test]
        public async Task TestChangeOwnerSameId()
        {
            var oldRole = await _userRoleRepo.Create(UserRoleInProj(Role.Owner));
            var oldOwner = await _userRepo.Create(new User { ProjectRoles = { [ProjId] = oldRole.Id } });
            Assert.That(oldOwner, Is.Not.Null);
            var newUser = await _userRepo.Create(new());
            Assert.That(newUser, Is.Not.Null);

            var result = await _userRoleController.ChangeOwner(ProjId, oldOwner.Id, oldOwner.Id);
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());

            result = await _userRoleController.ChangeOwner(ProjId, newUser.Id, newUser.Id);
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
        }

        [Test]
        public async Task TestChangeOwnerMissingUser()
        {
            var oldRole = await _userRoleRepo.Create(UserRoleInProj(Role.Owner));
            var oldOwner = await _userRepo.Create(new User { ProjectRoles = { [ProjId] = oldRole.Id } });
            Assert.That(oldOwner, Is.Not.Null);
            var newUser = await _userRepo.Create(new());
            Assert.That(newUser, Is.Not.Null);

            var result = await _userRoleController.ChangeOwner(ProjId, MissingId, newUser.Id);
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());

            result = await _userRoleController.ChangeOwner(ProjId, oldOwner.Id, MissingId);
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }

        [Test]
        public async Task TestChangeOwnerOldUserNotOwner()
        {
            var oldRole = await _userRoleRepo.Create(UserRoleInProj(Role.Editor));
            var oldEditor = await _userRepo.Create(new User { ProjectRoles = { [ProjId] = oldRole.Id } });
            Assert.That(oldEditor, Is.Not.Null);
            var oldMissing = await _userRepo.Create(new User { ProjectRoles = { [ProjId] = MissingId } });
            Assert.That(oldMissing, Is.Not.Null);
            var oldOther = await _userRepo.Create(new());
            Assert.That(oldOther, Is.Not.Null);
            var newUser = await _userRepo.Create(new());
            Assert.That(newUser, Is.Not.Null);

            var result = await _userRoleController.ChangeOwner(ProjId, oldEditor.Id, newUser.Id);
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());

            result = await _userRoleController.ChangeOwner(ProjId, oldMissing.Id, newUser.Id);
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());

            result = await _userRoleController.ChangeOwner(ProjId, oldOther.Id, newUser.Id);
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
        }

        [Test]
        public async Task TestChangeOwnerNewRole()
        {
            var oldRole = await _userRoleRepo.Create(UserRoleInProj(Role.Owner));
            var oldOwner = await _userRepo.Create(new User { ProjectRoles = { [ProjId] = oldRole.Id } });
            Assert.That(oldOwner, Is.Not.Null);
            var newUser = await _userRepo.Create(new());
            Assert.That(newUser, Is.Not.Null);

            var result = await _userRoleController.ChangeOwner(ProjId, oldOwner.Id, newUser.Id);
            Assert.That(result, Is.InstanceOf<OkResult>());

            var fetchedOldRole = await _userRoleRepo.GetUserRole(ProjId, oldRole.Id);
            Assert.That(fetchedOldRole, Is.Not.Null);
            Assert.That(fetchedOldRole.Role, Is.EqualTo(Role.Administrator));
            var fetchedNewUser = await _userRepo.GetUser(newUser.Id);
            Assert.That(fetchedNewUser, Is.Not.Null);
            var fetchedNewRole = await _userRoleRepo.GetUserRole(ProjId, fetchedNewUser.ProjectRoles[ProjId]);
            Assert.That(fetchedNewRole, Is.Not.Null);
            Assert.That(fetchedNewRole.Role, Is.EqualTo(Role.Owner));
        }

        [Test]
        public async Task TestChangeOwnerUpdateRole()
        {
            var oldRole = await _userRoleRepo.Create(UserRoleInProj(Role.Owner));
            var oldOwner = await _userRepo.Create(new User { ProjectRoles = { [ProjId] = oldRole.Id } });
            Assert.That(oldOwner, Is.Not.Null);
            var newRole = await _userRoleRepo.Create(UserRoleInProj());
            var newOwner = await _userRepo.Create(new User { ProjectRoles = { [ProjId] = newRole.Id } });
            Assert.That(newOwner, Is.Not.Null);

            var result = await _userRoleController.ChangeOwner(ProjId, oldOwner.Id, newOwner.Id);
            Assert.That(result, Is.InstanceOf<OkResult>());

            var fetchedOldRole = await _userRoleRepo.GetUserRole(ProjId, oldRole.Id);
            Assert.That(fetchedOldRole, Is.Not.Null);
            Assert.That(fetchedOldRole.Role, Is.EqualTo(Role.Administrator));
            var fetchedNewRole = await _userRoleRepo.GetUserRole(ProjId, newRole.Id);
            Assert.That(fetchedNewRole, Is.Not.Null);
            Assert.That(fetchedNewRole.Role, Is.EqualTo(Role.Owner));
        }
    }
}
