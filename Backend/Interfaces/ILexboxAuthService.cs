using BackendFramework.Models;
using Microsoft.AspNetCore.Http;

namespace BackendFramework.Interfaces
{
    public interface ILexboxAuthService
    {
        LexboxLoginUrl CreateLoginUrl(HttpRequest request);
    }
}
