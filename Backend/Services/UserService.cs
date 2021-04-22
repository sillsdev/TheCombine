using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Bson;

namespace BackendFramework.Services
{
    /// <summary> More complex functions and application logic for <see cref="User"/>s </summary>
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepo;
        private readonly IUserRoleRepository _userRoleRepo;

        public UserService(IUserRepository userRepo, IUserRoleRepository userRoleRepo)
        {
            _userRepo = userRepo;
            _userRoleRepo = userRoleRepo;
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
            const int tokenExpirationMinutes = 60 * 4;
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

                Expires = DateTime.UtcNow.AddMinutes(tokenExpirationMinutes),

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

        /// <summary> Gets userid for specified email </summary>
        /// <returns> A string with the userid, or null if not found </returns>
        public async Task<string?> GetUserIdByEmail(string email)
        {
            var user = await _userRepo.GetUserByEmail(email);
            return user?.Id;
        }

        /// <summary> Gets userid for specified username </summary>
        /// <returns> A string with the userid, or null if not found </returns>
        public async Task<string?> GetUserIdByUsername(string username)
        {
            var user = await _userRepo.GetUserByUsername(username);
            return user?.Id;
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
