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
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<Project>))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetAllProjects()
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.DatabaseAdmin))
            {
                return Forbid();
            }
            return Ok(await _projRepo.GetAllProjects());
        }

        /// <summary> Get a list of <see cref="User"/>s of a specific project </summary>
        /// <remarks> GET: v1/projects/{projectId}/users </remarks>
        /// <returns> A list of <see cref="User"/>s </returns>
        [HttpGet("{projectId}/users")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<User>))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetAllUsers(string projectId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.DeleteEditSettingsAndUsers))
            {
                return Forbid();
            }

            var allUsers = await _userRepo.GetAllUsers();
            var projectUsers = allUsers.FindAll(user => user.ProjectRoles.ContainsKey(projectId));

            return Ok(projectUsers);
        }

        /// <summary> Deletes all <see cref="Project"/>s </summary>
        /// <remarks> DELETE: v1/projects </remarks>
        /// <returns> true: if success, false: if there were no projects </returns>
        [HttpDelete]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(bool))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> Delete()
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.DatabaseAdmin))
            {
                return Forbid();
            }
            return Ok(await _projRepo.DeleteAllProjects());
        }

        /// <summary> Returns <see cref="Project"/> with specified id </summary>
        /// <remarks> GET: v1/projects/{projectId} </remarks>
        [HttpGet("{projectId}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Project))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(string))]
        public async Task<IActionResult> Get(string projectId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return Forbid();
            }

            var project = await _projRepo.GetProject(projectId);
            if (project is null)
            {
                return NotFound(projectId);
            }

            // If there are fields we need to hide from lower users, check for Permission.DeleteEditSettingsAndUsers
            // and remove them.

            return Ok(project);
        }

        /// <summary> Creates a <see cref="Project"/> </summary>
        /// <remarks> POST: v1/projects </remarks>
        /// <returns> Id of created Project </returns>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ProjectWithUser))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(string))]
        public async Task<IActionResult> Post([FromBody, BindRequired] Project project)
        {
            await _projRepo.Create(project);

            // Get user.
            var currentUserId = _permissionService.GetUserId(HttpContext);
            var currentUser = await _userRepo.GetUser(currentUserId);
            if (currentUser is null)
            {
                return NotFound(currentUserId);
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
                return BadRequest("Invalid JWT Token supplied.");
            }

            await _userRepo.Update(currentUserId, currentUpdatedUser);

            var output = new ProjectWithUser(project) { UpdatedUser = currentUpdatedUser };
            return Ok(output);
        }

        /// <summary> Updates <see cref="Project"/> with specified id </summary>
        /// <remarks> PUT: v1/projects/{projectId} </remarks>
        /// <returns> Id of updated Project </returns>
        [HttpPut("{projectId}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status304NotModified, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(string))]
        public async Task<IActionResult> Put(string projectId, [FromBody, BindRequired] Project project)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.DeleteEditSettingsAndUsers))
            {
                return Forbid();
            }

            var result = await _projRepo.Update(projectId, project);
            return result switch
            {
                ResultOfUpdate.NotFound => NotFound(projectId),
                ResultOfUpdate.Updated => Ok(projectId),
                _ => StatusCode(StatusCodes.Status304NotModified, projectId)
            };
        }

        /// <summary> Updates <see cref="Project"/> with specified id with a new list of chars </summary>
        /// <remarks> PUT: v1/projects/{projectId} </remarks>
        [HttpPut("{projectId}/characters")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Project))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(string))]
        public async Task<IActionResult> PutChars(string projectId, [FromBody, BindRequired] Project project)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.MergeAndCharSet))
            {
                return Forbid();
            }

            var currentProj = await _projRepo.GetProject(projectId);
            if (currentProj is null)
            {
                return NotFound(projectId);
            }

            currentProj.ValidCharacters = project.ValidCharacters;
            currentProj.RejectedCharacters = project.RejectedCharacters;
            await _projRepo.Update(projectId, currentProj);

            return Ok(currentProj);
        }

        /// <summary> Deletes <see cref="Project"/> with specified id </summary>
        /// <remarks> DELETE: v1/projects/{projectId} </remarks>
        [HttpDelete("{projectId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status415UnsupportedMediaType)]
        public async Task<IActionResult> Delete(string projectId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.DatabaseAdmin))
            {
                return Forbid();
            }

            // Sanitize user input.
            if (!Sanitization.SanitizeId(projectId))
            {
                return new UnsupportedMediaTypeResult();
            }

            if (await _projRepo.Delete(projectId))
            {
                return Ok();
            }
            return NotFound();
        }

        /// <summary>
        /// UNUSED: Returns tree of <see cref="SemanticDomainWithSubdomains"/> for specified <see cref="Project"/>
        /// </summary>
        /// <remarks> GET: v1/projects/{projectId}/semanticdomains </remarks>
        [AllowAnonymous]
        [HttpGet("{projectId}/semanticdomains")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<SemanticDomainWithSubdomains>))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(string))]
        public async Task<IActionResult> GetSemDoms(string projectId)
        {
            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return NotFound(projectId);
            }
            var result = _semDomService.ParseSemanticDomains(proj);
            return Ok(result);
        }

        [HttpGet("duplicate/{projectName}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(bool))]
        public async Task<IActionResult> ProjectDuplicateCheck(string projectName)
        {
            var projectIdWithName = await _projRepo.GetProjectIdByName(projectName);
            return Ok(projectIdWithName != null);
        }
    }
}
