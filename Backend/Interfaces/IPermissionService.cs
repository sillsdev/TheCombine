using Microsoft.AspNetCore.Http;

namespace BackendFramework.Interfaces
{
    public interface IPermissionService
    {
        bool IsAuthenticated(string value, HttpContext request);
        string GetUserId(HttpContext request);
    }
}