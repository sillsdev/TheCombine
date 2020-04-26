using BackendFramework.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Tokens;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using BackendFramework.Models;

namespace BackendFramework.Services
{
    public class PermissionService : IPermissionService
    {
        private readonly IUserService _userService;

        public PermissionService(IUserService userService)
        {
            _userService = userService;
        }

        private const int ProjIdLength = 24;

        private static SecurityToken GetJwt(HttpContext request)
        {
            // Get authorization header i.e. JWT token
            var jwtToken = request.Request.Headers["Authorization"].ToString();

            // "remove "Bearer" from beginning of token
            string token = jwtToken.Split(" ")[1];

            // Parse JWT for project permissions
            var handler = new JwtSecurityTokenHandler();
            SecurityToken jsonToken = handler.ReadToken(token);

            return jsonToken;
        }

        public bool IsUserIdAuthorized(HttpContext request, string userId)
        {
            SecurityToken jsonToken = GetJwt(request);
            var foundUserId = ((JwtSecurityToken)jsonToken).Payload["UserId"].ToString();
            return userId == foundUserId;
        }

        public static List<ProjectPermissions> GetProjectPermissions(HttpContext request)
        {
            SecurityToken jsonToken = GetJwt(request);

            var userRoleInfo = ((JwtSecurityToken)jsonToken).Payload["UserRoleInfo"].ToString();
            var permissionsObj = Newtonsoft.Json.JsonConvert.DeserializeObject<List<ProjectPermissions>>(userRoleInfo);
            return permissionsObj;
        }

        public bool IsProjectAuthorized(string value, HttpContext request)
        {
            // Retrieve JWT token from http request and convert to object
            var permissionsObj = GetProjectPermissions(request);

            // Retrieve project Id from http request
            const int begOfId = 9;
            int indexOfProjId = request.Request.Path.ToString().LastIndexOf("projects/") + begOfId;
            if (indexOfProjId + ProjIdLength > request.Request.Path.ToString().Length)
            {
                // Check if admin
                string userId = GetUserId(request);
                User user = _userService.GetUser(userId).Result;

                // If there is no project Id and they are not admin, do not allow changes
                return user.IsAdmin;
            }
            else
            {
                string projId = request.Request.Path.ToString().Substring(indexOfProjId, ProjIdLength);

                // Assert that the user has permission for this function
                foreach (ProjectPermissions projectEntry in permissionsObj)
                {
                    if (projectEntry.ProjectId == projId)
                    {
                        int.TryParse(value, out int intValue);
                        if (projectEntry.Permissions.Contains(intValue))
                        {
                            return true;
                        }
                    }
                }
                return false;
            }
        }

        public bool IsViolationEdit(HttpContext request, string userEditId, string projectId)
        {
            string userId = GetUserId(request);
            User userObj = _userService.GetUser(userId).Result;

            return userObj.WorkedProjects[projectId] != userEditId;
        }

        public string GetUserId(HttpContext request)
        {
            SecurityToken jsonToken = GetJwt(request);
            var permissionsObj = ((JwtSecurityToken)jsonToken).Payload["UserId"].ToString();
            return permissionsObj;
        }
    }
}

