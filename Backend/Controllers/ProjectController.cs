using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson.IO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BackendFramework.Controllers
{
    [Authorize]
    [Produces("application/json")]
    [Route("v1/projects")]
    [EnableCors("AllowAll")]
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

        /// <summary> Returns all <see cref="Project"/>s </summary>
        /// <remarks> GET: v1/projects </remarks>
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            if (!_permissionService.IsProjectAuthenticated("6", HttpContext))
            {
                return new UnauthorizedResult();
            }
            return new ObjectResult(await _projectService.GetAllProjects());
        }

        /// <summary> Get a list of <see cref="User"/>s of a specific project </summary>
        /// <remarks> GET: v1/projects/{projectId}/users </remarks>
        /// <returns> A list of <see cref="User"/>s </returns>
        [HttpGet("{projectId}/users")]
        public async Task<IActionResult> GetAllUsers(string projectId)
        {
            if (!_permissionService.IsProjectAuthenticated("5", HttpContext))
            {
                return new UnauthorizedResult();
            }

            var allUsers = await _userService.GetAllUsers();
            var projectUsers = allUsers.FindAll(user => user.WorkedProjects.ContainsKey(projectId));

            return new ObjectResult(projectUsers);
        }
        
        /// <summary> Deletes all <see cref="Project"/>s </summary>
        /// <remarks> DELETE: v1/projects </remarks>
        /// <returns> true: if success, false: if there were no projects </returns>
        [HttpDelete]
        public async Task<IActionResult> Delete()
        {
#if DEBUG
            if (!_permissionService.IsProjectAuthenticated("6", HttpContext))
            {
                return new UnauthorizedResult();
            }
            return new ObjectResult(await _projectService.DeleteAllProjects());
#else
            return new UnauthorizedResult();
#endif
        }

        /// <summary> Returns <see cref="Project"/> with specified id </summary>
        /// <remarks> GET: v1/projects/{projectId} </remarks>
        [HttpGet("{projectId}")]
        public async Task<IActionResult> Get(string projectId)
        {
            if (!_permissionService.IsProjectAuthenticated("5", HttpContext))
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

        /// <summary> Creates a <see cref="Project"/> </summary>
        /// <remarks> POST: v1/projects </remarks>
        /// <returns> Id of created project </returns>
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] ProjectWithUser project)
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

            //Generate the userRoles and update the user
            currentUser.ProjectRoles.Add(project.Id, usersRole.Id);
            await _userService.Update(currentUserId, currentUser);
            //Generate the JWT based on those new userRoles
            currentUser = await _userService.MakeJWT(currentUser);
            await _userService.Update(currentUserId, currentUser);

            project.__UpdatedUser = currentUser;

            return new OkObjectResult(project);
        }

        /// <summary> Updates <see cref="Project"/> with specified id </summary>
        /// <remarks> PUT: v1/projects/{projectId} </remarks>
        /// <returns> Id of updated project </returns>
        [HttpPut("{projectId}")]
        public async Task<IActionResult> Put(string projectId, [FromBody] Project project)
        {
            if (!_permissionService.IsProjectAuthenticated("5", HttpContext))
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

        /// <summary> Updates <see cref="Project"/> with specified id with a new list of chars </summary>
        /// <remarks> PUT: v1/projects/{projectId} </remarks>
        [HttpPut("{projectId}/characters")]
        public async Task<IActionResult> PutChars(string projectId, [FromBody]Project project)
        {
            if (!_permissionService.IsProjectAuthenticated("3", HttpContext))
            {
                return new UnauthorizedResult();
            }

            var currentProj = await _projectService.GetProject(projectId);
            currentProj.ValidCharacters = project.ValidCharacters;
            currentProj.RejectedCharacters = project.RejectedCharacters;
            await _projectService.Update(projectId, currentProj);

            return new OkObjectResult(currentProj);
        }

        /// <summary> Deletes <see cref="Project"/> with specified id </summary>
        /// <remarks> DELETE: v1/projects/{projectId} </remarks>
        [HttpDelete("{projectId}")]
        public async Task<IActionResult> Delete(string projectId)
        {
            if (!_permissionService.IsProjectAuthenticated("6", HttpContext))
            {
                return new UnauthorizedResult();
            }

            if (await _projectService.Delete(projectId))
            {
                return new OkResult();
            }
            return new NotFoundResult();
        }

        /// <summary> UNUSED: Returns tree of <see cref="SemanticDomainWithSubdomains"/> for specified <see cref="Project"/> </summary>
        /// <remarks> GET: v1/projects/{projectId}/semanticdomains </remarks>
        [HttpGet("{projectId}/semanticdomains")]
        public async Task<IActionResult> GetSemDoms(string projectId)
        {
            if (!_permissionService.IsProjectAuthenticated("6", HttpContext))
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
            if (!_permissionService.IsProjectAuthenticated("5", HttpContext))
            {
                return new UnauthorizedResult();
            }

            var proj = _projectService.GetProject(projectId);
            if (proj == null)
            {
                return new NotFoundObjectResult(projectId);
            }

            //fetch the user -> fetch user role -> update user role
            var changeUser = await _userService.GetUser(userId);
            var userRoleId = changeUser.ProjectRoles[projectId];
            var userRole = await _userRoleService.GetUserRole(projectId, userRoleId);
            userRole.Permissions = permissions;

            await _userRoleService.Update(userRoleId, userRole);

            return new OkObjectResult(userRole);
        }

    }

    public class ProjectWithUser : Project
    {
        public User __UpdatedUser;

        public ProjectWithUser() { }

        public ProjectWithUser(Project baseObj)
        {
            Id = baseObj.Id;
            Name = baseObj.Name;
            PartsOfSpeech = baseObj.PartsOfSpeech;
            RejectedCharacters = baseObj.RejectedCharacters;
            SemanticDomains = baseObj.SemanticDomains;
            VernacularWritingSystem = baseObj.VernacularWritingSystem;
            WordFields = baseObj.WordFields;
            AnalysisWritingSystems = baseObj.AnalysisWritingSystems;
            CustomFields = baseObj.CustomFields;
            ValidCharacters = baseObj.ValidCharacters;
        }
    }
}
