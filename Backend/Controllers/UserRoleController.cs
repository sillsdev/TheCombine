using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace BackendFramework.Controllers
{
    [Authorize]
    [Produces("application/json")]
    [Route("v1/projects/{projectId}/userroles")]
    public class UserRoleController : Controller
    {
        private readonly IProjectRepository _projRepo;
        private readonly IUserRepository _userRepo;
        private readonly IUserRoleRepository _userRoleRepo;
        private readonly IPermissionService _permissionService;

        public UserRoleController(IUserRepository userRepo, IUserRoleRepository userRoleRepo,
            IProjectRepository projRepo, IPermissionService permissionService)
        {
            _projRepo = projRepo;
            _userRepo = userRepo;
            _userRoleRepo = userRoleRepo;
            _permissionService = permissionService;
        }

        /// <summary> Returns all <see cref="UserRole"/>s for specified <see cref="Project"/></summary>
        [HttpGet(Name = "GetProjectUserRoles")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<UserRole>))]
        public async Task<IActionResult> GetProjectUserRoles(string projectId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return Forbid();
            }

            // Ensure project exists
            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return NotFound(projectId);
            }

            var userRoles = await _userRoleRepo.GetAllUserRoles(projectId);
            userRoles.ForEach(ur => ur.Role ??= ProjectRole.PermissionsRole(ur.Permissions));
            return Ok(userRoles);
        }

        /// <summary> Deletes all <see cref="UserRole"/>s for specified <see cref="Project"/></summary>
        /// <returns> true: if success, false: if there were no UserRoles </returns>
        [HttpDelete(Name = "DeleteProjectUserRoles")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(bool))]
        public async Task<IActionResult> DeleteProjectUserRoles(string projectId)
        {
            if (!await _permissionService.IsSiteAdmin(HttpContext))
            {
                return Forbid();
            }

            // Ensure project exists
            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return NotFound(projectId);
            }

            return Ok(await _userRoleRepo.DeleteAllUserRoles(projectId));
        }

        /// <summary> Returns <see cref="UserRole"/> with specified id </summary>
        [HttpGet("current", Name = "GetCurrentPermissions")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<Permission>))]
        public async Task<IActionResult> GetCurrentPermissions(string projectId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return Forbid();
            }

            var userId = _permissionService.GetUserId(HttpContext);
            if (string.IsNullOrWhiteSpace(userId))
            {
                return Forbid();
            }

            // Ensure project exists
            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return NotFound($"project: {projectId}");
            }

            // Ensure user exists
            var user = await _userRepo.GetUser(userId);
            if (user is null)
            {
                return NotFound($"user: {userId}");
            }

            var userRoleId = user.ProjectRoles[projectId];
            if (userRoleId is null)
            {
                return Ok(new List<Permission>());
            }
            var userRole = await _userRoleRepo.GetUserRole(projectId, userRoleId);
            if (userRole is null)
            {
                return Ok(new List<Permission>());
            }

            userRole.Role ??= ProjectRole.PermissionsRole(userRole.Permissions);
            return Ok(ProjectRole.RolePermissions((Role)userRole.Role));
        }

        /// <summary> Creates a <see cref="UserRole"/> </summary>
        /// <returns> Id of updated UserRole </returns>
        [HttpPost(Name = "CreateUserRole")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        public async Task<IActionResult> CreateUserRole(string projectId, [FromBody, BindRequired] UserRole userRole)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.DeleteEditSettingsAndUsers))
            {
                return Forbid();
            }

            if (userRole.Role is not null)
            {
                userRole.Permissions = ProjectRole.RolePermissions((Role)userRole.Role);
            }
            // User cannot give permissions they don't have.
            if (userRole.Permissions.Any(permission =>
                !_permissionService.HasProjectPermission(HttpContext, permission, projectId)))
            {
                return Forbid();
            }

            userRole.ProjectId = projectId;

            // Ensure project exists
            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return NotFound(projectId);
            }

            await _userRoleRepo.Create(userRole);
            return Ok(userRole.Id);
        }

        /// <summary> Deletes the <see cref="UserRole"/> for the specified projectId and userId </summary>
        [HttpDelete("{userId}", Name = "DeleteUserRole")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(bool))]
        public async Task<IActionResult> DeleteUserRole(string projectId, string userId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.DeleteEditSettingsAndUsers))
            {
                return Forbid();
            }

            // Ensure project exists
            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return NotFound(projectId);
            }

            // Fetch the user -> fetch user role -> remove project from user's project roles
            var changeUser = await _userRepo.GetUser(userId, false);
            if (changeUser is null)
            {
                return NotFound(userId);
            }
            var userRoleId = changeUser.ProjectRoles[projectId];
            changeUser.ProjectRoles.Remove(projectId);
            await _userRepo.Update(changeUser.Id, changeUser);
            var userRoleRepoResult = await _userRoleRepo.Delete(projectId, userRoleId);
            return Ok(userRoleRepoResult);
        }

        /// <summary>
        /// Updates permissions of <see cref="UserRole"/> for <see cref="Project"/> with specified projectId
        /// and <see cref="User"/> with specified userId.
        /// </summary>
        /// <returns> Id of updated UserRole </returns>
        [HttpPut("{userId}", Name = "UpdateUserRole")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        public async Task<IActionResult> UpdateUserRole(
            string userId, [FromBody, BindRequired] ProjectRole projectRole)
        {
            var projectId = projectRole.ProjectId;
            if (!_permissionService.HasProjectPermission(
                HttpContext, Permission.DeleteEditSettingsAndUsers, projectId))
            {
                return Forbid();
            }

            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return NotFound(projectId);
            }

            var permissions = ProjectRole.RolePermissions(projectRole.Role);
            // User cannot give permissions they don't have.
            if (permissions.Any(permission =>
                !_permissionService.HasProjectPermission(HttpContext, permission, projectId)))
            {
                return Forbid();
            }

            // Fetch the user -> fetch user role -> update user role
            var changeUser = await _userRepo.GetUser(userId, false);
            if (changeUser is null)
            {
                return NotFound(userId);
            }

            string userRoleId;
            if (changeUser.ProjectRoles.ContainsKey(projectId))
            {
                userRoleId = changeUser.ProjectRoles[projectId];
            }
            else
            {
                // Generate the userRole
                var usersRole = new UserRole { ProjectId = projectId };
                usersRole = await _userRoleRepo.Create(usersRole);
                userRoleId = usersRole.Id;

                // Update the user
                changeUser.ProjectRoles.Add(projectId, userRoleId);
                await _userRepo.Update(changeUser.Id, changeUser);
            }
            var userRole = await _userRoleRepo.GetUserRole(projectId, userRoleId);
            if (userRole is null)
            {
                return NotFound(userRoleId);
            }

            userRole.Permissions = ProjectRole.RolePermissions(projectRole.Role);
            userRole.Role = projectRole.Role;
            var result = await _userRoleRepo.Update(userRoleId, userRole);
            return result switch
            {
                ResultOfUpdate.NotFound => NotFound(userRoleId),
                ResultOfUpdate.Updated => Ok(userRoleId),
                _ => StatusCode(StatusCodes.Status304NotModified, userRoleId)
            };
        }
    }
}
