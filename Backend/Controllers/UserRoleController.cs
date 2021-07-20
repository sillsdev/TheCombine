using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace BackendFramework.Controllers
{
    [Authorize]
    [Produces("application/json")]
    [Route("v1/projects/{projectId}/userroles")]
    [EnableCors("AllowAll")]
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

        /// <summary> Returns <see cref="UserRole"/> with specified id </summary>
        [HttpGet("{userRoleId}", Name = "GetUserRole")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(UserRole))]
        public async Task<IActionResult> GetUserRole(string projectId, string userRoleId)
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

            var userRole = await _userRoleRepo.GetUserRole(projectId, userRoleId);
            if (userRole is null)
            {
                return NotFound(userRoleId);
            }

            return Ok(userRole);
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

        /// <summary> Deletes <see cref="UserRole"/> with specified id </summary>
        [HttpDelete("{userRoleId}", Name = "DeleteUserRole")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> DeleteUserRole(string projectId, string userRoleId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.Owner))
            {
                return Forbid();
            }

            // Ensure project exists
            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return NotFound(projectId);
            }

            if (await _userRoleRepo.Delete(projectId, userRoleId))
            {
                return Ok();
            }
            return NotFound(userRoleId);
        }

        /// <summary>
        /// Updates permissions of <see cref="UserRole"/> for <see cref="Project"/> with specified projectId
        /// and <see cref="User"/> with specified userId.
        /// </summary>
        /// <returns> Id of updated UserRole </returns>
        [HttpPut("{userId}", Name = "UpdateUserRolePermissions")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        public async Task<IActionResult> UpdateUserRolePermissions(
            string projectId, string userId, [FromBody, BindRequired] Permission[] permissions)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.DeleteEditSettingsAndUsers))
            {
                return Forbid();
            }

            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return NotFound(projectId);
            }

            // Fetch the user -> fetch user role -> update user role
            var changeUser = await _userRepo.GetUser(userId);
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

            userRole.Permissions = new List<Permission>(permissions);

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
