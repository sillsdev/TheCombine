using System.Collections.Generic;
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
    [Route("v1/projects")]
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
        [HttpGet(Name = "GetAllProjects")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<Project>))]
        public async Task<IActionResult> GetAllProjects()
        {
            if (!await _permissionService.IsSiteAdmin(HttpContext))
            {
                return Forbid();
            }
            return Ok(await _projRepo.GetAllProjects());
        }

        /// <summary> Get a list of <see cref="User"/>s of a specific project </summary>
        /// <returns> A list of <see cref="User"/>s </returns>
        [HttpGet("{projectId}/users", Name = "GetAllProjectUsers")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<User>))]
        public async Task<IActionResult> GetAllProjectUsers(string projectId)
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
        /// <returns> true: if success, false: if there were no projects </returns>
        [HttpDelete(Name = "DeleteAllProjects")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(bool))]
        public async Task<IActionResult> DeleteAllProjects()
        {
            if (!await _permissionService.IsSiteAdmin(HttpContext))
            {
                return Forbid();
            }
            return Ok(await _projRepo.DeleteAllProjects());
        }

        /// <summary> Returns <see cref="Project"/> with specified id </summary>
        [HttpGet("{projectId}", Name = "GetProject")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Project))]
        public async Task<IActionResult> GetProject(string projectId)
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
        /// <returns> Id of created Project </returns>
        [HttpPost(Name = "CreateProject")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(UserCreatedProject))]
        public async Task<IActionResult> CreateProject([FromBody, BindRequired] Project project)
        {
            await _projRepo.Create(project);

            // Get user.
            var currentUserId = _permissionService.GetUserId(HttpContext);
            var currentUser = await _userRepo.GetUser(currentUserId);
            if (currentUser is null)
            {
                return NotFound(currentUserId);
            }

            // Give Project owner privileges to user who creates a Project.
            var userRole = new UserRole
            {
                Permissions = new List<Permission>
                {
                    Permission.Owner,
                    Permission.DeleteEditSettingsAndUsers,
                    Permission.ImportExport,
                    Permission.MergeAndCharSet,
                    Permission.Unused,
                    Permission.WordEntry
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

            return Ok(new UserCreatedProject { Project = project, User = currentUpdatedUser });
        }

        /// <summary> Updates <see cref="Project"/> with specified id </summary>
        /// <returns> Id of updated Project </returns>
        [HttpPut("{projectId}", Name = "UpdateProject")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        public async Task<IActionResult> UpdateProject(string projectId, [FromBody, BindRequired] Project project)
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
        [HttpPut("{projectId}/characters", Name = "PutChars")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Project))]
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
        [HttpDelete("{projectId}", Name = "DeleteProject")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> DeleteProject(string projectId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.Owner))
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
        [AllowAnonymous]
        [HttpGet("{projectId}/semanticdomains", Name = "GetSemDoms")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<SemanticDomainWithSubdomains>))]
        public async Task<IActionResult> GetSemDoms(string projectId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return Forbid();
            }

            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return NotFound(projectId);
            }
            var result = _semDomService.ParseSemanticDomains(proj);
            return Ok(result);
        }

        [HttpGet("duplicate/{projectName}", Name = "ProjectDuplicateCheck")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(bool))]
        public async Task<IActionResult> ProjectDuplicateCheck(string projectName)
        {
            if (!_permissionService.IsCurrentUserAuthorized(HttpContext))
            {
                return Forbid();
            }

            var projectIdWithName = await _projRepo.GetProjectIdByName(projectName);
            return Ok(projectIdWithName is not null);
        }
    }
}
