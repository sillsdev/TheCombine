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

        public string GetUserId(HttpContext request)
        {
            var jsonToken = GetJWT(request);

            string userId = ((JwtSecurityToken)jsonToken).Payload["UserId"].ToString();

            return userId;
        } 

        public List<ProjectPermissions> GetProjectPermissions(HttpContext request)
        {
            var jsonToken = GetJWT(request);

            string userRoleInfo = ((JwtSecurityToken)jsonToken).Payload["UserRoleInfo"].ToString();
            List<ProjectPermissions> permissionsObj = Newtonsoft.Json.JsonConvert.DeserializeObject<List<ProjectPermissions>>(userRoleInfo);
            return permissionsObj;
        }

        public bool IsAuthenticated(string value, HttpContext request)
        {
            //retrieve jwt token from http request and convert to object
            List<ProjectPermissions> permissionsObj = GetProjectPermissions(request);

            //retrieve project Id from http request
            int indexOfProjId = request.Request.Path.ToString().LastIndexOf("projects/") + 9;
            if (indexOfProjId + projIdLength > request.Request.Path.ToString().Length)
            {
                //there is no project Id, this is a database level query and must have database admin level permissions
                return false;
            }
            else
            {
                string projId = request.Request.Path.ToString().Substring(indexOfProjId, projIdLength);

                //assert that the user has permission for this function
                foreach (var projectEntry in permissionsObj)
                {
                    if (projectEntry.ProjectId == projId)
                    {
                        int intValue;
                        Int32.TryParse(value, out intValue);
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
    }
}

