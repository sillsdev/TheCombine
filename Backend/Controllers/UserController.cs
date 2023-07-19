﻿using System.Collections.Generic;
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
            var user = await _userRepo.GetUserByEmailOrUsername(data.EmailOrUsername, false);

            if (user is null)
            {
                return NotFound(data.EmailOrUsername);
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
            if (!_permissionService.IsCurrentUserAuthorized(HttpContext))
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

        /// <summary> Checks whether specified username is taken or empty. </summary>
        [AllowAnonymous]
        [HttpGet("isusernametaken/{username}", Name = "IsUsernameUnavailable")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(bool))]
        public async Task<IActionResult> IsUsernameUnavailable(string username)
        {
            var isUnavailable = string.IsNullOrWhiteSpace(username)
                || await _userRepo.GetUserByUsername(username) is not null;
            return Ok(isUnavailable);
        }

        /// <summary> Checks whether specified email address is taken or empty. </summary>
        [AllowAnonymous]
        [HttpGet("isemailtaken/{email}", Name = "IsEmailUnavailable")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(bool))]
        public async Task<IActionResult> IsEmailUnavailable(string email)
        {
            var isUnavailable = string.IsNullOrWhiteSpace(email) || await _userRepo.GetUserByEmail(email) is not null;
            return Ok(isUnavailable);
        }

        /// <summary> Updates <see cref="User"/> with specified id. </summary>
        /// <returns> Id of updated user. </returns>
        [HttpPut("{userId}", Name = "UpdateUser")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
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
