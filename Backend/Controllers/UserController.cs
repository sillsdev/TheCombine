using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using MimeKit;

namespace BackendFramework.Controllers
{
    [Authorize]
    [Produces("application/json")]
    [Route("v1/users")]
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
        [AllowAnonymous]
        [HttpPost("forgot", Name = "ResetPasswordRequest")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> ResetPasswordRequest([FromBody, BindRequired] PasswordResetRequestData data)
        {
            // Find user attached to email or username.
            var emailOrUsername = data.EmailOrUsername.ToLowerInvariant();
            var user = (await _userRepo.GetAllUsers()).SingleOrDefault(u =>
                u.Email.ToLowerInvariant().Equals(emailOrUsername) ||
                u.Username.ToLowerInvariant().Equals(emailOrUsername));

            if (user is null)
            {
                return NotFound(emailOrUsername);
            }

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
                return Ok();
            }

            return StatusCode(StatusCodes.Status500InternalServerError);
        }

        /// <summary> Resets a password using a token </summary>
        [AllowAnonymous]
        [HttpPost("forgot/reset", Name = "ResetPassword")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> ResetPassword([FromBody, BindRequired] PasswordResetData data)
        {
            var result = await _passwordResetService.ResetPassword(data.Token, data.NewPassword);
            if (result)
            {
                return Ok();
            }
            return Forbid();
        }

        /// <summary> Returns all <see cref="User"/>s </summary>
        [HttpGet(Name = "GetAllUsers")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<User>))]
        public async Task<IActionResult> GetAllUsers()
        {
            if (string.IsNullOrEmpty(_permissionService.GetUserId(HttpContext)))
            {
                return Forbid();
            }
            return Ok(await _userRepo.GetAllUsers());
        }

        /// <summary> Logs in a <see cref="User"/> and gives a token </summary>
        [AllowAnonymous]
        [HttpPost("authenticate", Name = "Authenticate")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(User))]
        public async Task<IActionResult> Authenticate([FromBody, BindRequired] Credentials cred)
        {
            try
            {
                var user = await _permissionService.Authenticate(cred.Username, cred.Password);
                if (user is null)
                {
                    return Unauthorized(cred.Username);
                }
                return Ok(user);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(cred.Username);
            }
        }

        /// <summary> Returns <see cref="User"/> with specified id </summary>
        [HttpGet("{userId}", Name = "GetUser")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(User))]
        public async Task<IActionResult> GetUser(string userId)
        {
            if (!_permissionService.IsUserIdAuthorized(HttpContext, userId))
            {
                return Forbid();
            }
            var user = await _userRepo.GetUser(userId);
            if (user is null)
            {
                return NotFound(userId);
            }
            return Ok(user);
        }

        /// <summary> Returns <see cref="User"/> with the specified email address. </summary>
        [HttpGet("getemail/{email}", Name = "GetUserByEmail")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(User))]
        public async Task<IActionResult> GetUserByEmail(string email)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.Owner))
            {
                return Forbid();
            }
            var user = await _userRepo.GetUserByEmail(email);
            if (user is null)
            {
                return NotFound(email);
            }
            return Ok(user);
        }

        /// <summary> Creates specified <see cref="User"/>. </summary>
        /// <returns> Id of created user. </returns>
        [AllowAnonymous]
        [HttpPost(Name = "CreateUser")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        public async Task<IActionResult> CreateUser([FromBody, BindRequired] User user)
        {
            var returnUser = await _userRepo.Create(user);
            if (returnUser is null)
            {
                return BadRequest("User creation failed.");
            }
            return Ok(user.Id);
        }

        /// <summary> Checks whether specified username is taken. </summary>
        [AllowAnonymous]
        [HttpGet("isusernametaken/{username}", Name = "CheckUsername")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(bool))]
        public async Task<IActionResult> CheckUsername(string username)
        {
            var isAvailable = await _userRepo.GetUserByUsername(username) is null;
            return Ok(!isAvailable);
        }

        /// <summary> Checks whether specified email address is taken. </summary>
        [AllowAnonymous]
        [HttpGet("isemailtaken/{email}", Name = "CheckEmail")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(bool))]
        public async Task<IActionResult> CheckEmail(string email)
        {
            var isAvailable = await _userRepo.GetUserByEmail(email) is null;
            return Ok(!isAvailable);
        }

        /// <summary> Updates <see cref="User"/> with specified id. </summary>
        /// <returns> Id of updated user. </returns>
        [HttpPut("{userId}", Name = "UpdateUser")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        public async Task<IActionResult> UpdateUser(string userId, [FromBody, BindRequired] User user)
        {
            // The model seems to have flaws, and this prevents an admin from editing a user's user edits
            // One solution is to change the updating user roles so that the backend updates a user's
            // worked projects when it updates their user roles
            //
            // For the record, commenting this out was Mark's idea, not Micah's
            //
            // if (!_permissionService.IsUserIdAuthenticated(HttpContext, userId))
            // {
            //     return Forbid();
            // }
            var result = await _userRepo.Update(userId, user);
            return result switch
            {
                ResultOfUpdate.NotFound => NotFound(userId),
                ResultOfUpdate.Updated => Ok(userId),
                _ => StatusCode(StatusCodes.Status304NotModified, userId)
            };
        }

        /// <summary> Deletes <see cref="User"/> with specified id. </summary>
        [HttpDelete("{userId}", Name = "DeleteUser")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        public async Task<IActionResult> DeleteUser(string userId)
        {
            if (!await _permissionService.IsSiteAdmin(HttpContext))
            {
                return Forbid();
            }
            if (await _userRepo.Delete(userId))
            {
                return Ok(userId);
            }
            return NotFound(userId);
        }

        /// <remarks>
        /// This is used in a [FromBody] serializer, so its attributes cannot be set to readonly.
        /// </remarks>
        public class PasswordResetRequestData
        {
            [Required]
            public string Domain { get; set; }
            [Required]
            public string EmailOrUsername { get; set; }

            public PasswordResetRequestData()
            {
                Domain = "";
                EmailOrUsername = "";
            }
        }

        /// <remarks>
        /// This is used in a [FromBody] serializer, so its attributes cannot be set to readonly.
        /// </remarks>
        public class PasswordResetData
        {
            [Required]
            public string NewPassword { get; set; }
            [Required]
            public string Token { get; set; }

            public PasswordResetData()
            {
                NewPassword = "";
                Token = "";
            }
        }
    }
}
