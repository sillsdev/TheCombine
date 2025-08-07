using System;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using MimeKit;

namespace BackendFramework.Controllers
{
    [Authorize]
    [Produces("application/json")]
    [Route("v1/users/forgot")]
    public class PasswordResetController : Controller
    {
        private readonly IUserRepository _userRepo;
        private readonly IEmailService _emailService;
        private readonly IPasswordResetService _passwordResetService;

        private static readonly string? frontendServer =
            Environment.GetEnvironmentVariable("COMBINE_FRONTEND_SERVER_NAME");

        private static readonly string frontendDomain =
            frontendServer is null ? "http://localhost:3000" : $"https://{frontendServer}";

        public PasswordResetController(
            IUserRepository userRepo, IEmailService emailService, IPasswordResetService passwordResetService)
        {
            _userRepo = userRepo;
            _emailService = emailService;
            _passwordResetService = passwordResetService;
        }

        /// <summary> Sends a password reset request </summary>
        [AllowAnonymous]
        [HttpPost("", Name = "ResetPasswordRequest")]
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
                    $"(This link will expire in {_passwordResetService.ExpireTime.TotalMinutes} minutes.)\n\n" +
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
        [HttpGet("reset/validate/{token}", Name = "ValidateResetToken")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(bool))]
        public async Task<IActionResult> ValidateResetToken(string token)
        {
            return Ok(await _passwordResetService.ValidateToken(token));
        }

        /// <summary> Resets a password using a token </summary>
        [AllowAnonymous]
        [HttpPost("reset", Name = "ResetPassword")]
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
    }

    /// <remarks>
    /// This is used in a [FromBody] serializer, so its attributes cannot be set to readonly.
    /// </remarks>
    public class PasswordResetData
    {
        [Required]
        public string NewPassword { get; set; } = "";

        [Required]
        public string Token { get; set; } = "";
    }
}
