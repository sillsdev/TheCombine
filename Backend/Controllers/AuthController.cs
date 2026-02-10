using System;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Otel;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace BackendFramework.Controllers
{
    [Produces("application/json")]
    [Route("v1/auth")]
    public class AuthController(
        IPermissionService permissionService,
        ILexboxAuthService lexboxAuthService,
        IConfiguration configuration) : Controller
    {
        private readonly IPermissionService _permissionService = permissionService;
        private readonly ILexboxAuthService _lexboxAuthService = lexboxAuthService;
        private readonly IConfiguration _configuration = configuration;

        private const string otelTagName = "otel.AuthController";
        private const string LexboxSessionCookieName = "lexbox_session_id";
        private const string PostLoginRedirectConfigKey = "LexboxAuth:PostLoginRedirect";

        /// <summary> Gets authentication status for the current request. </summary>
        [HttpGet("status", Name = "GetAuthStatus")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(AuthStatus))]
        public IActionResult GetAuthStatus()
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting auth status");
            if (!_permissionService.IsCurrentUserAuthenticated(HttpContext))
            {
                return Forbid();
            }
            var sessionId = Request.Cookies[LexboxSessionCookieName];
            var user = _lexboxAuthService.GetLoggedInUser(sessionId);
            return user is null ? Ok(AuthStatus.LoggedOut()) : Ok(AuthStatus.LoggedInLexboxUser(user));
        }

        /// <summary> Generates a Lexbox login URL for OIDC sign-in. </summary>
        [HttpGet("lexbox/login-url", Name = "GetLexboxLoginUrl")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(LexboxLoginUrl))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public IActionResult GetLexboxLoginUrl([FromQuery] string? returnUrl = null)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting lexbox login url");
            if (!_permissionService.IsCurrentUserAuthenticated(HttpContext))
            {
                return Forbid();
            }

            try
            {
                var sessionId = Guid.NewGuid().ToString("N");
                Response.Cookies.Append(LexboxSessionCookieName, sessionId, new CookieOptions
                {
                    HttpOnly = true,
                    SameSite = SameSiteMode.Lax,
                    Secure = Request.IsHttps,
                    IsEssential = true,
                    Path = "/",
                });
                var normalizedReturnUrl = NormalizeReturnUrl(returnUrl) ??
                    NormalizeReturnUrl(_configuration[PostLoginRedirectConfigKey]);
                var result = _lexboxAuthService.CreateLoginUrl(Request, sessionId, normalizedReturnUrl);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return Problem(ex.Message, statusCode: StatusCodes.Status500InternalServerError);
            }
        }

        /// <summary> Completes the Lexbox OAuth login and stores the login status. </summary>
        [HttpGet("/api/auth/oauth-callback", Name = "LexboxOauthCallback")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(AuthStatus))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CompleteLexboxLogin([FromQuery] string? code, [FromQuery] string? state)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "completing lexbox login");
            if (!_permissionService.IsCurrentUserAuthenticated(HttpContext))
            {
                return Forbid();
            }

            if (string.IsNullOrWhiteSpace(code) || string.IsNullOrWhiteSpace(state))
            {
                return BadRequest("Missing code or state.");
            }

            var result = await _lexboxAuthService.CompleteLoginAsync(Request, code, state);
            if (result?.User is null)
            {
                return Ok(AuthStatus.LoggedOut());
            }

            var redirectUrl = NormalizeReturnUrl(result.ReturnUrl)
                ?? NormalizeReturnUrl(_configuration[PostLoginRedirectConfigKey]);
            return redirectUrl is null
                ? Ok(AuthStatus.LoggedInLexboxUser(result.User))
                : LocalRedirect(redirectUrl);
        }

        private static string? NormalizeReturnUrl(string? url)
        {
            if (string.IsNullOrWhiteSpace(url)) return null;
            if (!Uri.TryCreate(url, UriKind.RelativeOrAbsolute, out var uri)) return null;
            return uri.IsAbsoluteUri ? uri.PathAndQuery : uri.ToString();
        }
    }
}
