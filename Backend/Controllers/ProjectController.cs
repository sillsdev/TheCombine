using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BackendFramework.Controllers
{
    [Authorize]
    [Produces("application/json")]
    [Route("v1/projects")]
    public class ProjectController : Controller
    {
        private readonly IProjectService _projectService;
        private readonly ISemDomParser _semDomParser;
        private readonly IUserRoleService _userRoleService;
        private readonly IUserService _userService;
        private readonly IPermissionService _permissionService;

        public ProjectController(IProjectService projectService, ISemDomParser semDomParser, IUserRoleService userRoleService, IUserService userService, IPermissionService permissionService)
        {
            _projectService = projectService;
            _semDomParser = semDomParser;
            _userRoleService = userRoleService;
            _userService = userService;
            _permissionService = permissionService;
        }

        [EnableCors("AllowAll")]
        // GET: v1/Project/
        // Implements GetAllProjects(), 
        // Arguments: 
        // Default: null
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            if (!_permissionService.IsAuthenticated("6", HttpContext))
            {
                return new UnauthorizedResult();
            }
            return new ObjectResult(await _projectService.GetAllProjects());
        }

        // GET: v1/Project/
        // Implements GetAllUsers(), 
        // Arguments: 
        // Default: null
        [HttpGet("{projectId}/users")]
        public async Task<IActionResult> GetAllUsers(string projectId)
        {
            if (!_permissionService.IsAuthenticated("6", HttpContext))
            {
                return new UnauthorizedResult();
            }

            var allUsers = await _userService.GetAllUsers();
            var projectUsers = allUsers.FindAll(user => user.WorkedProjects.ContainsKey(projectId));

            return new ObjectResult(projectUsers);
        }


        // DELETE v1/Project/
        // Implements DeleteAllProjects()
        // DEBUG ONLY
        [HttpDelete]
        public async Task<IActionResult> Delete()
        {
            if (!_permissionService.IsAuthenticated("6", HttpContext))
            {
                return new UnauthorizedResult();
            }
#if DEBUG
            return new ObjectResult(await _projectService.DeleteAllProjects());
#else
            return new UnauthorizedResult();
#endif
        }

        // GET: v1/Project/{projectId}
        // Implements GetProject(), Arguments: string id 
        [HttpGet("{projectId}")]
        public async Task<IActionResult> Get(string projectId)
        {
            if (!_permissionService.IsAuthenticated("5", HttpContext))
            {
                return new UnauthorizedResult();
            }
            var project = await _projectService.GetProject(projectId);
            if (project == null)
            {
                return new NotFoundResult();
            }
            return new ObjectResult(project);
        }

        // POST: v1/Project/
        // Implements Create(), Arguments: new project from body
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] Project project)
        {

            await _projectService.Create(project);

            //get user 
            var currentUserId = _permissionService.GetUserId(HttpContext);
            var currentUser = await _userService.GetUser(currentUserId);

            //give admin privilages
            UserRole usersRole = new UserRole();
            usersRole.Permissions = new List<int>() { (int)Permission.EditSettingsNUsers, (int)Permission.ImportExport, (int)Permission.MergeNCharSet, (int)Permission.Unused, (int)Permission.WordEntry };
            usersRole.ProjectId = project.Id;

            usersRole = await _userRoleService.Create(usersRole);

            //update user with userRole
            if (currentUser.ProjectRoles.Equals(null))
            {
                currentUser.ProjectRoles = new Dictionary<string, string>();
            }

            currentUser.ProjectRoles.Add(project.Id, usersRole.Id);
            var result = await _userService.Update(currentUserId, currentUser);

            return new OkObjectResult(project.Id);
        }

        // PUT: v1/Project/{projectId}
        // Implements Update(), Arguments: string id of target project, new project from body
        [HttpPut("{projectId}")]
        public async Task<IActionResult> Put(string projectId, [FromBody] Project project)
        {
            if (!_permissionService.IsAuthenticated("5", HttpContext))
            {
                return new UnauthorizedResult();
            }

            var result = await _projectService.Update(projectId, project);
            if (result == ResultOfUpdate.NotFound)
            {
                return new NotFoundObjectResult(projectId);
            }
            else if (result == ResultOfUpdate.Updated)
            {
                return new OkObjectResult(projectId);
            }
            else
            {
                return new StatusCodeResult(304);
            }
        }

        // PUT: v1/Project/{projectId}
        // Implements Update(), Arguments: string id of target project, new project from body
        [HttpPut("{projectId}")]
        public async Task<IActionResult> Put(string projectId, [FromBody]List<string> chars)
        {
            if (!_permissionService.IsAuthenticated("3", HttpContext))
            {
                return new UnauthorizedResult();
            }

            var currentProj = await _projectService.GetProject(projectId);
            currentProj.ValidCharacters = chars;
            _projectService.Update(projectId, currentProj);

            return new OkObjectResult(currentProj);
        }

        // DELETE: v1/Project/Projects/{projectId}
        // Implements Delete(), Arguments: string id of target project
        [HttpDelete("{projectId}")]
        public async Task<IActionResult> Delete(string projectId)
        {
            if (!_permissionService.IsAuthenticated("6", HttpContext))
            {
                return new UnauthorizedResult();
            }

            if (await _projectService.Delete(projectId))
            {
                return new OkResult();
            }
            return new NotFoundResult();
        }

        [HttpGet("{projectId}/semanticdomains")]
        public async Task<IActionResult> GetSemDoms(string projectId)
        {
            if (!_permissionService.IsAuthenticated("6", HttpContext))
            {
                return new UnauthorizedResult();
            }

            try
            {
                var result = await _semDomParser.ParseSemanticDomains(projectId);
                return new OkObjectResult(result);
            }
            catch
            {
                return new NotFoundResult();
            }
        }

        //change user role using project Id
        [HttpPut("{projectId}/users/{userId}")]
        public async Task<IActionResult> UpdateUserRole(string projectId, string userId, [FromBody]List<int> permissions)
        {
            if (!_permissionService.IsAuthenticated("5", HttpContext))
            {
                return new UnauthorizedResult();
            }

            var isValid = _projectService.GetProject(projectId);
            if (isValid == null)
            {
                return new NotFoundObjectResult(projectId);
            }

            //fetch the user -> fetch user role -> update user role
            var changeUser = await _userService.GetUser(userId);
            var userRoleId = changeUser.ProjectRoles[projectId];
            var userRole = await _userRoleService.GetUserRole(projectId, userRoleId);
            userRole.Permissions.AddRange(permissions);

            await _userRoleService.Update(userRoleId, userRole);

            return new OkObjectResult(userRole);
        }

    }
}
