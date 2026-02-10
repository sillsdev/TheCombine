using BackendFramework.Models;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace BackendFramework.Interfaces
{
    public interface ILexboxAuthService
    {
        LexboxLoginUrl CreateLoginUrl(HttpRequest request, string sessionId, string? returnUrl);
        Task<LexboxAuthResult?> CompleteLoginAsync(HttpRequest request, string code, string state);
        LexboxAuthUser? GetLoggedInUser(string? sessionId);
    }
}
