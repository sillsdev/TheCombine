using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Http;

namespace Backend.Tests
{
    class PermissionServiceMock : IPermissionService
    {
        public bool IsUserIdAuthorized(HttpContext request, string userId)
        {
            return true;
        }

        public bool HasProjectPermission(Permission permission, HttpContext request)
        {
            return true;
        }

        public bool IsViolationEdit(HttpContext request, string userEditId, string projectId)
        {
            return false;
        }

        public string GetUserId(HttpContext request)
        {
            var userId = request.Request.Headers["UserId"].ToString();
            return userId;
        }
    }
}
