using BackendFramework.Interfaces;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;

namespace BackendFramework.Services
{
    public class PermissionService : IPermissionService
    {
        const int projIdLength = 24;

        public PermissionService()
        {
            
        }

        public string GetUserId(HttpContext request)
        {
            var jwtToken = request.Request.Headers["Authorization"].ToString();
            var token = jwtToken.Split(" ")[1];
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token);
            string userId = ((JwtSecurityToken)jsonToken).Payload["UserId"].ToString();

            return userId;
        }

        public bool IsAuthenticated(string value, HttpContext request)
        {
            //retrieve jwt token from http request and convert to object
            var jwtToken = request.Request.Headers["Authorization"].ToString();
            var token = jwtToken.Split(" ")[1];
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(token);
            string userRoleInfo = ((JwtSecurityToken)jsonToken).Payload["UserRoleInfo"].ToString();
            List<ProjectPermissions> permissionsObj = Newtonsoft.Json.JsonConvert.DeserializeObject<List<ProjectPermissions>>(userRoleInfo);

            //retrieve project Id from http request
            int indexOfProjId = request.Request.Path.ToString().LastIndexOf("projects/");
            if (indexOfProjId + projIdLength > request.Request.Path.ToString().Length)
            {
                //there is no project Id, this is a database level query and must have database admin level permissions
                return false;
            }
            else {
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

        //public bool IsAuthenticated(string v, HttpContext request, string projectId)
        //{
            
        //}
    }
}
