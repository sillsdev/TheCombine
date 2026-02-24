using System;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Otel;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;

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

            var user = GetUserFromClaims(result.Principal);
            return user is null ? Ok(AuthStatus.LoggedOut()) : Ok(AuthStatus.LoggedIn(user));
        }

        /// <summary> Generates a Lexbox login URL for OIDC sign-in. </summary>
        [HttpGet("lexbox-login-url", Name = "GetLexboxLoginUrl")]
        [ProducesResponseType(StatusCodes.Status302Found)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetLexboxLoginUrl()
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting lexbox login url");

            var redirectUrl = NormalizeReturnUrl(_configuration[PostLoginRedirectConfigKey])
                ?? NormalizeReturnUrl(Domain.FrontendDomain)
                ?? "/";
            var authProperties = new AuthenticationProperties { RedirectUri = redirectUrl };

            return await ChallengeLexboxAsync(authProperties, "lexbox-login-url");
        }

        /// <summary> Starts Lexbox OpenID Connect login challenge. </summary>
        [HttpGet("lexbox-login", Name = "StartLexboxLogin")]
        [ProducesResponseType(StatusCodes.Status302Found)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> StartLexboxLogin([FromQuery] string? returnUrl)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "starting lexbox login");

            if (!_permissionService.IsCurrentUserAuthenticated(HttpContext))
            {
                return Forbid();
            }

            var redirectUrl = NormalizeReturnUrl(returnUrl)
                ?? NormalizeReturnUrl(_configuration[PostLoginRedirectConfigKey]);
            Console.WriteLine($"Redirect URL for OIDC login: {redirectUrl}");
            var authProperties = new AuthenticationProperties { RedirectUri = redirectUrl ?? "/" };

            return await ChallengeLexboxAsync(authProperties, "lexbox-login");
        }

        private async Task<IActionResult> ChallengeLexboxAsync(AuthenticationProperties authProperties, string source)
        {
            try
            {
                await HttpContext.ChallengeAsync(LexboxOidcScheme, authProperties);
                return new EmptyResult();
            }
            catch (Exception ex)
            {
                var authority = _configuration["LexboxAuth:Authority"] ?? "(null)";
                var metadataAddress = _configuration["LexboxAuth:OpenIdConfigUrl"] ?? "(null)";
                var callbackPath = _configuration["LexboxAuth:CallbackPath"] ?? "/v1/auth/oauth-callback";
                var configurationDiagnostic = "OpenIdConnect configuration manager not available.";

                var optionsMonitor = HttpContext.RequestServices.GetService(typeof(IOptionsMonitor<OpenIdConnectOptions>))
                    as IOptionsMonitor<OpenIdConnectOptions>;
                if (optionsMonitor is not null)
                {
                    var options = optionsMonitor.Get(LexboxOidcScheme);
                    if (options.ConfigurationManager is not null)
                    {
                        try
                        {
                            var discovered = await options.ConfigurationManager.GetConfigurationAsync(
                                HttpContext.RequestAborted);
                            configurationDiagnostic =
                                $"Discovery loaded. Issuer={discovered.Issuer}, AuthorizationEndpoint={discovered.AuthorizationEndpoint}, TokenEndpoint={discovered.TokenEndpoint}, UserInfoEndpoint={discovered.UserInfoEndpoint}";
                        }
                        catch (Exception discoveryEx)
                        {
                            configurationDiagnostic =
                                $"Discovery retrieval failed: {discoveryEx}";
                        }
                    }
                }

                Console.Error.WriteLine(
                    $"Lexbox OIDC challenge failed from {source}. Authority={authority}, Metadata={metadataAddress}, CallbackPath={callbackPath}. ConfigDiagnostic={configurationDiagnostic}. Exception={ex}");
                return Problem(
                    title: "Lexbox OIDC challenge failed",
                    detail: $"{ex}\n\n{configurationDiagnostic}",
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

        private static LexboxAuthUser? GetUserFromClaims(System.Security.Claims.ClaimsPrincipal principal)
        {
            var userId = principal.FindFirst("sub")?.Value?.Trim();
            if (string.IsNullOrEmpty(userId))
            {
                userId = principal.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value?.Trim();
            }

            var displayName = principal.FindFirst("preferred_username")?.Value
                ?? principal.FindFirst("email")?.Value
                ?? principal.FindFirst("name")?.Value
                ?? principal.FindFirst("upn")?.Value
                ?? principal.Identity?.Name;
            displayName = displayName?.Trim();
            if (string.IsNullOrEmpty(displayName))
            {
                displayName = userId;
            }

            return string.IsNullOrEmpty(displayName) && string.IsNullOrEmpty(userId)
                ? null
                : new LexboxAuthUser { DisplayName = displayName, UserId = userId };
        }
    }
}
