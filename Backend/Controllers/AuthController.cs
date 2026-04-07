using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
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
    public class AuthController(IConfiguration configuration, IHttpClientFactory httpClientFactory,
        IPermissionService permissionService) : Controller
    {
        private readonly IConfiguration _configuration = configuration;
        private readonly IHttpClientFactory _httpClientFactory = httpClientFactory;
        private readonly IPermissionService _permissionService = permissionService;

        private const string otelTagName = "otel.AuthController";
        private const string LexboxCookieScheme = "LexboxCookie";
        private const string LexboxOidcScheme = "LexboxOidc";
        private const string PostLoginRedirectConfigKey = "LexboxAuth:PostLoginRedirect";
        private const string LexboxGraphQlUrl = "https://lexbox.org/api/graphql";
        private const string LexboxMyProjectsQuery = @"query {
    myProjects {
        id
        parentId
        code
        name
        description
        retentionPolicy
        type
        isConfidential
        repoSizeInKb
        resetStatus
        projectOrigin
        userCount
        flexProjectMetadata {
            projectId
            lexEntryCount
            langProjectId
            flexModelVersion
            writingSystems {
                vernacularWss {
                    tag
                    isActive
                    isDefault
                }
                analysisWss {
                    tag
                    isActive
                    isDefault
                }
            }
        }
    }
}";

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
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(LexboxProject[]))]
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

            var httpClient = _httpClientFactory.CreateClient();
            httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", accessToken);

            var response = await httpClient.PostAsJsonAsync(LexboxGraphQlUrl,
                new GraphQlQuery { Query = LexboxMyProjectsQuery });

            if (!response.IsSuccessStatusCode)
            {
                var responseBody = await response.Content.ReadAsStringAsync();
                return Problem(
                    title: "Lexbox GraphQL request failed",
                    detail: $"Status: {(int)response.StatusCode} {response.ReasonPhrase}"
                        + (string.IsNullOrEmpty(responseBody) ? "" : $"\nBody: {responseBody}"),
                    statusCode: StatusCodes.Status502BadGateway);
            }

            var graph = await response.Content.ReadFromJsonAsync<GraphQlResponse<LexboxMyProjectsData>>();
            if (graph is null)
            {
                return Problem(
                    title: "Lexbox GraphQL response was empty",
                    statusCode: StatusCodes.Status502BadGateway);
            }

            if (graph.Errors is { Length: > 0 })
            {
                var errorText = string.Join("; ", graph.Errors.Select(e => e.Message).Where(m => !string.IsNullOrEmpty(m)));
                return Problem(
                    title: "Lexbox GraphQL returned errors",
                    detail: errorText,
                    statusCode: StatusCodes.Status502BadGateway);
            }

            return Ok(graph.Data?.MyProjects ?? []);
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

        private sealed class GraphQlQuery
        {
            public required string Query { get; init; }
        }

        private sealed class GraphQlResponse<T>
        {
            public T? Data { get; init; }
            public GraphQlError[]? Errors { get; init; }
        }

        private sealed class GraphQlError
        {
            public string? Message { get; init; }
        }

        private sealed class LexboxMyProjectsData
        {
            public List<LexboxProject> MyProjects { get; init; } = [];
        }

        public sealed class LexboxProject
        {
            public Guid Id { get; init; }
            public Guid? ParentId { get; init; }
            public string Code { get; init; } = "";
            public string Name { get; init; } = "";
            public string? Description { get; init; }
            public string RetentionPolicy { get; init; } = "";
            public string Type { get; init; } = "";
            public bool? IsConfidential { get; init; }
            public int? RepoSizeInKb { get; init; }
            public string ResetStatus { get; init; } = "";
            public string ProjectOrigin { get; init; } = "";
            public int UserCount { get; init; }
            public FlexProjectMetadataDto? FlexProjectMetadata { get; init; }
        }

        public sealed class FlexProjectMetadataDto
        {
            public Guid ProjectId { get; init; }
            public int? LexEntryCount { get; init; }
            public Guid? LangProjectId { get; init; }
            public int? FlexModelVersion { get; init; }
            public ProjectWritingSystemsDto? WritingSystems { get; init; }
        }

        public sealed class ProjectWritingSystemsDto
        {
            public List<FLExWsIdDto> VernacularWss { get; init; } = [];
            public List<FLExWsIdDto> AnalysisWss { get; init; } = [];
        }

        public sealed class FLExWsIdDto
        {
            public string Tag { get; init; } = "";
            public bool IsActive { get; init; }
            public bool IsDefault { get; init; }
        }
    }
}
