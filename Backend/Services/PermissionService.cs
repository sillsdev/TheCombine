using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using MongoDB.Bson;

namespace BackendFramework.Services
{
    public class PermissionService : IPermissionService
    {
        private readonly IUserRepository _userRepo;
        private readonly IUserRoleRepository _userRoleRepo;

        // TODO: This appears intrinsic to mongodb implementation and is brittle.
        private const int ProjIdLength = 24;

        public PermissionService(IUserRepository userRepo, IUserRoleRepository userRoleRepo)
        {
            _userRepo = userRepo;
            _userRoleRepo = userRoleRepo;
        }

        private static SecurityToken GetJwt(HttpContext request)
        {
            // Get authorization header (i.e. JWT token)
            var jwtToken = request.Request.Headers["Authorization"].ToString();

            // Remove "Bearer " from beginning of token
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
            var user = await _userRepo.GetUser(userId);
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
            var user = await _userRepo.GetUser(userId);
            if (user is null)
            {
                return true;
            }

            return user.WorkedProjects[projectId] != userEditId;
        }

        /// <summary>Retrieve the User ID from the JWT in a request. </summary>
        /// <exception cref="InvalidJwtTokenError"> Throws when null userId extracted from token. </exception>
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

        /// <summary> Confirms login credentials are valid. </summary>
        /// <returns> User when credentials are correct, null otherwise. </returns>
        public async Task<User?> Authenticate(string username, string password)
        {
            // Fetch the stored user.
            var user = await _userRepo.GetUserByUsername(username);

            // Return null if user with specified username not found.
            if (user is null)
            {
                return null;
            }

            // Extract the bytes from encoded password.
            var hashedPassword = Convert.FromBase64String(user.Password);

            // If authentication is successful, generate jwt token.
            return PasswordHash.ValidatePassword(hashedPassword, password) ? await MakeJwt(user) : null;
        }

        public async Task<User?> MakeJwt(User user)
        {
            const int hoursUntilExpires = 4;
            var tokenHandler = new JwtSecurityTokenHandler();
            var secretKey = Environment.GetEnvironmentVariable("COMBINE_JWT_SECRET_KEY")!;
            var key = Encoding.ASCII.GetBytes(secretKey);

            // Fetch the projects Id and the roles for each Id
            var projectPermissionMap = new List<ProjectPermissions>();

            foreach (var (projectRoleKey, projectRoleValue) in user.ProjectRoles)
            {
                // Convert each userRoleId to its respective role and add to the mapping
                var userRole = await _userRoleRepo.GetUserRole(projectRoleKey, projectRoleValue);
                if (userRole is null)
                {
                    return null;
                }

                var validEntry = new ProjectPermissions(projectRoleKey, userRole.Permissions);
                projectPermissionMap.Add(validEntry);
            }

            var claimString = projectPermissionMap.ToJson();
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim("UserId", user.Id),
                    new Claim("UserRoleInfo", claimString)
                }),

                Expires = DateTime.UtcNow.AddHours(hoursUntilExpires),

                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);

            // Sanitize user to remove password, avatar path, and old token
            // Then add updated token.
            user.Sanitize();
            user.Token = tokenHandler.WriteToken(token);

            if (await _userRepo.Update(user.Id, user) != ResultOfUpdate.Updated)
            {
                return null;
            }

            return user;
        }

        [Serializable]
        public class InvalidJwtTokenError : Exception
        {
            public InvalidJwtTokenError() { }

            public InvalidJwtTokenError(string message) : base(message) { }

            public InvalidJwtTokenError(string message, Exception innerException) : base(message, innerException) { }
        }
    }

    public class ProjectPermissions
    {
        public ProjectPermissions(string projectId, List<int> permissions)
        {
            ProjectId = projectId;
            Permissions = permissions;
        }
        public string ProjectId { get; }
        public List<int> Permissions { get; }
    }
}

