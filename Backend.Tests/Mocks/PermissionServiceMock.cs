using System;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Http;

namespace Backend.Tests.Mocks
{
    internal class PermissionServiceMock : IPermissionService
    {
        private readonly IUserRepository _userRepo;
        private const string NoHttpContextAvailable = "NO_HTTP_CONTEXT_AVAILABLE";
        private const string UnauthorizedHeader = "UNAUTHORIZED";

        public PermissionServiceMock(IUserRepository? userRepo = null)
        {
            _userRepo = userRepo ?? new UserRepositoryMock();
        }

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

        /// <param name="request">
        /// Note this parameter is nullable in the mock implementation even though the real implementation it is not
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

        public Task<User?> Authenticate(string username, string password)
        {
            try
            {
                var user = _userRepo.GetUserByUsername(username).Result;
                if (user is null)
                {
                    return Task.FromResult<User?>(null);
                }

                user = MakeJwt(user).Result;
                return Task.FromResult(user);
            }
            catch (InvalidOperationException)
            {
                return Task.FromResult<User?>(null);
            }
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
}
