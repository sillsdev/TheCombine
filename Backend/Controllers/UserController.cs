using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
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
        private readonly ICaptchaService _captchaService;
        private readonly IEmailService _emailService;
        private readonly IPasswordResetService _passwordResetService;
        private readonly IPermissionService _permissionService;

        public UserController(IUserRepository userRepo, IPermissionService permissionService,
            ICaptchaService captchaService, IEmailService emailService, IPasswordResetService passwordResetService)
        {
            _userRepo = userRepo;
            _captchaService = captchaService;
            _emailService = emailService;
            _passwordResetService = passwordResetService;
            _permissionService = permissionService;
        }

        /// <summary> Verifies a CAPTCHA token </summary>
        [AllowAnonymous]
        [HttpGet("captcha/{token}", Name = "VerifyCaptchaToken")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> VerifyCaptchaToken(string token)
        {
            return await _captchaService.VerifyToken(token) ? Ok() : BadRequest();
        }

        /// <summary> Sends a password reset request </summary>
        [AllowAnonymous]
        [HttpPost("forgot", Name = "ResetPasswordRequest")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ResetPasswordRequest([FromBody, BindRequired] PasswordResetRequestData data)
        {

            // Find user attached to email or username.
            var user = await _userRepo.GetUserByEmailOrUsername(data.EmailOrUsername, false);

            if (user is null)
            {
                // Return Ok to avoid revealing to the frontend whether the user exists.
                return Ok();
            }

            // Create password reset.
            var resetRequest = await _passwordResetService.CreatePasswordReset(user.Email);

            // Create email.
            var message = new MimeMessage();
            message.To.Add(new MailboxAddress(user.Name, user.Email));
            message.Subject = "Combine password reset";
            message.Body = new TextPart("plain")
            {
                Text = $"A password reset has been requested for the user {user.Username}. " +
                    $"Follow the link to reset {user.Username}'s password. " +
                    $"{data.Domain}/forgot/reset/{resetRequest.Token} \n\n " +
                    "If you did not request a password reset please ignore this email."
            };
            if (await _emailService.SendEmail(message))
            {
                return Ok();
            }

            return StatusCode(StatusCodes.Status500InternalServerError);
        }

        /// <summary> Validates password reset token in url </summary>
        [AllowAnonymous]
        [HttpGet("forgot/reset/validate/{token}", Name = "ValidateResetToken")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(bool))]
        public async Task<IActionResult> ValidateResetToken(string token)
        {
            return Ok(await _passwordResetService.ValidateToken(token));
        }

        /// <summary> Resets a password using a token </summary>
        [AllowAnonymous]
        [HttpPost("forgot/reset", Name = "ResetPassword")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
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
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
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
        [ProducesResponseType(StatusCodes.Status401Unauthorized, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(string))]
        public async Task<IActionResult> Authenticate([FromBody, BindRequired] Credentials cred)
        {
            try
            {
                var user = await _permissionService.Authenticate(cred.EmailOrUsername, cred.Password);
                if (user is null)
                {
                    return Unauthorized(cred.EmailOrUsername);
                }
                return Ok(user);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(cred.EmailOrUsername);
            }
        }

        /// <summary> Returns <see cref="User"/> with specified id </summary>
        [HttpGet("{userId}", Name = "GetUser")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(User))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(string))]
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

        /// <summary> Returns <see cref="User"/> with the specified email address or username. </summary>
        [HttpPut("getbyemailorusername", Name = "GetUserByEmailOrUsername")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(User))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(string))]
        public async Task<IActionResult> GetUserByEmailOrUsername([FromBody, BindRequired] string emailOrUsername)
        {
            if (!_permissionService.IsCurrentUserAuthorized(HttpContext))
            {
                return Forbid();
            }
            var user = await _userRepo.GetUserByEmailOrUsername(emailOrUsername);
            if (user is null)
            {
                return NotFound(emailOrUsername);
            }
            return Ok(user);
        }

        /// <summary> Creates specified <see cref="User"/>. </summary>
        /// <returns> Id of created user. </returns>
        [AllowAnonymous]
        [HttpPost("create", Name = "CreateUser")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(string))]
        public async Task<IActionResult> CreateUser([FromBody, BindRequired] User user)
        {
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
            var isAvailable = !string.IsNullOrWhiteSpace(emailOrUsername) &&
                await _userRepo.GetUserByEmailOrUsername(emailOrUsername) is null;
            return Ok(isAvailable);
        }

        /// <summary> Updates <see cref="User"/> with specified id. </summary>
        /// <returns> Id of updated user. </returns>
        [HttpPut("updateuser/{userId}", Name = "UpdateUser")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status304NotModified, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(string))]
        public async Task<IActionResult> UpdateUser(string userId, [FromBody, BindRequired] User user)
        {
            if (!_permissionService.IsUserIdAuthorized(HttpContext, userId)
                && !await _permissionService.IsSiteAdmin(HttpContext))
            {
                return Forbid();
            }

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
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(string))]
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

        /// <summary> Checks if current user is a site administrator. </summary>
        [HttpGet("issiteadmin", Name = "IsUserSiteAdmin")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(bool))]
        public async Task<IActionResult> IsUserSiteAdmin()
        {
            return Ok(await _permissionService.IsSiteAdmin(HttpContext));
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
