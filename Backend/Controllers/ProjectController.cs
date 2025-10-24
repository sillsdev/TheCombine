using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Otel;
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

        private const string otelTagName = "otel.ProjectController";

        public ProjectController(IProjectRepository projRepo, IUserRoleRepository userRoleRepo,
            IUserRepository userRepo, IPermissionService permissionService)
        {
            _projRepo = projRepo;
            _userRepo = userRepo;
            _userRoleRepo = userRoleRepo;
            _permissionService = permissionService;
        }

        /// <summary> Returns all <see cref="Project"/>s </summary>
        [HttpGet(Name = "GetAllProjects")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<Project>))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetAllProjects()
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting all projects");

            if (!await _permissionService.IsSiteAdmin(HttpContext))
            {
                return Forbid();
            }
            return Ok(await _projRepo.GetAllProjects());
        }

        /// <summary> Get all users of a specific project. </summary>
        /// <returns> A list of <see cref="UserStub"/>s. </returns>
        [HttpGet("{projectId}/users", Name = "GetAllProjectUsers")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<UserStub>))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetAllProjectUsers(string projectId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting all project users");

            if (!await _permissionService.HasProjectPermission(
                HttpContext, Permission.DeleteEditSettingsAndUsers, projectId))
            {
                return Forbid();
            }

            var allUsers = await _userRepo.GetAllUsers();
            var projectUsers = allUsers.FindAll(u => u.ProjectRoles.ContainsKey(projectId))
                .Select((u) => new UserStub(u) { RoleId = u.ProjectRoles[projectId] });

            return Ok(projectUsers.ToList());
        }

        /// <summary> Returns <see cref="Project"/> with specified id </summary>
        [HttpGet("{projectId}", Name = "GetProject")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Project))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetProject(string projectId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting a project");

            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry, projectId))
            {
                return Forbid();
            }

            var project = await _projRepo.GetProject(projectId);
            if (project is null)
            {
                return NotFound();
            }

            // If there are fields we need to hide from lower users, check for Permission.DeleteEditSettingsAndUsers
            // and remove them.

            return Ok(project);
        }

        /// <summary> Creates a <see cref="Project"/> </summary>
        /// <returns> Id of created Project </returns>
        [HttpPost(Name = "CreateProject")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(UserCreatedProject))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> CreateProject([FromBody, BindRequired] Project project)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "creating a project");

            // Get current user.
            var currentUserId = _permissionService.GetUserId(HttpContext);
            var currentUser = await _userRepo.GetUser(currentUserId, false);
            if (currentUser is null)
            {
                return Forbid();
            }

            await _projRepo.Create(project);

            // Give Project owner privileges to user who creates a Project.
            var userRole = new UserRole
            {
                ProjectId = project.Id,
                Role = Role.Owner
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
        [HttpPut("{projectId}", Name = "UpdateProject")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status304NotModified)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateProject(string projectId, [FromBody, BindRequired] Project project)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "updating a project");

            if (!await _permissionService.HasProjectPermission(
                HttpContext, Permission.DeleteEditSettingsAndUsers, projectId))
            {
                return Forbid();
            }

            var result = await _projRepo.Update(projectId, project);
            return result switch
            {
                ResultOfUpdate.NotFound => NotFound(),
                ResultOfUpdate.Updated => Ok(),
                _ => StatusCode(StatusCodes.Status304NotModified)
            };
        }

        /// <summary> Updates <see cref="Project"/> with specified id with a new list of chars </summary>
        [HttpPut("{projectId}/characters", Name = "PutChars")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Project))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> PutChars(string projectId, [FromBody, BindRequired] Project project)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "updating project characters");

            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.CharacterInventory, projectId))
            {
                return Forbid();
            }

            var currentProj = await _projRepo.GetProject(projectId);
            if (currentProj is null)
            {
                return NotFound();
            }

            currentProj.ValidCharacters = project.ValidCharacters;
            currentProj.RejectedCharacters = project.RejectedCharacters;
            await _projRepo.Update(projectId, currentProj);

            return Ok(currentProj);
        }

        /// <summary> Deletes <see cref="Project"/> with specified id </summary>
        [HttpDelete("{projectId}", Name = "DeleteProject")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status415UnsupportedMediaType)]
        public async Task<IActionResult> DeleteProject(string projectId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "deleting a project");

            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.Archive, projectId))
            {
                return Forbid();
            }

            // Sanitize user input.
            try
            {
                projectId = Sanitization.SanitizeId(projectId);
            }
            catch
            {
                return new UnsupportedMediaTypeResult();
            }

            return await _projRepo.Delete(projectId) ? Ok() : NotFound();
        }

        [HttpGet("duplicate/{projectName}", Name = "ProjectDuplicateCheck")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(bool))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> ProjectDuplicateCheck(string projectName)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "checking for duplicate project");

            if (!_permissionService.IsCurrentUserAuthenticated(HttpContext))
            {
                return Forbid();
            }

            var projectIdWithName = await _projRepo.GetProjectIdByName(projectName);
            return Ok(projectIdWithName is not null);
        }
    }
}
