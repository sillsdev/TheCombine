using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Otel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace BackendFramework.Controllers
{
    [Produces("application/json")]
    [Route("v1/auth")]
    public class LexboxController(IConfiguration configuration, ILexboxQueryService lexboxQueryService,
        IPermissionService permissionService) : Controller
    {
        private readonly IConfiguration _configuration = configuration;
        private readonly ILexboxQueryService _lexboxQueryService = lexboxQueryService;
        private readonly IPermissionService _permissionService = permissionService;

        private const string otelTagName = "otel.LexboxController";
        private const string LexboxCookieScheme = "LexboxCookie";
        private const string LexboxOidcScheme = "LexboxOidc";
        private const string PostLoginRedirectConfigKey = "LexboxAuth:PostLoginRedirect";

        /// <summary> Gets authentication status for the current request. </summary>
        [HttpGet("status", Name = "GetAuthStatus")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(LexboxAuthStatus))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetAuthStatus()
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting auth status");

            if (!_permissionService.IsCurrentUserAuthenticated(HttpContext))
            {
                return Forbid();
            }

            var result = await HttpContext.AuthenticateAsync(LexboxCookieScheme);
            if (!result.Succeeded || result.Principal is null)
            {
                // Clear any stale or undecryptable cookie (e.g. after a server restart loses Data Protection keys)
                if (HttpContext.Request.Cookies.ContainsKey("lexbox_auth"))
                {
                    await HttpContext.SignOutAsync(LexboxCookieScheme);
                }
                return Ok(LexboxAuthStatus.LoggedOut());
            }

            return Ok(LexboxAuthStatus.LoggedIn(GetUserFromClaims(result.Principal)));
        }

        /// <summary> Generates a redirect to Lexbox login for OIDC sign-in. </summary>
        [HttpGet("lexbox-login", Name = "GenerateLexboxLogin")]
        [ProducesResponseType(StatusCodes.Status302Found)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GenerateLexboxLogin()
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "generating Lexbox login");

            var redirectUrl = NormalizeReturnUrl(_configuration[PostLoginRedirectConfigKey])
                ?? Domain.FrontendDomain + "/app/auth-success";
            var authProperties = new AuthenticationProperties { RedirectUri = redirectUrl };

            return await ChallengeLexboxAsync(authProperties);
        }

        /// <summary> Signs out the current user from Lexbox cookie and OIDC. </summary>
        [HttpPost("lexbox-logout", Name = "LogOutLexbox")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> LogOutLexbox()
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "logging out");

            await HttpContext.SignOutAsync(LexboxCookieScheme);

            // TODO: Consider if we also need to sign out of the OIDC scheme here.
            // await HttpContext.SignOutAsync(LexboxOidcScheme)
            // is a no-op since it doesn't handle the redirect.

            return NoContent();
        }

        /// <summary> Gets Lexbox projects for the signed-in Lexbox user. </summary>
        [Authorize(AuthenticationSchemes = LexboxCookieScheme)]
        [HttpGet("lexbox-projects", Name = "GetLexboxProjects")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<LexboxProject>))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status502BadGateway)]
        public async Task<IActionResult> GetLexboxProjects()
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting Lexbox projects");

            var accessToken = await TryGetLexboxAccessTokenAsync();
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
        [Authorize(AuthenticationSchemes = LexboxCookieScheme)]
        [HttpGet("lexbox-entries/{projectCode}/{vernacularLang}", Name = "GetLexboxEntries")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<Word>))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status502BadGateway)]
        public async Task<IActionResult> GetLexboxEntries(string projectCode, string vernacularLang)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting Lexbox entries");

            var accessToken = await TryGetLexboxAccessTokenAsync();
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

        private async Task<string?> TryGetLexboxAccessTokenAsync()
        {
            var result = await HttpContext.AuthenticateAsync(LexboxCookieScheme);
            return result.Properties?.GetTokenValue("access_token");
        }

        private async Task<IActionResult> ChallengeLexboxAsync(AuthenticationProperties authProperties)
        {
            try
            {
                await HttpContext.ChallengeAsync(LexboxOidcScheme, authProperties);
                return new EmptyResult();
            }
            catch (Exception ex)
            {
                return Problem(title: "Lexbox OIDC challenge failed", detail: ex.Message,
                    statusCode: StatusCodes.Status500InternalServerError);
            }
        }

        private static string? NormalizeReturnUrl(string? url)
        {
            url = url?.Trim();
            return string.IsNullOrEmpty(url) || !Uri.TryCreate(url, UriKind.RelativeOrAbsolute, out var uri)
                ? null
                : uri.ToString();
        }

        private static LexboxAuthUser GetUserFromClaims(ClaimsPrincipal principal)
        {
            // https://github.com/sillsdev/languageforge-lexbox/blob/develop/backend/LexCore/Auth/LexAuthConstants.cs
            var userId = principal.FindFirst("sub")?.Value?.Trim(); // LexAuthConstants.IdClaimType
            if (string.IsNullOrEmpty(userId))
            {
                throw new InvalidOperationException("Missing required Lexbox 'sub' claim.");
            }

            var displayName = principal.FindFirst("user")?.Value // LexAuthConstants.UsernameClaimType
                ?? principal.FindFirst("name")?.Value; // LexAuthConstants.NameClaimType

            return new LexboxAuthUser { DisplayName = displayName ?? userId, UserId = userId };
        }

    }
}
