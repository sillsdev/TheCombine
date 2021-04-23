using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

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
        /// <remarks> GET: v1/projects/{projectId}/userroles </remarks>
        [HttpGet]
        public async Task<IActionResult> Get(string projectId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return new ForbidResult();
            }

            // Ensure project exists
            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return new NotFoundObjectResult(projectId);
            }

            return new ObjectResult(await _userRoleRepo.GetAllUserRoles(projectId));
        }

        /// <summary> Deletes all <see cref="UserRole"/>s for specified <see cref="Project"/></summary>
        /// <remarks> DELETE: v1/projects/{projectId}/userroles </remarks>
        /// <returns> true: if success, false: if there were no UserRoles </returns>
        [HttpDelete]
        public async Task<IActionResult> Delete(string projectId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.DatabaseAdmin))
            {
                return new ForbidResult();
            }

            // Ensure project exists
            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return new NotFoundObjectResult(projectId);
            }

            return new ObjectResult(await _userRoleRepo.DeleteAllUserRoles(projectId));
        }

        /// <summary> Returns <see cref="UserRole"/> with specified id </summary>
        /// <remarks> GET: v1/projects/{projectId}/userroles/{userRoleId} </remarks>
        [HttpGet("{userRoleId}")]
        public async Task<IActionResult> Get(string projectId, string userRoleId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return new ForbidResult();
            }

            // Ensure project exists
            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return new NotFoundObjectResult(projectId);
            }

            var userRole = await _userRoleRepo.GetUserRole(projectId, userRoleId);
            if (userRole is null)
            {
                return new NotFoundObjectResult(userRoleId);
            }

            return new ObjectResult(userRole);
        }

        /// <summary> Creates a <see cref="UserRole"/> </summary>
        /// <remarks> POST: v1/projects/{projectId}/userroles </remarks>
        /// <returns> Id of updated UserRole </returns>
        [HttpPost]
        public async Task<IActionResult> Post(string projectId, [FromBody] UserRole userRole)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.DeleteEditSettingsAndUsers))
            {
                return new ForbidResult();
            }

            userRole.ProjectId = projectId;

            // Ensure project exists
            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return new NotFoundObjectResult(projectId);
            }

            await _userRoleRepo.Create(userRole);
            return new OkObjectResult(userRole.Id);
        }

        /// <summary> Deletes <see cref="UserRole"/> with specified id </summary>
        /// <remarks> DELETE: v1/projects/{projectId}/userroles/{userRoleId} </remarks>
        [HttpDelete("{userRoleId}")]
        public async Task<IActionResult> Delete(string projectId, string userRoleId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.DatabaseAdmin))
            {
                return new ForbidResult();
            }

            // Ensure project exists
            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return new NotFoundObjectResult(projectId);
            }

            if (await _userRoleRepo.Delete(projectId, userRoleId))
            {
                return new OkResult();
            }
            return new NotFoundObjectResult(userRoleId);
        }

        /// <summary>
        /// Updates permissions of <see cref="UserRole"/> for <see cref="Project"/> with specified projectId
        /// and <see cref="User"/> with specified userId.
        /// </summary>
        /// <remarks> PUT: v1/projects/{projectId}/userroles/{userId} </remarks>
        /// <returns> Id of updated UserRole </returns>
        [HttpPut("{userId}")]
        public async Task<IActionResult> UpdateUserRole(string projectId, string userId, [FromBody] int[] permissions)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.DeleteEditSettingsAndUsers))
            {
                return new ForbidResult();
            }

            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return new NotFoundObjectResult(projectId);
            }

            // Fetch the user -> fetch user role -> update user role
            var changeUser = await _userRepo.GetUser(userId);
            if (changeUser is null)
            {
                return new NotFoundObjectResult(userId);
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
                return new NotFoundObjectResult(userRoleId);
            }

            userRole.Permissions = new List<int>(permissions);

            var result = await _userRoleRepo.Update(userRoleId, userRole);
            return result switch
            {
                ResultOfUpdate.NotFound => new NotFoundObjectResult(userId),
                ResultOfUpdate.Updated => new OkObjectResult(userId),
                _ => new StatusCodeResult((int)HttpStatusCode.NotModified)
            };
        }
    }
}
