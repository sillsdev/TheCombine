using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace BackendFramework.Interfaces
{
    public interface IPermissionService
    {
        bool IsProjectAuthenticated(string value, HttpContext request);
        bool IsUserIdAuthenticated(HttpContext request, string userId);
        bool IsViolationEdit(HttpContext request, string userEditId, string ProjectId);
        string GetUserId(HttpContext request);
    }
}