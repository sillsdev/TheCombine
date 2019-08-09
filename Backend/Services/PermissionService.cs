using BackendFramework.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;

namespace BackendFramework.Services
{
    public class PermissionService : IPermissionService
    {
        private readonly IUserService _userService;

        public PermissionService(IUserService userService)
        {
            _userService = userService;
        }

        const int projIdLength = 24;

        private SecurityToken GetJWT(HttpContext request)
        {
            //get authorization header i.e. JWT token
            var jwtToken = request.Request.Headers["Authorization"].ToString();

            // "remove "Bearer" from beginning of token
            var token = jwtToken.Split(" ")[1];

            //parse JWT for project permissions
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token);

            return jsonToken;
        }

        public bool IsUserIdAuthorized(HttpContext request, string userId)
        {
            var jsonToken = GetJWT(request);

            string foundUserId = ((JwtSecurityToken)jsonToken).Payload["UserId"].ToString();

            return userId == foundUserId;
        }

        public List<ProjectPermissions> GetProjectPermissions(HttpContext request)
        {
            var jsonToken = GetJWT(request);

            string userRoleInfo = ((JwtSecurityToken)jsonToken).Payload["UserRoleInfo"].ToString();
            List<ProjectPermissions> permissionsObj = Newtonsoft.Json.JsonConvert.DeserializeObject<List<ProjectPermissions>>(userRoleInfo);
            return permissionsObj;
        }

        public bool IsProjectAuthorized(string value, HttpContext request)
        {
            //retrieve jwt token from http request and convert to object
            List<ProjectPermissions> permissionsObj = GetProjectPermissions(request);

            //retrieve project Id from http request
            int begOfId = 9;
            int indexOfProjId = request.Request.Path.ToString().LastIndexOf("projects/") + begOfId;
            if (indexOfProjId + projIdLength > request.Request.Path.ToString().Length)
            {
                //check if admin
                var userId = GetUserId(request);
                var user = _userService.GetUser(userId).Result;

                //if there is no project Id and they are not admin, do not allow changes
                return user.IsAdmin;
            }
            else
            {
                string projId = request.Request.Path.ToString().Substring(indexOfProjId, projIdLength);

                //assert that the user has permission for this function
                foreach (var projectEntry in permissionsObj)
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
            var userId = GetUserId(request);
            var userObj = _userService.GetUser(userId).Result;

            if (userObj.WorkedProjects[projectId] != userEditId)
            {
                return true;
            }

            return false;
        }

        public string GetUserId(HttpContext request)
        {
            var jsonToken = GetJWT(request);
            string permissionsObj = ((JwtSecurityToken)jsonToken).Payload["UserId"].ToString();
            return permissionsObj;
        }
    }
}

