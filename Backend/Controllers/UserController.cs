using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using MimeKit;
using System.Web.Http;

namespace BackendFramework.Controllers
{
    [Authorize]
    [Produces("application/json")]
    [Route("v1/users")]
    [EnableCors("AllowAll")]
    public class UserController : Controller
    {
        private readonly IUserRepository _userRepo;
        private readonly IEmailService _emailService;
        private readonly IPasswordResetService _passwordResetService;
        private readonly IPermissionService _permissionService;

        public UserController(IUserRepository userRepo, IPermissionService permissionService,
            IEmailService emailService, IPasswordResetService passwordResetService)
        {
            _userRepo = userRepo;
            _emailService = emailService;
            _passwordResetService = passwordResetService;
            _permissionService = permissionService;
        }

        /// <summary> Sends a password reset request </summary>
        /// <remarks> POST: v1/users/forgot </remarks>
        [AllowAnonymous]
        [HttpPost("forgot")]
        public async Task<IActionResult> ResetPasswordRequest([FromBody] PasswordResetData data)
        {
            // Find user attached to email or username.
            var emailOrUsername = data.EmailOrUsername.ToLowerInvariant();
            var user = (await _userRepo.GetAllUsers()).SingleOrDefault(u =>
                u.Email.ToLowerInvariant().Equals(emailOrUsername) ||
                u.Username.ToLowerInvariant().Equals(emailOrUsername));

            // Create password reset.
            var resetRequest = await _passwordResetService.CreatePasswordReset(user.Email);

            // Create email.
            var message = new MimeMessage();
            message.To.Add(new MailboxAddress(user.Name, user.Email));
            message.Subject = "Combine password reset";
            message.Body = new TextPart("plain")
            {
                Text = string.Format("A password reset has been requested for the user {0}. Follow the link to reset "
                        + "{0}'s password. {1}/forgot/reset/{2} \n\n If you did not request a password reset please "
                        + "ignore this email", user.Username, data.Domain, resetRequest.Token)
            };
            if (await _emailService.SendEmail(message))
            {
                return new OkResult();
            }

            return new InternalServerErrorResult();
        }

        /// <summary> Resets a password using a token </summary>
        /// <remarks> POST: v1/users/reset </remarks>
        [AllowAnonymous]
        [HttpPost("forgot/reset")]
        public async Task<IActionResult> ResetPassword([FromBody] PasswordResetData data)
        {
            var result = await _passwordResetService.ResetPassword(data.Token, data.NewPassword);
            if (result)
            {
                return new OkResult();
            }

            return new ForbidResult();
        }

        /// <summary> Returns all <see cref="User"/>s </summary>
        /// <remarks> GET: v1/users </remarks>
        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            if (string.IsNullOrEmpty(_permissionService.GetUserId(HttpContext)))
            {
                return new ForbidResult();
            }
            return new ObjectResult(await _userRepo.GetAllUsers());
        }

        /// <summary> Deletes all <see cref="User"/>s </summary>
        /// <remarks> DELETE: v1/users </remarks>
        /// <returns> true: if success, false: if there were no users </returns>
        [HttpDelete]
        public async Task<IActionResult> Delete()
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.DatabaseAdmin))
            {
                return new ForbidResult();
            }

            return new OkObjectResult(await _userRepo.DeleteAllUsers());
        }

        /// <summary> Logs in a <see cref="User"/> and gives a token </summary>
        /// <remarks> POST: v1/users/authenticate </remarks>
        [AllowAnonymous]
        [HttpPost("authenticate")]
        public async Task<IActionResult> Authenticate([FromBody] Credentials cred)
        {
            try
            {
                var user = await _permissionService.Authenticate(cred.Username, cred.Password);
                if (user is null)
                {
                    return new UnauthorizedResult();
                }

                return new OkObjectResult(user);
            }
            catch (KeyNotFoundException)
            {
                return new NotFoundResult();
            }
        }

        /// <summary> Returns <see cref="User"/> with specified id </summary>
        /// <remarks> GET: v1/users/{userId} </remarks>
        [HttpGet("{userId}")]
        public async Task<IActionResult> Get(string userId)
        {
            if (!_permissionService.IsUserIdAuthorized(HttpContext, userId))
            {
                return new ForbidResult();
            }

            var user = await _userRepo.GetUser(userId);
            if (user is null)
            {
                return new NotFoundObjectResult(userId);
            }

            return new ObjectResult(user);
        }

        /// <summary> Creates a <see cref="User"/> </summary>
        /// <remarks> POST: v1/users </remarks>
        /// <returns> Id of created user </returns>
        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] User user)
        {
            var returnUser = await _userRepo.Create(user);
            if (returnUser is null)
            {
                return BadRequest();
            }

            return new OkObjectResult(user.Id);
        }

        /// <summary> Checks whether a username is taken </summary>
        /// <remarks> POST: v1/users/checkusername/ </remarks>
        /// <returns> Bool </returns>
        [AllowAnonymous]
        [HttpPost("checkusername/{username}")]
        public async Task<IActionResult> CheckUsername(string username)
        {
            var isAvailable = (await _userRepo.GetUserByUsername(username)) is null;
            if (!isAvailable)
            {
                return BadRequest();
            }

            return new OkResult();
        }

        /// <summary> Checks whether a email is taken </summary>
        /// <remarks> POST: v1/users/checkemail/ </remarks>
        /// <returns> Bool </returns>
        [AllowAnonymous]
        [HttpPost("checkemail/{email}")]
        public async Task<IActionResult> CheckEmail(string email)
        {
            var isAvailable = (await _userRepo.GetUserByEmail(email)) is null;
            if (!isAvailable)
            {
                return BadRequest();
            }

            return new OkResult();
        }

        /// <summary> Updates <see cref="User"/> with specified id </summary>
        /// <remarks> PUT: v1/users/{userId} </remarks>
        /// <returns> Id of updated user </returns>
        [HttpPut("{userId}")]
        public async Task<IActionResult> Put(string userId, [FromBody] User user)
        {
            // The model seems to have flaws, and this prevents an admin from editing a user's user edits
            // One solution is to change the updating user roles so that the backend updates a user's
            // worked projects when it updates their user roles
            //
            // For the record, commenting this out was Mark's idea, not Micah's
            //
            // if (!_permissionService.IsUserIdAuthenticated(HttpContext, userId))
            // {
            //     return new ForbidResult();
            // }

            var result = await _userRepo.Update(userId, user);
            return result switch
            {
                ResultOfUpdate.NotFound => new NotFoundObjectResult(userId),
                ResultOfUpdate.Updated => new OkObjectResult(userId),
                _ => new StatusCodeResult((int)HttpStatusCode.NotModified)
            };
        }

        /// <summary> Deletes <see cref="User"/> with specified id </summary>
        /// <remarks> DELETE: v1/users/{userId} </remarks>
        [HttpDelete("{userId}")]
        public async Task<IActionResult> Delete(string userId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.DatabaseAdmin))
            {
                return new ForbidResult();
            }

            if (await _userRepo.Delete(userId))
            {
                return new OkResult();
            }
            return new NotFoundResult();
        }

        /// <remarks>
        /// This is used in a [FromBody] serializer, so its attributes cannot be set to readonly.
        /// </remarks>
        public class PasswordResetData
        {
            public string EmailOrUsername { get; set; }
            public string Token { get; set; }
            public string NewPassword { get; set; }
            public string Domain { get; set; }

            public PasswordResetData()
            {
                EmailOrUsername = "";
                Token = "";
                NewPassword = "";
                Domain = "";
            }
        }
    }
}
