using System;
using System.Security.Claims;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Otel;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace BackendFramework.Controllers
{
    [Produces("application/json")]
    [Route("v1/auth")]
    public class AuthController(IConfiguration configuration, IPermissionService permissionService) : Controller
    {
        private readonly IConfiguration _configuration = configuration;
        private readonly IPermissionService _permissionService = permissionService;

        private const string otelTagName = "otel.AuthController";
        private const string LexboxCookieScheme = "LexboxCookie";
        private const string LexboxOidcScheme = "LexboxOidc";
        private const string PostLoginRedirectConfigKey = "LexboxAuth:PostLoginRedirect";

        /// <summary> Gets authentication status for the current request. </summary>
        [HttpGet("status", Name = "GetAuthStatus")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(AuthStatus))]
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
                return Ok(AuthStatus.LoggedOut());
            }

            return Ok(AuthStatus.LoggedIn(GetUserFromClaims(result.Principal)));
        }

        /// <summary> Generates a redirect to Lexbox login for OIDC sign-in. </summary>
        [HttpGet("lexbox-login", Name = "GenerateLexboxLogin")]
        [ProducesResponseType(StatusCodes.Status302Found)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GenerateLexboxLogin()
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "generating Lexbox login");

            var redirectUrl = NormalizeReturnUrl(_configuration[PostLoginRedirectConfigKey])
                ?? NormalizeReturnUrl(Domain.FrontendDomain)
                ?? "/";
            var authProperties = new AuthenticationProperties { RedirectUri = redirectUrl };

            return await ChallengeLexboxAsync(authProperties);
        }

        /// <summary> Signs out the current user from Lexbox cookie and OIDC. </summary>
        [HttpGet("lexbox-logout", Name = "LogOutLexbox")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> LogOutLexbox()
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "logging out");

            await HttpContext.SignOutAsync(LexboxCookieScheme);
            await HttpContext.SignOutAsync(LexboxOidcScheme);

            return NoContent();
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
            if (string.IsNullOrEmpty(url) || !Uri.TryCreate(url, UriKind.RelativeOrAbsolute, out var uri))
            {
                return null;
            }

            return uri.IsAbsoluteUri ? uri.PathAndQuery : uri.ToString();
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
