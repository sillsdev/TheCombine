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
    [Route("v1/users")]
    public class UserController(IProjectRepository projectRepo, IUserRepository userRepo,
        IUserEditRepository userEditRepo, IUserRoleRepository userRoleRepo, ICaptchaService captchaService,
        IPermissionService permissionService) : Controller
    {
        private readonly IProjectRepository _projectRepo = projectRepo;
        private readonly IUserRepository _userRepo = userRepo;
        private readonly IUserEditRepository _userEditRepo = userEditRepo;
        private readonly IUserRoleRepository _userRoleRepo = userRoleRepo;
        private readonly ICaptchaService _captchaService = captchaService;
        private readonly IPermissionService _permissionService = permissionService;

        private const string otelTagName = "otel.UserController";

        /// <summary> Verifies a CAPTCHA token </summary>
        [AllowAnonymous]
        [HttpGet("captcha/{token}", Name = "VerifyCaptchaToken")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> VerifyCaptchaToken(string token)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "verifying CAPTCHA token");

            return await _captchaService.VerifyToken(token) ? Ok() : BadRequest();
        }

        /// <summary> Returns all <see cref="User"/>s </summary>
        /// <remarks> Can only be used by a site admin. </remarks>
        [HttpGet(Name = "GetAllUsers")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<User>))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetAllUsers()
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting all users");

            if (!await _permissionService.IsSiteAdmin(HttpContext))
            {
                return Forbid();
            }
            return Ok(await _userRepo.GetAllUsers());
        }

        /// <summary> Gets all users with email, name, or username matching the given filter. </summary>
        /// <remarks> Only site admins can use filters shorter than 3 characters long. </remarks>
        /// <returns> A list of <see cref="UserStub"/>s. </returns>
        [HttpGet("filter/{filter}", Name = "GetUsersByFilter")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<UserStub>))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetUsersByFilter(string filter)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting users by filter");

            filter = filter.Trim();
            if (!await _permissionService.IsSiteAdmin(HttpContext) && filter.Length < 3)
            {
                return Forbid();
            }

            return Ok((await _userRepo.GetAllUsersByFilter(filter)).Select(u => new UserStub(u)).ToList());
        }

        /// <summary> Logs in a <see cref="User"/> and gives a token </summary>
        [AllowAnonymous]
        [HttpPost("authenticate", Name = "Authenticate")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(User))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized, Type = typeof(string))]
        public async Task<IActionResult> Authenticate([FromBody, BindRequired] Credentials cred)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "authenticating user");

            try
            {
                var user = await _permissionService.Authenticate(cred.EmailOrUsername, cred.Password);
                return user is null ? Unauthorized(cred.EmailOrUsername) : Ok(user);
            }
            catch (KeyNotFoundException)
            {
                return Unauthorized(cred.EmailOrUsername);
            }
        }

        /// <summary> Logs the current UI language. </summary>
        [HttpPost("uilanguage", Name = "UiLanguage")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public IActionResult UiLanguage([FromBody, BindRequired] string uilang)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "logging current UI language");
            activity?.SetTag("ui_language", uilang);
            return Ok();
        }

        /// <summary> Gets the current user. </summary>
        [HttpGet("currentuser", Name = "GetCurrentUser")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(User))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetCurrentUser()
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting current user");

            var user = await _userRepo.GetUser(_permissionService.GetUserId(HttpContext));
            return user is null ? Forbid() : Ok(user);
        }

        /// <summary> Gets user with specified id. </summary>
        [HttpGet("{userId}", Name = "GetUser")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(UserStub))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetUser(string userId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting a user");

            if (!await _permissionService.CanModifyUser(HttpContext, userId))
            {
                return Forbid();
            }

            var user = await _userRepo.GetUser(userId);
            return user is null ? NotFound() : Ok(new UserStub(user));
        }

        /// <summary> Gets id of user with the specified email address or username. </summary>
        [HttpPut("getbyemailorusername", Name = "GetUserIdByEmailOrUsername")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetUserIdByEmailOrUsername([FromBody, BindRequired] string emailOrUsername)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting user by email or username");

            if (!_permissionService.IsCurrentUserAuthenticated(HttpContext))
            {
                return Forbid();
            }

            var user = await _userRepo.GetUserByEmailOrUsername(emailOrUsername);
            return user is null ? NotFound() : Ok(user.Id);
        }

        /// <summary> Creates specified <see cref="User"/>. </summary>
        /// <returns> Id of created user. </returns>
        [AllowAnonymous]
        [HttpPost("create", Name = "CreateUser")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(string))]
        public async Task<IActionResult> CreateUser([FromBody, BindRequired] User user)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "creating a user");

            if (string.IsNullOrWhiteSpace(user.Username)
                || await _userRepo.GetUserByEmailOrUsername(user.Username) is not null)
            {
                // Use GetUserByEmailOrUsername to prevent using an existing user's email address
                // as a username.
                return BadRequest("login.usernameTaken");
            }
            if (string.IsNullOrWhiteSpace(user.Email)
                || await _userRepo.GetUserByEmailOrUsername(user.Email) is not null)
            {
                // Use GetUserByEmailOrUsername to prevent using an existing user's username
                // as an email address.
                return BadRequest("login.emailTaken");
            }

            var createdUser = await _userRepo.Create(user);
            if (createdUser is null)
            {
                return BadRequest("login.signUpFailed");
            }
            return Ok(createdUser.Id);
        }

        /// <summary> Checks that specified email address or username is neither empty nor in use. </summary>
        [AllowAnonymous]
        [HttpPut("isemailorusernameavailable", Name = "IsEmailOrUsernameAvailable")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(bool))]
        public async Task<IActionResult> IsEmailOrUsernameAvailable([FromBody, BindRequired] string emailOrUsername)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "checking if email or username is available");

            var isAvailable = !string.IsNullOrWhiteSpace(emailOrUsername) &&
                await _userRepo.GetUserByEmailOrUsername(emailOrUsername) is null;
            return Ok(isAvailable);
        }

        /// <summary> Updates <see cref="User"/> with specified id. </summary>
        [HttpPut("updateuser/{userId}", Name = "UpdateUser")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status304NotModified)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateUser(string userId, [FromBody, BindRequired] User user)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "updating a user");

            if (!await _permissionService.CanModifyUser(HttpContext, userId))
            {
                return Forbid();
            }

            var result = await _userRepo.Update(userId, user);
            return result switch
            {
                ResultOfUpdate.NotFound => NotFound(),
                ResultOfUpdate.Updated => Ok(),
                _ => StatusCode(StatusCodes.Status304NotModified)
            };
        }

        /// <summary> Gets project information for a user's roles. </summary>
        /// <remarks> Can only be used by a site admin. </remarks>
        [HttpGet("{userId}/projects", Name = "GetUserProjects")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<UserProjectInfo>))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetUserProjects(string userId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting user projects");

            if (!await _permissionService.IsSiteAdmin(HttpContext))
            {
                return Forbid();
            }

            var user = await _userRepo.GetUser(userId, sanitize: false);
            if (user is null)
            {
                return NotFound();
            }

            var userProjects = new List<UserProjectInfo>();

            foreach (var (projectId, userRoleId) in user.ProjectRoles)
            {
                var project = await _projectRepo.GetProject(projectId);
                var userRole = await _userRoleRepo.GetUserRole(projectId, userRoleId);

                if (project is not null && userRole is not null)
                {
                    userProjects.Add(new UserProjectInfo
                    {
                        ProjectId = projectId,
                        ProjectIsActive = project.IsActive,
                        ProjectName = project.Name,
                        ProjectVernacular = project.VernacularWritingSystem.Bcp47,
                        Role = userRole.Role
                    });
                }
            }

            return Ok(userProjects);
        }

        /// <summary> Deletes <see cref="User"/> with specified id. </summary>
        /// <remarks> Can only be used by a site admin. </remarks>
        [HttpDelete("{userId}", Name = "DeleteUser")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteUser(string userId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "deleting a user");

            if (!await _permissionService.IsSiteAdmin(HttpContext))
            {
                return Forbid();
            }

            // Ensure user exists and is not an admin
            var user = await _userRepo.GetUser(userId);
            if (user is null)
            {
                return NotFound();
            }
            if (user.IsAdmin)
            {
                return Forbid();
            }

            // Delete all UserEdits and UserRoles for this user
            foreach (var (projectId, userEditId) in user.WorkedProjects)
            {
                await _userEditRepo.Delete(projectId, userEditId);
            }
            foreach (var (projectId, userRoleId) in user.ProjectRoles)
            {
                await _userRoleRepo.Delete(projectId, userRoleId);
            }

            // Finally, delete the user
            return await _userRepo.Delete(userId) ? Ok() : NotFound();
        }
    }
}
