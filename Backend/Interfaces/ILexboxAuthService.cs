using System.Threading.Tasks;
using BackendFramework.Models;
using Microsoft.AspNetCore.Http;

namespace BackendFramework.Interfaces
{
    public interface ILexboxAuthService
    {
        Task Challenge(HttpContext httpContext);
        Task<LexboxAuthStatus> GetAuthStatus(HttpContext httpContext);
        Task SignOut(HttpContext httpContext);
        Task<string?> TryGetAccessToken(HttpContext httpContext);
    }
}
