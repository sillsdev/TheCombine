using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using System;



namespace BackendFramework.Services
{
    public class EmailInviteService : IEmailInviteService
    {
        private readonly IUserService _userService;
        private readonly IUserRoleService _userRoleService;
        private readonly IProjectService _projectService;

        public EmailInviteService(IUserService userService, IUserRoleService userRoleService, IProjectService projectService)
        {
            _userService = userService;
            _userRoleService = userRoleService;
            _projectService = projectService;
        }

        public async Task<string> CreateLinkWithToken(string projectId, string emailAddress)
        {
            var project = await _projectService.GetProject(projectId);
            var token = project.CreateToken();

            string linkWithIdentifier = "v1/projects/" + projectId + "/" + token;
            return linkWithIdentifier;
        }
        public async Task<bool> RemoveTokenAndCreateUserRole(Project project, string userId, string token)
        {
            try
            {
                project.InviteTokens.Remove(token);

                var user = await _userService.GetUser(userId);
                var userRole = new UserRole
                {
                    Permissions = new List<int>
                {
                    1,
                    2,
                    3,
                },
                    ProjectId = project.Id
                };
                userRole = await _userRoleService.Create(userRole);
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }
    }
}