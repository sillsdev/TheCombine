using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Tokens;

namespace BackendFramework.Services
{
    public class PermissionService : IPermissionService
    {
        private readonly IUserRepository _userRepo;
        private readonly IUserRoleRepository _userRoleRepo;

        public PermissionService(IUserRepository userRepo, IUserRoleRepository userRoleRepo)
        {
            _userRepo = userRepo;
            _userRoleRepo = userRoleRepo;
        }

        /// <summary> Extracts the JWT token from the given HTTP context. </summary>
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

        /// <summary> Checks whether the given user is authorized. </summary>
        public bool IsUserIdAuthorized(HttpContext request, string userId)
        {
            return userId == GetUserId(request);
        }

        /// <summary> Checks whether the current user is authorized. </summary>
        public bool IsCurrentUserAuthorized(HttpContext request)
        {
            return !string.IsNullOrEmpty(GetUserId(request));
        }

        /// <summary> Checks whether the current user is a site admin. </summary>
        public async Task<bool> IsSiteAdmin(HttpContext request)
        {
            var user = await _userRepo.GetUser(GetUserId(request));
            return user?.IsAdmin ?? false;
        }

        /// <summary> Checks whether the current user has the given project permission. </summary>
        public async Task<bool> HasProjectPermission(HttpContext request, Permission permission, string projectId)
        {
            var user = await _userRepo.GetUser(GetUserId(request));
            if (user is null)
            {
                return false;
            }

            // Site administrators implicitly possess all permissions.
            if (user.IsAdmin)
            {
                return true;
            }

            user.ProjectRoles.TryGetValue(projectId, out var userRoleId);
            if (userRoleId is null)
            {
                return false;
            }

            var userRole = await _userRoleRepo.GetUserRole(projectId, userRoleId);
            if (userRole is null)
            {
                return false;
            }

            return ProjectRole.RolePermissions(userRole.Role).Contains(permission);
        }

        /// <summary> Checks whether the current user has all permissions of the given project role. </summary>
        public async Task<bool> ContainsProjectRole(HttpContext request, Role role, string projectId)
        {
            var user = await _userRepo.GetUser(GetUserId(request));
            if (user is null)
            {
                return false;
            }

            // Database administrators implicitly possess all permissions.
            if (user.IsAdmin)
            {
                return true;
            }

            user.ProjectRoles.TryGetValue(projectId, out var userRoleId);
            if (userRoleId is null)
            {
                return false;
            }

            var userRole = await _userRoleRepo.GetUserRole(projectId, userRoleId);
            if (userRole is null)
            {
                return false;
            }

            return ProjectRole.RoleContainsRole(userRole.Role, role);
        }

        /// <summary> Checks whether the given project user edit is a mismatch with the current user. </summary>
        /// <returns> bool: true if a the userEditIds don't match. </returns>
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

        /// <returns> TraceIdentifier for the request. If null, returns an empty string. </returns>
        public string GetExportId(HttpContext request)
        {
            return request.TraceIdentifier ?? "";
        }

        /// <summary>Retrieve the User ID from the JWT in a request. </summary>
        /// <exception cref="InvalidJwtTokenException"> Throws when null userId extracted from token. </exception>
        public string GetUserId(HttpContext request)
        {
            var token = (JwtSecurityToken)GetJwt(request);
            var userId = token.Payload["UserId"].ToString() ?? throw new InvalidJwtTokenException();
            return userId;
        }

        /// <summary> Confirms login credentials are valid. </summary>
        /// <returns> User when credentials are correct, null otherwise. </returns>
        public async Task<User?> Authenticate(string emailOrUsername, string password)
        {
            // Fetch the stored user.
            var user = await _userRepo.GetUserByEmailOrUsername(emailOrUsername, false);

            // Return null if user with specified email/username not found.
            if (user is null)
            {
                return null;
            }

            // Extract the bytes from encoded password.
            var hashedPassword = Convert.FromBase64String(user.Password);

            // If authentication is successful, generate jwt token.
            return PasswordHash.ValidatePassword(hashedPassword, password) ? await MakeJwt(user) : null;
        }

        /// <summary> Creates a JWT token for the given user. </summary>
        public async Task<User?> MakeJwt(User user)
        {
            const int hoursUntilExpires = 12;
            var tokenHandler = new JwtSecurityTokenHandler();
            var secretKey = Environment.GetEnvironmentVariable("COMBINE_JWT_SECRET_KEY")!;
            var key = Encoding.ASCII.GetBytes(secretKey);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[] { new Claim("UserId", user.Id) }),
                Expires = DateTime.UtcNow.AddHours(hoursUntilExpires),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);

            // Sanitize user to remove password, avatar path, and old token
            // Then add updated token.
            user.Sanitize();
            user.Token = tokenHandler.WriteToken(token);

            var updateResult = await _userRepo.Update(user.Id, user);
            return updateResult == ResultOfUpdate.Updated ? user : null;
        }

        public sealed class InvalidJwtTokenException : Exception
        {
            public InvalidJwtTokenException() { }

            public InvalidJwtTokenException(string msg) : base(msg) { }

            public InvalidJwtTokenException(string msg, Exception innerException) : base(msg, innerException) { }
        }
    }
}

