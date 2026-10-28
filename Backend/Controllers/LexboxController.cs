using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Otel;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BackendFramework.Controllers
{
    [Produces("application/json")]
    [Route("v1/lexbox")]
    public class LexboxController(ILexboxAuthService lexboxAuthService, ILexboxQueryService lexboxQueryService,
        IPermissionService permissionService) : Controller
    {
        private readonly ILexboxAuthService _lexboxAuthService = lexboxAuthService;
        private readonly ILexboxQueryService _lexboxQueryService = lexboxQueryService;
        private readonly IPermissionService _permissionService = permissionService;

        private const string otelTagName = "otel.LexboxController";

        /// <summary> Gets authentication status for the current request. </summary>
        [HttpGet("auth-status", Name = "GetAuthStatus")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(LexboxAuthStatus))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetAuthStatus()
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting auth status");

            if (!_permissionService.IsCurrentUserAuthenticated(HttpContext))
            {
                return Forbid();
            }

            var combineUserId = _permissionService.GetUserId(HttpContext);
            return Ok(await _lexboxAuthService.GetAuthStatus(HttpContext, combineUserId));
        }

        /// <summary> Creates a single-use ticket for <see cref="GenerateLogin"/>. </summary>
        /// <remarks>
        /// The login page opens in a new window, which can't send the Combine auth header, so the ticket
        /// carries the Combine user's identity instead.
        /// </remarks>
        [HttpPost("login-ticket", Name = "CreateLoginTicket")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public IActionResult CreateLoginTicket()
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "creating login ticket");

            if (!_permissionService.IsCurrentUserAuthenticated(HttpContext))
            {
                return Forbid();
            }

            var combineUserId = _permissionService.GetUserId(HttpContext);
            return Ok(_lexboxAuthService.CreateLoginTicket(combineUserId));
        }

        /// <summary> Generates a redirect to Lexbox login for OIDC sign-in. </summary>
        /// <param name="ticket"> From <see cref="CreateLoginTicket"/>. </param>
        [HttpGet("login", Name = "GenerateLogin")]
        [ProducesResponseType(StatusCodes.Status302Found)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GenerateLogin([FromQuery] string? ticket)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "generating login");

            var combineUserId = _lexboxAuthService.RedeemLoginTicket(ticket);
            if (combineUserId is null)
            {
                return Forbid();
            }

            try
            {
                await _lexboxAuthService.Challenge(HttpContext, combineUserId);
                return new EmptyResult();
            }
            catch (Exception ex)
            {
                return Problem(title: "Lexbox OIDC challenge failed", detail: ex.Message,
                    statusCode: StatusCodes.Status500InternalServerError);
            }
        }

        /// <summary> Signs out the current user from Lexbox cookie and OIDC. </summary>
        [HttpPost("logout", Name = "LogOut")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> LogOut()
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "logging out");

            await _lexboxAuthService.SignOut(HttpContext);

            // TODO: Consider if we also need to sign out of the OIDC scheme here.
            // await HttpContext.SignOutAsync(LexboxOidcScheme)
            // is a no-op since it doesn't handle the redirect.

            return NoContent();
        }

        /// <summary> Gets Lexbox projects for the signed-in Lexbox user. </summary>
        [HttpGet("projects", Name = "GetProjects")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<LexboxProject>))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status502BadGateway)]
        public async Task<IActionResult> GetProjects()
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting Lexbox projects");

            if (!_permissionService.IsCurrentUserAuthenticated(HttpContext))
            {
                return Forbid();
            }

            var combineUserId = _permissionService.GetUserId(HttpContext);
            var accessToken = await _lexboxAuthService.TryGetAccessToken(HttpContext, combineUserId);
            if (string.IsNullOrEmpty(accessToken))
            {
                return Unauthorized();
            }

            try
            {
                List<LexboxProject> projects = await _lexboxQueryService.GetMyProjectsAsync(accessToken);
                return Ok(projects);
            }
            catch (LexboxQueryException ex)
            {
                return Problem(title: ex.Title, detail: ex.Message,
                    statusCode: StatusCodes.Status502BadGateway);
            }
        }

        /// <summary> Gets entries from a Lexbox project. </summary>
        [HttpGet("entries/{projectCode}/{vernacularLang}", Name = "GetEntries")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<Word>))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status502BadGateway)]
        public async Task<IActionResult> GetEntries(
            string projectCode, string vernacularLang, [FromQuery] List<string>? analysisLangs)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting Lexbox entries");

            if (!_permissionService.IsCurrentUserAuthenticated(HttpContext))
            {
                return Forbid();
            }

            var combineUserId = _permissionService.GetUserId(HttpContext);
            var accessToken = await _lexboxAuthService.TryGetAccessToken(HttpContext, combineUserId);
            if (string.IsNullOrEmpty(accessToken))
            {
                return Unauthorized();
            }

            try
            {
                List<Word> entries = await _lexboxQueryService.GetProjectEntriesAsync(
                    accessToken, projectCode, vernacularLang, analysisLangs ?? []);
                return Ok(entries);
            }
            catch (LexboxQueryException ex)
            {
                return Problem(title: ex.Title, detail: ex.Message,
                    statusCode: StatusCodes.Status502BadGateway);
            }
        }

    }
}
