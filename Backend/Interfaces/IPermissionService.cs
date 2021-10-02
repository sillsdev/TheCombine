using System.Threading.Tasks;
using BackendFramework.Models;
using Microsoft.AspNetCore.Http;

namespace BackendFramework.Interfaces
{
    public interface IPermissionService
    {
        Task<bool> HasProjectPermission(HttpContext request, Permission permission);
        bool HasProjectPermission(HttpContext request, Permission permission, string projectId);
        Task<bool> IsSiteAdmin(HttpContext request);
        bool IsUserIdAuthorized(HttpContext request, string userId);
        Task<bool> IsViolationEdit(HttpContext request, string userEditId, string projectId);
        string GetUserId(HttpContext request);
        public bool IsCurrentUserAuthorized(HttpContext request);
        Task<User?> Authenticate(string username, string password);
        Task<User?> MakeJwt(User user);
    }
}
