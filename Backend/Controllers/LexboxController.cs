using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Otel;
using BackendFramework.Services;
using Microsoft.AspNetCore.Authorization;
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

            return Ok(await _lexboxAuthService.GetAuthStatus(HttpContext));
        }

        /// <summary> Generates a redirect to Lexbox login for OIDC sign-in. </summary>
        [HttpGet("login", Name = "GenerateLogin")]
        [ProducesResponseType(StatusCodes.Status302Found)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GenerateLogin()
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "generating login");

            if (!_permissionService.IsCurrentUserAuthenticated(HttpContext))
            {
                return Forbid();
            }

            try
            {
                await _lexboxAuthService.Challenge(HttpContext);
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
        [Authorize(AuthenticationSchemes = LexboxAuthService.LexboxCookieScheme)]
        [HttpGet("projects", Name = "GetProjects")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<LexboxProject>))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status502BadGateway)]
        public async Task<IActionResult> GetProjects()
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting Lexbox projects");

            var accessToken = await _lexboxAuthService.TryGetAccessToken(HttpContext);
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
        [Authorize(AuthenticationSchemes = LexboxAuthService.LexboxCookieScheme)]
        [HttpGet("entries/{projectCode}/{vernacularLang}", Name = "GetEntries")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<Word>))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status502BadGateway)]
        public async Task<IActionResult> GetEntries(string projectCode, string vernacularLang)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting Lexbox entries");

            var accessToken = await _lexboxAuthService.TryGetAccessToken(HttpContext);
            if (string.IsNullOrEmpty(accessToken))
            {
                return Unauthorized();
            }

            try
            {
                List<Word> entries =
                    await _lexboxQueryService.GetProjectEntriesAsync(accessToken, projectCode, vernacularLang);
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
