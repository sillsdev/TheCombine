using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using System;
using static BackendFramework.Helper.FileUtilities;

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

        public ProjectController(IProjectService projectService, ISemDomParser semDomParser,
            IUserRoleService userRoleService, IUserService userService, IPermissionService permissionService)
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
        public async Task<IActionResult> GetAllProjects()
        {
            if (!_permissionService.HasProjectPermission(HttpContext, Permission.DatabaseAdmin))
            {
                return new ForbidResult();
            }
            return new ObjectResult(await _projectService.GetAllProjects());
        }

        /// <summary> Get a list of <see cref="User"/>s of a specific project </summary>
        /// <remarks> GET: v1/projects/{projectId}/users </remarks>
        /// <returns> A list of <see cref="User"/>s </returns>
        [HttpGet("{projectId}/users")]
        public async Task<IActionResult> GetAllUsers(string projectId)
        {
            if (!_permissionService.HasProjectPermission(HttpContext, Permission.DeleteEditSettingsAndUsers))
            {
                return new ForbidResult();
            }

            var allUsers = await _userService.GetAllUsers();
            var projectUsers = allUsers.FindAll(user => user.ProjectRoles.ContainsKey(projectId));

            return new ObjectResult(projectUsers);
        }

        /// <summary> Deletes all <see cref="Project"/>s </summary>
        /// <remarks> DELETE: v1/projects </remarks>
        /// <returns> true: if success, false: if there were no projects </returns>
        [HttpDelete]
        public async Task<IActionResult> Delete()
        {
            if (!_permissionService.HasProjectPermission(HttpContext, Permission.DatabaseAdmin))
            {
                return new ForbidResult();
            }
            return new ObjectResult(await _projectService.DeleteAllProjects());
        }

        /// <summary> Returns <see cref="Project"/> with specified id </summary>
        /// <remarks> GET: v1/projects/{projectId} </remarks>
        [HttpGet("{projectId}")]
        public async Task<IActionResult> Get(string projectId)
        {
            if (!_permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return new ForbidResult();
            }

            var project = await _projectService.GetProject(projectId);
            if (project == null)
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
            await _projectService.Create(project);

            // Get user
            var currentUserId = _permissionService.GetUserId(HttpContext);
            var currentUser = await _userService.GetUser(currentUserId);

            // Give Project admin privileges to user who creates a Project
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
            userRole = await _userRoleService.Create(userRole);

            // Update user with userRole
            if (currentUser.ProjectRoles is null)
            {
                currentUser.ProjectRoles = new Dictionary<string, string>();
            }

            // Generate the userRoles and update the user
            currentUser.ProjectRoles.Add(project.Id, userRole.Id);
            await _userService.Update(currentUserId, currentUser);
            // Generate the JWT based on those new userRoles
            currentUser = await _userService.MakeJwt(currentUser);
            await _userService.Update(currentUserId, currentUser);

            var output = new ProjectWithUser(project) { UpdatedUser = currentUser };

            return new OkObjectResult(output);
        }

        /// <summary> Updates <see cref="Project"/> with specified id </summary>
        /// <remarks> PUT: v1/projects/{projectId} </remarks>
        /// <returns> Id of updated Project </returns>
        [HttpPut("{projectId}")]
        public async Task<IActionResult> Put(string projectId, [FromBody] Project project)
        {
            if (!_permissionService.HasProjectPermission(HttpContext, Permission.DeleteEditSettingsAndUsers))
            {
                return new ForbidResult();
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
        public async Task<IActionResult> PutChars(string projectId, [FromBody] Project project)
        {
            if (!_permissionService.HasProjectPermission(HttpContext, Permission.MergeAndCharSet))
            {
                return new ForbidResult();
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
            if (!_permissionService.HasProjectPermission(HttpContext, Permission.DatabaseAdmin))
            {
                return new ForbidResult();
            }

            if (await _projectService.Delete(projectId))
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

        // Change user role using project Id
        [HttpPut("{projectId}/users/{userId}")]
        public async Task<IActionResult> UpdateUserRole(string projectId, string userId, [FromBody] int[] permissions)
        {
            if (!_permissionService.HasProjectPermission(HttpContext, Permission.DeleteEditSettingsAndUsers))
            {
                return new ForbidResult();
            }

            var proj = _projectService.GetProject(projectId);
            if (proj == null)
            {
                return new NotFoundObjectResult(projectId);
            }

            // Fetch the user -> fetch user role -> update user role
            var changeUser = await _userService.GetUser(userId);
            string userRoleId;
            if (changeUser.ProjectRoles.ContainsKey(projectId))
            {
                userRoleId = changeUser.ProjectRoles[projectId];
            }
            else
            {

                // Generate the userRole
                var usersRole = new UserRole { ProjectId = projectId };
                usersRole = await _userRoleService.Create(usersRole);
                userRoleId = usersRole.Id;

                // Update the user
                changeUser.ProjectRoles.Add(projectId, userRoleId);
                await _userService.Update(changeUser.Id, changeUser);
            }
            var userRole = await _userRoleService.GetUserRole(projectId, userRoleId);
            userRole.Permissions = new List<int>(permissions);

            var result = await _userRoleService.Update(userRoleId, userRole);

            if (result == ResultOfUpdate.NotFound)
            {
                return new NotFoundObjectResult(userId);
            }
            if (result == ResultOfUpdate.Updated)
            {
                return new OkObjectResult(userId);
            }

            return new StatusCodeResult(304);
        }

        // Check if lift import has already happened for this project
        [HttpGet("{projectId}/liftcheck")]
        // Temporarily disable warning about missing await in this method.
        // It's needed for the return type to be correct, but nothing inside the function is awaiting yet.
#pragma warning disable 1998
        public async Task<IActionResult> CanUploadLift(string projectId)
#pragma warning restore 1998
        {
            if (!_permissionService.HasProjectPermission(HttpContext, Permission.ImportExport))
            {
                return new ForbidResult();
            }

            // sanitize user input
            if (!SanitizeId(projectId))
            {
                return new UnsupportedMediaTypeResult();
            }

            return new OkObjectResult(_projectService.CanImportLift(projectId));
        }

        /// <summary> Generates invite link and sends email containing link </summary>
        /// <remarks> PUT: v1/projects/invite </remarks>
        [HttpPut("invite")]
        public async Task<IActionResult> EmailInviteToProject([FromBody] EmailInviteData data)
        {
            var project = await _projectService.GetProject(data.ProjectId);
            var linkWithIdentifier = await _projectService.CreateLinkWithToken(project, data.EmailAddress);

            await _projectService.EmailLink(data.EmailAddress, data.Message, linkWithIdentifier, data.Domain, project);

            return new OkObjectResult(linkWithIdentifier);
        }

        /// <summary> Validates token in url and adds user to project </summary>
        /// <remarks> PUT: v1/projects/invite/{projectId}/validate/{token} </remarks>
        [AllowAnonymous]
        [HttpPut("invite/{projectId}/validate/{token}")]
        public async Task<IActionResult> ValidateToken(string projectId, string token)
        {

            var project = await _projectService.GetProject(projectId);
            var users = await _userService.GetAllUsers();
            var status = new bool[2];
            var activeTokenExists = false;
            var userIsRegistered = false;
            var tokenObj = new EmailInvite();
            var currentUser = new User();

            foreach (var tok in project.InviteTokens)
            {
                if (tok.Token == token && DateTime.Now < tok.ExpireTime)
                {
                    tokenObj = tok;
                    activeTokenExists = true;
                    break;
                }
            }
            foreach (var user in users)
            {
                if (user.Email == tokenObj.Email)
                {
                    currentUser = user;
                    userIsRegistered = true;
                    break;
                }
            }

            status[0] = activeTokenExists;
            status[1] = userIsRegistered;

            if (activeTokenExists && !userIsRegistered)
            {
                return new OkObjectResult(status);
            }
            else if (activeTokenExists && userIsRegistered
               && !currentUser.ProjectRoles.ContainsKey(projectId)
               && await _projectService.RemoveTokenAndCreateUserRole(project, currentUser, tokenObj))
            {
                return new OkObjectResult(status);
            }
            else
            {
                status[0] = false;
                status[1] = false;
                return new OkObjectResult(status);
            }
        }

        public class EmailInviteData
        {
            public string EmailAddress;
            public string Message;
            public string ProjectId;
            public string Domain;
        }

        [HttpGet("duplicate/{projectName}")]
        public async Task<IActionResult> ProjectDuplicateCheck(string projectName)
        {
            var isDuplicate = await _projectService.DuplicateCheck(projectName);
            return new OkObjectResult(isDuplicate);
        }
    }
}
