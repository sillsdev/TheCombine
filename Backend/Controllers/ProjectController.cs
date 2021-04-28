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
    [Route("v1/projects")]
    [EnableCors("AllowAll")]
    public class ProjectController : Controller
    {
        private readonly IProjectRepository _projRepo;
        private readonly IUserRepository _userRepo;
        private readonly IUserRoleRepository _userRoleRepo;
        private readonly IPermissionService _permissionService;
        private readonly ISemanticDomainService _semDomService;

        public ProjectController(IProjectRepository projRepo, ISemanticDomainService semDomService,
            IUserRoleRepository userRoleRepo, IUserRepository userRepo, IPermissionService permissionService)
        {
            _projRepo = projRepo;
            _userRepo = userRepo;
            _userRoleRepo = userRoleRepo;
            _permissionService = permissionService;
            _semDomService = semDomService;
        }

        /// <summary> Returns all <see cref="Project"/>s </summary>
        /// <remarks> GET: v1/projects </remarks>
        [HttpGet]
        public async Task<IActionResult> GetAllProjects()
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.DatabaseAdmin))
            {
                return new ForbidResult();
            }
            return new ObjectResult(await _projRepo.GetAllProjects());
        }

        /// <summary> Get a list of <see cref="User"/>s of a specific project </summary>
        /// <remarks> GET: v1/projects/{projectId}/users </remarks>
        /// <returns> A list of <see cref="User"/>s </returns>
        [HttpGet("{projectId}/users")]
        public async Task<IActionResult> GetAllUsers(string projectId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.DeleteEditSettingsAndUsers))
            {
                return new ForbidResult();
            }

            var allUsers = await _userRepo.GetAllUsers();
            var projectUsers = allUsers.FindAll(user => user.ProjectRoles.ContainsKey(projectId));

            return new ObjectResult(projectUsers);
        }

        /// <summary> Deletes all <see cref="Project"/>s </summary>
        /// <remarks> DELETE: v1/projects </remarks>
        /// <returns> true: if success, false: if there were no projects </returns>
        [HttpDelete]
        public async Task<IActionResult> Delete()
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.DatabaseAdmin))
            {
                return new ForbidResult();
            }
            return new ObjectResult(await _projRepo.DeleteAllProjects());
        }

        /// <summary> Returns <see cref="Project"/> with specified id </summary>
        /// <remarks> GET: v1/projects/{projectId} </remarks>
        [HttpGet("{projectId}")]
        public async Task<IActionResult> Get(string projectId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return new ForbidResult();
            }

            var project = await _projRepo.GetProject(projectId);
            if (project is null)
            {
                return new NotFoundResult();
            }

            // If there are fields we need to hide from lower users, check for Permission.DeleteEditSettingsAndUsers
            // and remove them.

            return new ObjectResult(project);
        }

        /// <summary> Creates a <see cref="Project"/> </summary>
        /// <remarks> POST: v1/projects </remarks>
        /// <returns> Id of created Project </returns>
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] Project project)
        {
            await _projRepo.Create(project);

            // Get user.
            var currentUserId = _permissionService.GetUserId(HttpContext);
            var currentUser = await _userRepo.GetUser(currentUserId);
            if (currentUser is null)
            {
                return new NotFoundObjectResult(currentUserId);
            }

            // Give Project admin privileges to user who creates a Project.
            var userRole = new UserRole
            {
                Permissions = new List<int>
                {
                    (int) Permission.DeleteEditSettingsAndUsers,
                    (int) Permission.ImportExport,
                    (int) Permission.MergeAndCharSet,
                    (int) Permission.Unused,
                    (int) Permission.WordEntry
                },
                ProjectId = project.Id
            };
            userRole = await _userRoleRepo.Create(userRole);

            // Update user with userRole.
            // Generate the userRoles and update the user.
            currentUser.ProjectRoles.Add(project.Id, userRole.Id);
            await _userRepo.Update(currentUserId, currentUser);
            // Generate the JWT based on those new userRoles.
            var currentUpdatedUser = await _permissionService.MakeJwt(currentUser);
            if (currentUpdatedUser is null)
            {
                return new BadRequestObjectResult("Invalid JWT Token supplied.");
            }

            await _userRepo.Update(currentUserId, currentUpdatedUser);

            var output = new ProjectWithUser(project) { UpdatedUser = currentUpdatedUser };
            return new OkObjectResult(output);
        }

        /// <summary> Updates <see cref="Project"/> with specified id </summary>
        /// <remarks> PUT: v1/projects/{projectId} </remarks>
        /// <returns> Id of updated Project </returns>
        [HttpPut("{projectId}")]
        public async Task<IActionResult> Put(string projectId, [FromBody] Project project)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.DeleteEditSettingsAndUsers))
            {
                return new ForbidResult();
            }

            var result = await _projRepo.Update(projectId, project);
            return result switch
            {
                ResultOfUpdate.NotFound => new NotFoundObjectResult(projectId),
                ResultOfUpdate.Updated => new OkObjectResult(projectId),
                _ => new StatusCodeResult((int)HttpStatusCode.NotModified)
            };
        }

        /// <summary> Updates <see cref="Project"/> with specified id with a new list of chars </summary>
        /// <remarks> PUT: v1/projects/{projectId} </remarks>
        [HttpPut("{projectId}/characters")]
        public async Task<IActionResult> PutChars(string projectId, [FromBody] Project project)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.MergeAndCharSet))
            {
                return new ForbidResult();
            }

            var currentProj = await _projRepo.GetProject(projectId);
            if (currentProj is null)
            {
                return new NotFoundObjectResult(projectId);
            }

            currentProj.ValidCharacters = project.ValidCharacters;
            currentProj.RejectedCharacters = project.RejectedCharacters;
            await _projRepo.Update(projectId, currentProj);

            return new OkObjectResult(currentProj);
        }

        /// <summary> Deletes <see cref="Project"/> with specified id </summary>
        /// <remarks> DELETE: v1/projects/{projectId} </remarks>
        [HttpDelete("{projectId}")]
        public async Task<IActionResult> Delete(string projectId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.DatabaseAdmin))
            {
                return new ForbidResult();
            }

            // Sanitize user input.
            if (!Sanitization.SanitizeId(projectId))
            {
                return new UnsupportedMediaTypeResult();
            }

            if (await _projRepo.Delete(projectId))
            {
                return new OkResult();
            }
            return new NotFoundResult();
        }

        /// <summary>
        /// UNUSED: Returns tree of <see cref="SemanticDomainWithSubdomains"/> for specified <see cref="Project"/>
        /// </summary>
        /// <remarks> GET: v1/projects/{projectId}/semanticdomains </remarks>
        [AllowAnonymous]
        [HttpGet("{projectId}/semanticdomains")]
        public async Task<IActionResult> GetSemDoms(string projectId)
        {
            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return new NotFoundResult();
            }
            var result = _semDomService.ParseSemanticDomains(proj);
            return new OkObjectResult(result);
        }

        [HttpGet("duplicate/{projectName}")]
        public async Task<IActionResult> ProjectDuplicateCheck(string projectName)
        {
            var projectIdWithName = await _projRepo.GetProjectIdByName(projectName);
            return new OkObjectResult(projectIdWithName != null);
        }
    }
}
