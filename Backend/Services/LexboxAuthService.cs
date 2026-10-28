using System;
using System.Security.Claims;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;

namespace BackendFramework.Services
{
    public sealed class LexboxAuthService : ILexboxAuthService
    {
        public const string LexboxCookieScheme = "LexboxCookie";
        private const string LexboxOidcScheme = "LexboxOidc";

        /// <summary> Frontend page that reports the login to the opener and closes the login window. </summary>
        /// <remarks> Must match Path.LexboxLoginComplete in src/types/path.ts. </remarks>
        public const string LoginCompletePath = "/lexbox-login-complete";

        public async Task Challenge(HttpContext httpContext)
        {
            var redirectUrl = Domain.FrontendDomain + LoginCompletePath;
            await httpContext.ChallengeAsync(LexboxOidcScheme, new() { RedirectUri = redirectUrl });
        }

        public async Task<LexboxAuthStatus> GetAuthStatus(HttpContext httpContext)
        {
            var result = await httpContext.AuthenticateAsync(LexboxCookieScheme);
            if (!result.Succeeded || result.Principal is null)
            {
                // Clear any stale or undecryptable cookie (e.g. after a server restart loses Data Protection keys)
                if (httpContext.Request.Cookies.ContainsKey("lexbox_auth"))
                {
                    await httpContext.SignOutAsync(LexboxCookieScheme);
                }
                return LexboxAuthStatus.LoggedOut();
            }

            return LexboxAuthStatus.LoggedIn(GetUserFromClaims(result.Principal));
        }

        public async Task SignOut(HttpContext httpContext)
        {
            await httpContext.SignOutAsync(LexboxCookieScheme);
        }

        public async Task<string?> TryGetAccessToken(HttpContext httpContext)
        {
            var result = await httpContext.AuthenticateAsync(LexboxCookieScheme);
            return result.Properties?.GetTokenValue("access_token");
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
