using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;

namespace BackendFramework.Services
{
    public class PermissionService : IPermissionService
    {
        private readonly IUserService _userService;

        public PermissionService(IUserService userService)
        {
            _userService = userService;
        }

        // TODO: This appears intrinsic to mongodb implementation and is brittle.
        private const int ProjIdLength = 24;

        private static SecurityToken GetJwt(HttpContext request)
        {
            // Get authorization header (i.e. JWT token)
            var jwtToken = request.Request.Headers["Authorization"].ToString();

            // Remove "Bearer" from beginning of token
            var token = jwtToken.Split(" ")[1];

            // Parse JWT for project permissions
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token);

            return jsonToken;
        }

        public bool IsUserIdAuthorized(HttpContext request, string userId)
        {
            var jsonToken = GetJwt(request);
            var foundUserId = ((JwtSecurityToken)jsonToken).Payload["UserId"].ToString();
            return userId == foundUserId;
        }

        private static List<ProjectPermissions> GetProjectPermissions(HttpContext request)
        {
            var jsonToken = GetJwt(request);
            var userRoleInfo = ((JwtSecurityToken)jsonToken).Payload["UserRoleInfo"].ToString();
            var permissionsObj = JsonConvert.DeserializeObject<List<ProjectPermissions>>(userRoleInfo);
            return permissionsObj;
        }

        public async Task<bool> HasProjectPermission(HttpContext request, Permission permission)
        {
            var userId = GetUserId(request);
            var user = await _userService.GetUser(userId);
            if (user is null)
            {
                return false;
            }

            // Database administrators implicitly possess all permissions.
            if (user.IsAdmin)
            {
                return true;
            }

            // Retrieve JWT token from HTTP request and convert to object
            var permissionsObj = GetProjectPermissions(request);

            // Retrieve project ID from HTTP request
            // TODO: This method of retrieving the project ID is brittle, should use regex or some other method.
            const string projectPath = "projects/";
            var indexOfProjId = request.Request.Path.ToString().LastIndexOf(projectPath) + projectPath.Length;
            if (indexOfProjId + ProjIdLength > request.Request.Path.ToString().Length)
            {
                // If there is no project ID and they are not admin, do not allow changes
                return user.IsAdmin;
            }

            var projId = request.Request.Path.ToString().Substring(indexOfProjId, ProjIdLength);

            // Assert that the user has permission for this function
            foreach (var projectEntry in permissionsObj)
            {
                if (projectEntry.ProjectId == projId)
                {
                    if (projectEntry.Permissions.Contains((int)permission))
                    {
                        return true;
                    }
                }
            }
            return false;
        }

        public async Task<bool> IsViolationEdit(HttpContext request, string userEditId, string projectId)
        {
            var userId = GetUserId(request);
            var user = await _userService.GetUser(userId);
            if (user is null)
            {
                return true;
            }

            return user.WorkedProjects[projectId] != userEditId;
        }

        /// <summary>Retrieve the User ID from the JWT in a request. </summary>
        public string GetUserId(HttpContext request)
        {
            var jsonToken = GetJwt(request);
            var userId = ((JwtSecurityToken)jsonToken).Payload["UserId"].ToString();
            if (userId is null)
            {
                throw new InvalidJwtTokenError();
            }

            return userId;
        }

        [Serializable]
        public class InvalidJwtTokenError : Exception
        {
            public InvalidJwtTokenError()
            { }

            public InvalidJwtTokenError(string message)
                : base(message)
            { }

            public InvalidJwtTokenError(string message, Exception innerException)
                : base(message, innerException)
            { }
        }
    }
}

