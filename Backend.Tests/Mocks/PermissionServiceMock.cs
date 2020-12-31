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
        ///
        /// <param name="request">
        /// Note this parameter is nullable in the mock implementation even though the real implementation it is not
        /// to support unit testing when `HttpContext`s are not available.
        /// </param>
        /// </summary>
        public Task<bool> HasProjectPermission(HttpContext? request, Permission permission)
        {
            return Task.FromResult(request is null || request.Request.Headers["Authorization"] != UnauthorizedHeader);
        }

        public Task<bool> IsViolationEdit(HttpContext request, string userEditId, string projectId)
        {
            return Task.FromResult(false);
        }

        public string GetUserId(HttpContext request)
        {
            var userId = request.Request.Headers["UserId"].ToString();
            return userId;
        }
    }
}
