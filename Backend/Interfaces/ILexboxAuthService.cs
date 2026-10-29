using System.Threading.Tasks;
using BackendFramework.Models;
using Microsoft.AspNetCore.Http;

namespace BackendFramework.Interfaces
{
    public interface ILexboxAuthService
    {
        /// <summary> Creates a short-lived, single-use ticket for starting Lexbox login as a Combine user. </summary>
        string CreateLoginTicket(string combineUserId);
        /// <summary> Consumes a login ticket. </summary>
        /// <returns> The Combine user id it was created for, or null if invalid, expired, or already used. </returns>
        string? RedeemLoginTicket(string? ticket);
        Task Challenge(HttpContext httpContext, string combineUserId);
        Task<LexboxAuthStatus> GetAuthStatus(HttpContext httpContext, string combineUserId);
        Task SignOut(HttpContext httpContext);
        Task<string?> TryGetAccessToken(HttpContext httpContext, string combineUserId);
    }
}
