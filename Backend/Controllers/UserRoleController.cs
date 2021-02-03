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
        private readonly IUserRoleService _userRoleService;
        private readonly IProjectService _projectService;
        private readonly IPermissionService _permissionService;

        public UserRoleController(IUserRoleService userRoleService, IProjectService projectService,
            IPermissionService permissionService)
        {
            _userRoleService = userRoleService;
            _projectService = projectService;
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
            var proj = await _projectService.GetProject(projectId);
            if (proj is null)
            {
                return new NotFoundObjectResult(projectId);
            }

            return new ObjectResult(await _userRoleService.GetAllUserRoles(projectId));
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
            var proj = await _projectService.GetProject(projectId);
            if (proj is null)
            {
                return new NotFoundObjectResult(projectId);
            }

            return new ObjectResult(await _userRoleService.DeleteAllUserRoles(projectId));
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
            var proj = await _projectService.GetProject(projectId);
            if (proj is null)
            {
                return new NotFoundObjectResult(projectId);
            }

            var userRole = await _userRoleService.GetUserRole(projectId, userRoleId);
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
            var proj = await _projectService.GetProject(projectId);
            if (proj is null)
            {
                return new NotFoundObjectResult(projectId);
            }

            await _userRoleService.Create(userRole);
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
            var proj = await _projectService.GetProject(projectId);
            if (proj is null)
            {
                return new NotFoundObjectResult(projectId);
            }

            if (await _userRoleService.Delete(projectId, userRoleId))
            {
                return new OkResult();
            }
            return new NotFoundObjectResult(userRoleId);
        }

        /// <summary> Updates <see cref="UserRole"/> with specified id </summary>
        /// <remarks> PUT: v1/projects/{projectId}/userroles/{userRoleId} </remarks>
        /// <returns> Id of updated UserRole </returns>
        [HttpPut("{userRoleId}")]
        public async Task<IActionResult> Put(string projectId, string userRoleId, [FromBody] UserRole userRole)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.DeleteEditSettingsAndUsers))
            {
                return new ForbidResult();
            }

            // Ensure project exists
            var proj = await _projectService.GetProject(projectId);
            if (proj is null)
            {
                return new NotFoundObjectResult(projectId);
            }

            var result = await _userRoleService.Update(userRoleId, userRole);
            return result switch
            {
                ResultOfUpdate.NotFound => new NotFoundObjectResult(userRoleId),
                ResultOfUpdate.Updated => new OkObjectResult(userRoleId),
                _ => new StatusCodeResult(304)
            };
        }
    }
}
