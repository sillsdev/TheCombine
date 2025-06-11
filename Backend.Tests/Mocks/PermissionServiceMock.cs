using System;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Http;

namespace Backend.Tests.Mocks
{
    internal sealed class PermissionServiceMock : IPermissionService
    {
        private readonly IUserRepository _userRepo;
        private const string ExportId = "EXPORT_ID";
        private const string NoHttpContextAvailable = "NO_HTTP_CONTEXT_AVAILABLE";
        private const string UnauthorizedHeader = "UNAUTHORIZED";

        public PermissionServiceMock(IUserRepository? userRepo = null)
        {
            _userRepo = userRepo ?? new UserRepositoryMock();
        }

        /// <summary>
        /// Generates an HttpContext that will fail permissions checks in the mock.
        /// </summary>
        public static HttpContext UnauthorizedHttpContext(string? userId = null)
        {
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["Authorization"] = UnauthorizedHeader;
            if (userId is not null)
            {
                httpContext.Request.Headers["UserId"] = userId;
            }
            return httpContext;
        }

        /// <summary>
        /// Generates an HttpContext with the specified userId.
        /// </summary>
        public static HttpContext HttpContextWithUserId(string userId)
        {
            var httpContext = new DefaultHttpContext();
            httpContext.Request.Headers["UserId"] = userId;
            return httpContext;
        }

        private static bool IsAuthorizedHttpContext(HttpContext? request)
        {
            return request is null || request.Request.Headers["Authorization"] != UnauthorizedHeader;
        }

        /// <param name="request">
        /// Note this parameter is nullable in the mock implementation even though the real implementation it is not
        /// to support unit testing when `HttpContext`s are not available.
        /// </param>
        /// <returns>
        /// By default this will return true, unless the test passes in an <see cref="UnauthorizedHttpContext"/>.
        /// </returns>
        public Task<bool> IsSiteAdmin(HttpContext? request)
        {
            return Task.FromResult(IsAuthorizedHttpContext(request));
        }

        /// <param name="request">
        /// Note this parameter is nullable in the mock implementation even though the real implementation it is not
        /// to support unit testing when `HttpContext`s are not available.
        /// </param>
        /// <param name="userId"> Ignored. </param>
        /// <returns>
        /// By default this will return true, unless the test passes in an <see cref="UnauthorizedHttpContext"/>.
        /// </returns>
        public bool IsUserIdAuthorized(HttpContext? request, string userId)
        {
            return IsAuthorizedHttpContext(request);
        }

        /// <param name="request">
        /// Note this parameter is nullable in the mock implementation even though the real implementation it is not
        /// to support unit testing when `HttpContext`s are not available.
        /// </param>
        /// <returns>
        /// By default this will return true, unless the test passes in an <see cref="UnauthorizedHttpContext"/>.
        /// </returns>
        public bool IsCurrentUserAuthorized(HttpContext? request)
        {
            return IsAuthorizedHttpContext(request);
        }

        /// <param name="request">
        /// Note this parameter is nullable in the mock implementation even though the real implementation it is not
        /// to support unit testing when `HttpContext`s are not available.
        /// </param>
        /// <param name="permission"> Ignored. </param>
        /// <param name="projectId"> Ignored. </param>
        /// <returns>
        /// By default this will return true, unless the test passes in an <see cref="UnauthorizedHttpContext"/>.
        /// </returns>
        public Task<bool> HasProjectPermission(HttpContext? request, Permission permission, string projectId)
        {
            return Task.FromResult(IsAuthorizedHttpContext(request));
        }

        /// <param name="request">
        /// Note this parameter is nullable in the mock implementation even though the real implementation it is not
        /// to support unit testing when `HttpContext`s are not available.
        /// </param>
        /// <param name="role"> Ignored. </param>
        /// <param name="projectId"> Ignored. </param>
        /// <returns>
        /// By default this will return true, unless the test passes in an <see cref="UnauthorizedHttpContext"/>.
        /// </returns>
        public Task<bool> ContainsProjectRole(HttpContext? request, Role role, string projectId)
        {
            return Task.FromResult(IsAuthorizedHttpContext(request));
        }

        /// <returns> Always returns false. </returns>
        public Task<bool> IsViolationEdit(HttpContext request, string userEditId, string projectId)
        {
            return Task.FromResult(false);
        }

        /// <param name="request">
        /// Note this parameter is nullable in the mock implementation even though the real implementation is not
        /// to support unit testing when `HttpContext`s are not available.
        /// </param>
        public string GetExportId(HttpContext? request)
        {
            return request is null ? NoHttpContextAvailable : ExportId;
        }

        /// <param name="request">
        /// Note this parameter is nullable in the mock implementation even though the real implementation is not
        /// to support unit testing when `HttpContext`s are not available.
        /// </param>
        public string GetUserId(HttpContext? request)
        {
            if (request is null)
            {
                return NoHttpContextAvailable;
            }
            var userId = request.Request.Headers["UserId"].ToString();
            return userId;
        }

        public Task<User?> Authenticate(string emailOrUsername, string password)
        {
            var user = _userRepo.GetUserByEmailOrUsername(emailOrUsername).Result;
            user = user is null ? null : MakeJwt(user).Result;
            return Task.FromResult(user);
        }

        public Task<User?> MakeJwt(User user)
        {
            // The JWT Token below is generated here if you need to change its contents
            // https://jwt.io/#debugger-io?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOiIxMjM0MzQ1NiIsIlBlcm1pc3Npb25zIjp7IlByb2plY3RJZCI6IiIsIlBlcm1pc3Npb24iOlsiMSIsIjIiLCIzIiwiNCIsIjUiXX19.nK2zBCYYlvoIkkfq5XwArEUewiDRz0kpPwP9NaacDLk
            user.Token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOiIxMjM0MzQ1NiIsIlBlcm1pc3Npb25zIjp7IlByb2plY3RJZCI6IiIsIlBlcm1pc3Npb24iOlsiMSIsIjIiLCIzIiwiNCIsIjUiXX19.nK2zBCYYlvoIkkfq5XwArEUewiDRz0kpPwP9NaacDLk";
            _userRepo.Update(user.Id, user);
            user.Password = "";
            return Task.FromResult<User?>(user);
        }
    }

    internal sealed class UserAuthenticationException : Exception;
}
