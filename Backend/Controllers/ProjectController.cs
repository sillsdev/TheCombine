using System;
using System.Collections.Generic;
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
        private readonly IProjectService _projService;
        private readonly ISemanticDomainService _semDomService;
        private readonly IUserRoleRepository _userRoleRepo;
        private readonly IUserRepository _userRepo;
        private readonly IUserService _userService;
        private readonly IPermissionService _permissionService;

        public ProjectController(IProjectRepository projRepo, IProjectService projService,
            ISemanticDomainService semDomService, IUserRoleRepository userRoleRepo,
            IUserRepository userRepo, IUserService userService, IPermissionService permissionService)
        {
            _projRepo = projRepo;
            _projService = projService;
            _semDomService = semDomService;
            _userRoleRepo = userRoleRepo;
            _userRepo = userRepo;
            _userService = userService;
            _permissionService = permissionService;
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
            var currentUpdatedUser = await _userService.MakeJwt(currentUser);
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
                _ => new StatusCodeResult(304)
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

        // Change user role using project Id
        [HttpPut("{projectId}/users/{userId}")]
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
                _ => new StatusCodeResult(304)
            };
        }

        /// <summary> Check if lift import has already happened for this project </summary>
        [HttpGet("{projectId}/liftcheck")]
        public async Task<IActionResult> CanUploadLift(string projectId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.ImportExport))
            {
                return new ForbidResult();
            }

            // Sanitize user input
            if (!Sanitization.SanitizeId(projectId))
            {
                return new UnsupportedMediaTypeResult();
            }

            return new OkObjectResult(await _projService.CanImportLift(projectId));
        }

        /// <summary> Generates invite link and sends email containing link </summary>
        /// <remarks> PUT: v1/projects/invite </remarks>
        [HttpPut("invite")]
        public async Task<IActionResult> EmailInviteToProject([FromBody] EmailInviteData data)
        {
            var projectId = data.ProjectId;
            var project = await _projRepo.GetProject(projectId);
            if (project is null)
            {
                return new NotFoundObjectResult(projectId);
            }

            var linkWithIdentifier = await _projService.CreateLinkWithToken(project, data.EmailAddress);

            await _projService.EmailLink(data.EmailAddress, data.Message, linkWithIdentifier, data.Domain, project);

            return new OkObjectResult(linkWithIdentifier);
        }

        /// <summary> Validates token in url and adds user to project </summary>
        /// <remarks> PUT: v1/projects/invite/{projectId}/validate/{token} </remarks>
        [AllowAnonymous]
        [HttpPut("invite/{projectId}/validate/{token}")]
        public async Task<IActionResult> ValidateToken(string projectId, string token)
        {

            var project = await _projRepo.GetProject(projectId);
            if (project is null)
            {
                return new NotFoundObjectResult(projectId);
            }

            var users = await _userRepo.GetAllUsers();
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

            if (activeTokenExists && userIsRegistered
                                  && !currentUser.ProjectRoles.ContainsKey(projectId)
                                  && await _projService.RemoveTokenAndCreateUserRole(project, currentUser, tokenObj))
            {
                return new OkObjectResult(status);
            }

            status[0] = false;
            status[1] = false;
            return new OkObjectResult(status);
        }

        public class EmailInviteData
        {
            public readonly string EmailAddress;
            public readonly string Message;
            public readonly string ProjectId;
            public readonly string Domain;

            public EmailInviteData()
            {
                EmailAddress = "";
                Message = "";
                ProjectId = "";
                Domain = "";
            }
        }

        [HttpGet("duplicate/{projectName}")]
        public async Task<IActionResult> ProjectDuplicateCheck(string projectName)
        {
            var projectIdWithName = await _projRepo.GetProjectIdByName(projectName);
            return new OkObjectResult(projectIdWithName != null);
        }
    }
}
