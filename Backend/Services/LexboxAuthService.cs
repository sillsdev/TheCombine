using System;
using System.Globalization;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;

namespace BackendFramework.Services
{
    public sealed class LexboxAuthService(IMemoryCache memoryCache) : ILexboxAuthService
    {
        private readonly IMemoryCache _memoryCache = memoryCache;

        public const string LexboxCookieScheme = "LexboxCookie";
        private const string LexboxOidcScheme = "LexboxOidc";

        /// <summary> Frontend page that reports the login to the opener and closes the login window. </summary>
        /// <remarks> Must match Path.LexboxLoginComplete in src/types/path.ts. </remarks>
        public const string LoginCompletePath = "/lexbox-login-complete";

        /// <summary> Claim tying a Lexbox cookie to the Combine user who signed in with it. </summary>
        public const string CombineUserIdClaimType = "combine_user_id";
        private const string CombineUserIdItem = "combine_user_id";

        private const string LoginTicketCachePrefix = "LexboxLoginTicket:";
        private static readonly TimeSpan LoginTicketLifetime = TimeSpan.FromMinutes(2);

        public string CreateLoginTicket(string combineUserId)
        {
            var ticket = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
            _memoryCache.Set(LoginTicketCachePrefix + ticket, combineUserId, LoginTicketLifetime);
            return ticket;
        }

        public string? RedeemLoginTicket(string? ticket)
        {
            if (string.IsNullOrEmpty(ticket))
            {
                return null;
            }
            var key = LoginTicketCachePrefix + ticket;
            if (!_memoryCache.TryGetValue(key, out string? combineUserId))
            {
                return null;
            }
            _memoryCache.Remove(key);
            return combineUserId;
        }

        public async Task Challenge(HttpContext httpContext, string combineUserId)
        {
            var properties = new AuthenticationProperties { RedirectUri = Domain.FrontendDomain + LoginCompletePath };
            properties.Items[CombineUserIdItem] = combineUserId;
            await httpContext.ChallengeAsync(LexboxOidcScheme, properties);
        }

        /// <summary>
        /// Moves the Combine user id from the challenge properties into a claim on the principal that the
        /// Lexbox cookie will hold.
        /// </summary>
        /// <returns> False if the properties have no Combine user id. </returns>
        public static bool AddCombineUserClaim(ClaimsPrincipal principal, AuthenticationProperties properties)
        {
            if (!properties.Items.TryGetValue(CombineUserIdItem, out var combineUserId)
                || string.IsNullOrEmpty(combineUserId) || principal.Identity is not ClaimsIdentity identity)
            {
                return false;
            }
            properties.Items.Remove(CombineUserIdItem);
            identity.AddClaim(new Claim(CombineUserIdClaimType, combineUserId));
            return true;
        }

        public async Task<LexboxAuthStatus> GetAuthStatus(HttpContext httpContext, string combineUserId)
        {
            var principal = (await AuthenticateForCombineUser(httpContext, combineUserId))?.Principal;
            return principal is null
                ? LexboxAuthStatus.LoggedOut()
                : LexboxAuthStatus.LoggedIn(GetUserFromClaims(principal));
        }

        public async Task SignOut(HttpContext httpContext)
        {
            await httpContext.SignOutAsync(LexboxCookieScheme);
        }

        public async Task<string?> TryGetAccessToken(HttpContext httpContext, string combineUserId)
        {
            var result = await AuthenticateForCombineUser(httpContext, combineUserId);
            return result?.Properties?.GetTokenValue("access_token");
        }

        /// <summary>
        /// Authenticates the Lexbox cookie, clearing it if it's unreadable, belongs to a different Combine user,
        /// or holds an expired access token.
        /// </summary>
        /// <returns> The successful result, or null. </returns>
        private static async Task<AuthenticateResult?> AuthenticateForCombineUser(
            HttpContext httpContext, string combineUserId)
        {
            var result = await httpContext.AuthenticateAsync(LexboxCookieScheme);
            if (result.Succeeded && result.Principal?.FindFirst(CombineUserIdClaimType)?.Value == combineUserId
                && !IsAccessTokenExpired(result.Properties))
            {
                return result;
            }

            // Clear a stale or undecryptable cookie (e.g. after a server restart loses Data Protection keys),
            // one left by another Combine user of this browser, or one whose access token Lexbox would reject.
            if (httpContext.Request.Cookies.ContainsKey("lexbox_auth"))
            {
                await httpContext.SignOutAsync(LexboxCookieScheme);
            }
            return null;
        }

        /// <summary>
        /// The cookie can outlive Lexbox's access token, so check the expiry saved with the token.
        /// </summary>
        private static bool IsAccessTokenExpired(AuthenticationProperties? properties)
        {
            var expiresAt = properties?.GetTokenValue("expires_at");
            return DateTimeOffset.TryParse(expiresAt, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind,
                out var expiry) && expiry <= DateTimeOffset.UtcNow;
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
