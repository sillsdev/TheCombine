﻿using System;
using System.Collections.Generic;
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
        private readonly ICaptchaService _captchaService;
        private readonly IEmailService _emailService;
        private readonly IPasswordResetService _passwordResetService;
        private readonly IPermissionService _permissionService;

        private static readonly string? frontendServer =
            Environment.GetEnvironmentVariable("COMBINE_FRONTEND_SERVER_NAME");

        private static readonly string frontendDomain =
            frontendServer is null ? "http://localhost:3000" : $"https://{frontendServer}";

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
        public async Task<IActionResult> ResetPasswordRequest([FromBody, BindRequired] string EmailOrUsername)
        {
            // Find user attached to email or username.
            var user = await _userRepo.GetUserByEmailOrUsername(EmailOrUsername, false);

            if (user is null)
            {
                // Return Ok to avoid revealing to the frontend whether the user exists.
                return Ok();
            }

            // Create password reset.
            var resetRequest = await _passwordResetService.CreatePasswordReset(user.Email);

            // The url needs to match Path.PwReset in src/types/path.ts.
            var url = $"{frontendDomain}/pw/reset/{resetRequest.Token}";

            // Create email.
            var message = new MimeMessage();
            message.To.Add(new MailboxAddress(user.Name, user.Email));
            message.Subject = "Combine password reset";
            message.Body = new TextPart("plain")
            {
                Text = $"A password reset has been requested for the user {user.Username}. " +
                    $"Follow this link to reset {user.Username}'s password: {url}\n\n" +
                    "If you did not request a password reset, please ignore this email."
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

        /// <summary> Gets the current user. </summary>
        [HttpGet("currentuser", Name = "GetCurrentUser")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(User))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetCurrentUser()
        {
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
        [HttpPut("updateuser/{userId}", Name = "UpdateUser")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status304NotModified)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateUser(string userId, [FromBody, BindRequired] User user)
        {
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

        /// <summary> Deletes <see cref="User"/> with specified id. </summary>
        [HttpDelete("{userId}", Name = "DeleteUser")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteUser(string userId)
        {
            if (!await _permissionService.IsSiteAdmin(HttpContext))
            {
                return Forbid();
            }

            return await _userRepo.Delete(userId) ? Ok() : NotFound();
        }
    }
}
