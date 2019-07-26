using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace BackendFramework.Controllers
{
    [Authorize]
    [Produces("application/json")]
    [Route("v1/projects/{projectId}/userroles")]
    public class UserRoleController : Controller
    {
        private readonly IUserRoleService _userRoleService;
        private readonly IProjectService _projectService;
        private readonly IPermissionService _permissionService;

        public UserRoleController(IUserRoleService userRoleService, IProjectService projectService, IPermissionService permissionService)
        {
            _userRoleService = userRoleService;
            _projectService = projectService;
            _permissionService = permissionService;
        }

        [EnableCors("AllowAll")]

        // GET: v1/Projects/{projectId}/UserRoles
        // Implements GetAllUserRoles()
        [HttpGet]
        public async Task<IActionResult> Get(string projectId)
        {
            if (!_permissionService.IsAuthenticated("1", HttpContext))
            {
                return new UnauthorizedResult();
            }

            var proj = _projectService.GetProject(projectId);
            if (proj == null)
            {
                return new NotFoundObjectResult(projectId);
            }

            return new ObjectResult(await _userRoleService.GetAllUserRoles(projectId));
        }

        // DELETE v1/Projects/{projectId}/UserRoles
        // Implements DeleteAllUserRoles()
        // DEBUG ONLY
        [HttpDelete]
        public async Task<IActionResult> Delete(string projectId)
        {
            if (!_permissionService.IsAuthenticated("6", HttpContext))
            {
                return new UnauthorizedResult();
            }

#if DEBUG
            var proj = _projectService.GetProject(projectId);
            if (proj == null)
            {
                return new NotFoundObjectResult(projectId);
            }

            return new ObjectResult(await _userRoleService.DeleteAllUserRoles(projectId));
#else
            return new UnauthorizedResult();
#endif
        }

        // GET: v1/Projects/{projectId}/UserRoles/{userRoleId}
        // Implements GetUserRole(), Arguments: string id of target userRole
        [HttpGet("{userRoleId}")]
        public async Task<IActionResult> Get(string projectId, string userRoleId)
        {
            if (!_permissionService.IsAuthenticated("1", HttpContext))
            {
                return new UnauthorizedResult();
            }

            var proj = _projectService.GetProject(projectId);
            if (proj == null)
            {
                return new NotFoundObjectResult(projectId);
            }

            var userRole = await _userRoleService.GetUserRole(projectId, userRoleId);
            if (userRole == null)
            {
                return new NotFoundObjectResult(userRoleId);
            }
            return new ObjectResult(userRole);
        }

        // POST v1/Projects/{projectId}/UserRoles
        // Implements Create()
        [HttpPost]
        public async Task<IActionResult> Post(string projectId, [FromBody]UserRole userRole)
        {
            if (!_permissionService.IsAuthenticated("5", HttpContext))
            {
                return new UnauthorizedResult();
            }

            var proj = _projectService.GetProject(projectId);
            if (proj == null)
            {
                return new NotFoundObjectResult(projectId);
            }

            var returnUserRole = await _userRoleService.Create(userRole);
            if (returnUserRole == null)
            {
                return BadRequest();
            }

            return new OkObjectResult(userRole.Id);
        }

        // DELETE: v1/Projects/{projectId}/UserRoles/{userRoleId}
        // Implements Delete(), Arguments: string id of target userRole
        [HttpDelete("{userRoleId}")]
        public async Task<IActionResult> Delete(string projectId, string userRoleId)
        {
            if (!_permissionService.IsAuthenticated("6", HttpContext))
            {
                return new UnauthorizedResult();
            }

            var proj = _projectService.GetProject(projectId);
            if (proj == null)
            {
                return new NotFoundObjectResult(projectId);
            }

            if (await _userRoleService.Delete(projectId, userRoleId))
            {
                return new OkResult();
            }
            return new NotFoundObjectResult(userRoleId);
        }

        // PUT: v1/Projects/{projectId}/UserRoles/{userRoleId}
        // Implements Update()
        [HttpPut("{userRoleId}")]
        public async Task<IActionResult> Put(string projectId, string userRoleId, [FromBody] UserRole userRole)
        {
            if (!_permissionService.IsAuthenticated("5", HttpContext))
            {
                return new UnauthorizedResult();
            }

            var proj = _projectService.GetProject(projectId);
            if (proj == null)
            {
                return new NotFoundObjectResult(projectId);
            }

            var result = await _userRoleService.Update(userRoleId, userRole);
            if (result == ResultOfUpdate.NotFound)
            {
                return new NotFoundObjectResult(userRoleId);
            }
            else if(result == ResultOfUpdate.Updated)
            {
                return new OkObjectResult(userRoleId);
            }
            else
            {
                return new StatusCodeResult(304);
            }
        }
    }
}
