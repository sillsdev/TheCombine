using System.Threading.Tasks;
using BackendFramework.Models;
using Microsoft.AspNetCore.Http;

namespace BackendFramework.Interfaces
{
    public interface IPermissionService
    {
        Task<bool> HasProjectPermission(HttpContext request, Permission permission);
        bool IsUserIdAuthorized(HttpContext request, string userId);
        Task<bool> IsViolationEdit(HttpContext request, string userEditId, string projectId);
        string GetUserId(HttpContext request);
    }
}
