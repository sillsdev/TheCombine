using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Http;

namespace Backend.Tests.Mocks
{
    internal class PermissionServiceMock : IPermissionService
    {
        private const string UnauthorizedHeader = "UNAUTHORIZED";

        /// <summary>
        /// Generates an HttpContext that will fail permissions checks in the mock.
        /// </summary>
        public static HttpContext UnauthorizedHttpContext()
        {
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization"] = UnauthorizedHeader;
            return httpContext;
        }

        public bool IsUserIdAuthorized(HttpContext request, string userId)
        {
            return true;
        }

        /// <summary>
        /// By default this will return true, unless the test passes in an <see cref="UnauthorizedHttpContext"/>.
        /// </summary>
        public Task<bool> HasProjectPermission(HttpContext request, Permission permission)
        {
            return Task.FromResult(request is null || request.Request.Headers["Authorization"] != UnauthorizedHeader);
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
