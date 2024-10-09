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
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry, projectId))
            {
                return Forbid();
            }

            // Ensure project exists
            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return NotFound(projectId);
            }

            return Ok(await _userRoleRepo.GetAllUserRoles(projectId));
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

        /// <summary> Returns whether current user has specified permission in current project </summary>
        [HttpPost("permission", Name = "HasPermission")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(bool))]
        public async Task<IActionResult> HasPermission(string projectId, [FromBody, BindRequired] Permission perm)
        {
            return Ok(await _permissionService.HasProjectPermission(HttpContext, perm, projectId));
        }

        /// <summary> Returns <see cref="UserRole"/> with specified id </summary>
        [HttpGet("current", Name = "GetCurrentPermissions")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<Permission>))]
        public async Task<IActionResult> GetCurrentPermissions(string projectId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry, projectId))
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

            if (!user.ProjectRoles.TryGetValue(projectId, out var roleId))
            {
                return Ok(new List<Permission>());
            }
            var userRole = await _userRoleRepo.GetUserRole(projectId, roleId);
            if (userRole is null)
            {
                return Ok(new List<Permission>());
            }

            return Ok(ProjectRole.RolePermissions(userRole.Role));
        }

        /// <summary> Creates a <see cref="UserRole"/> </summary>
        /// <returns> Id of updated UserRole </returns>
        [HttpPost(Name = "CreateUserRole")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        public async Task<IActionResult> CreateUserRole(string projectId, [FromBody, BindRequired] UserRole userRole)
        {
            if (!await _permissionService.HasProjectPermission(
                HttpContext, Permission.DeleteEditSettingsAndUsers, projectId))
            {
                return Forbid();
            }

            if (!await _permissionService.ContainsProjectRole(HttpContext, userRole.Role, projectId))
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

            // Prevent a second project owner
            if (userRole.Role == Role.Owner
                && (await _userRoleRepo.GetAllUserRoles(projectId)).Any((role) => role.Role == Role.Owner))
            {
                return Forbid("This project already has an owner");
            }

            await _userRoleRepo.Create(userRole);
            return Ok(userRole.Id);
        }

        /// <summary> Deletes the <see cref="UserRole"/> for the specified projectId and userId </summary>
        [HttpDelete("{userId}", Name = "DeleteUserRole")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(bool))]
        public async Task<IActionResult> DeleteUserRole(string projectId, string userId)
        {
            if (!await _permissionService.HasProjectPermission(
                HttpContext, Permission.DeleteEditSettingsAndUsers, projectId))
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
            var userRole = await _userRoleRepo.GetUserRole(projectId, userRoleId);
            if (userRole is null)
            {
                return NotFound(userRoleId);
            }

            // Prevent deleting the project owner.
            if (userRole.Role == Role.Owner)
            {
                return Forbid("Cannot use this function to remove the project owner's role");
            }

            // Prevent deleting role of another user who has more permissions than the actor.
            if (!await _permissionService.ContainsProjectRole(HttpContext, userRole.Role, projectId))
            {
                return Forbid();
            }

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
            if (!await _permissionService.HasProjectPermission(
                HttpContext, Permission.DeleteEditSettingsAndUsers, projectId))
            {
                return Forbid();
            }

            // Prevent making a new project owner.
            if (projectRole.Role == Role.Owner)
            {
                return Forbid("Cannot use this function to give a user the project owner role");
            }
            // Prevent upgrading another user to have more permissions than the actor.
            if (!await _permissionService.ContainsProjectRole(HttpContext, projectRole.Role, projectId))
            {
                return Forbid();
            }

            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return NotFound(projectId);
            }

            // Fetch the user -> fetch user role -> update user role
            var changeUser = await _userRepo.GetUser(userId, false);
            if (changeUser is null)
            {
                return NotFound(userId);
            }

            if (!changeUser.ProjectRoles.TryGetValue(projectId, out var userRoleId))
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

            // Prevent downgrading the project owner.
            if (userRole.Role == Role.Owner)
            {
                return Forbid("Cannot use this function to change the project owner's role");
            }
            // Prevent downgrading another user who has more permissions than the actor.
            if (!await _permissionService.ContainsProjectRole(HttpContext, userRole.Role, projectId))
            {
                return Forbid();
            }

            userRole.Role = projectRole.Role;
            var result = await _userRoleRepo.Update(userRoleId, userRole);
            return result switch
            {
                ResultOfUpdate.NotFound => NotFound(userRoleId),
                ResultOfUpdate.Updated => Ok(userRoleId),
                _ => StatusCode(StatusCodes.Status304NotModified, userRoleId)
            };
        }

        /// <summary>
        /// Change project owner from user with first specified id to user with second specified id.
        /// Can only be used by the project owner or a site admin.
        /// </summary>
        /// <returns> Id of updated UserRole </returns>
        [HttpGet("changeowner/{oldUserId}/{newUserId}", Name = "ChangeOwner")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        public async Task<IActionResult> ChangeOwner(string projectId, string oldUserId, string newUserId)
        {
            // Ensure the actor has sufficient permission to change project owner
            if (!await _permissionService.ContainsProjectRole(HttpContext, Role.Owner, projectId))
            {
                return Forbid();
            }

            // Ensure that the old and new owners' ids are different
            if (oldUserId.Equals(newUserId, System.StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest($"the user ids for the old and new owners should be different");
            }

            // Ensure the project exists
            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return NotFound(projectId);
            }

            // Fetch the users
            var oldOwner = await _userRepo.GetUser(oldUserId, false);
            if (oldOwner is null)
            {
                return NotFound(oldUserId);
            }
            var newOwner = await _userRepo.GetUser(newUserId, false);
            if (newOwner is null)
            {
                return NotFound(newUserId);
            }

            // Ensure that the user from whom ownership is being moved is the owner
            if (!oldOwner.ProjectRoles.TryGetValue(projectId, out var oldRoleId))
            {
                return BadRequest($"{oldUserId} is not a project user");
            }
            var oldUserRole = await _userRoleRepo.GetUserRole(projectId, oldRoleId);
            if (oldUserRole is null || oldUserRole.Role != Role.Owner)
            {
                return BadRequest($"{oldUserId} is not the project owner");
            }

            // Add or update the role of the new owner
            ResultOfUpdate newResult;
            if (!newOwner.ProjectRoles.TryGetValue(projectId, out var newRoleId))
            {
                // Generate the userRole
                var newUsersRole = new UserRole { ProjectId = projectId, Role = Role.Owner };
                newUsersRole = await _userRoleRepo.Create(newUsersRole);
                newRoleId = newUsersRole.Id;

                // Update the user
                newOwner.ProjectRoles.Add(projectId, newRoleId);
                newResult = await _userRepo.Update(newOwner.Id, newOwner);
            }
            else
            {
                // Update the user role
                var newUsersRole = await _userRoleRepo.GetUserRole(projectId, newRoleId);
                if (newUsersRole is null)
                {
                    return NotFound(newRoleId);
                }
                newUsersRole.Role = Role.Owner;
                newResult = await _userRoleRepo.Update(newRoleId, newUsersRole);
            }
            if (newResult != ResultOfUpdate.Updated)
            {
                return StatusCode(StatusCodes.Status304NotModified, newRoleId);
            };

            // Change the old owner to a project admin
            oldUserRole.Role = Role.Administrator;
            var oldResult = await _userRoleRepo.Update(oldRoleId, oldUserRole);
            return oldResult switch
            {
                ResultOfUpdate.Updated => Ok(oldUserRole),
                _ => StatusCode(StatusCodes.Status304NotModified, oldUserRole)
            };
        }
    }
}
