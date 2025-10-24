using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Otel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace BackendFramework.Controllers
{
    [Authorize]
    [Produces("application/json")]
    [Route("v1/users/forgot")]
    public class PasswordResetController(IPasswordResetService passwordResetService) : Controller
    {
        private readonly IPasswordResetService _passwordResetService = passwordResetService;

        private const string otelTagName = "otel.PasswordResetController";

        /// <summary> Resets a password using a token </summary>
        [AllowAnonymous]
        [HttpPost("reset", Name = "ResetPassword")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> ResetPassword([FromBody, BindRequired] PasswordResetData data)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "resetting password");

            var result = await _passwordResetService.ResetPassword(data.Token, data.NewPassword);
            return result ? Ok() : Forbid();
        }

        /// <summary> Sends a password reset request </summary>
        [AllowAnonymous]
        [HttpPost("", Name = "ResetPasswordRequest")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ResetPasswordRequest([FromBody, BindRequired] string emailOrUsername)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "requesting password reset");

            var result = await _passwordResetService.ResetPasswordRequest(emailOrUsername);
            return result ? Ok() : StatusCode(StatusCodes.Status500InternalServerError);
        }

        /// <summary> Validates password reset token in url </summary>
        [AllowAnonymous]
        [HttpGet("reset/validate/{token}", Name = "ValidateResetToken")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(bool))]
        public async Task<IActionResult> ValidateResetToken(string token)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "validating password reset token");

            return Ok(await _passwordResetService.ValidateToken(token));
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
