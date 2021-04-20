using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using MimeKit;

namespace BackendFramework.Services
{
    /// <summary> More complex functions and application logic for <see cref="Project"/>s </summary>
    public class ProjectService : IProjectService
    {
        private readonly IProjectRepository _projRepo;
        private readonly IUserRepository _userRepo;
        private readonly IUserService _userService;
        private readonly IUserRoleRepository _userRoleRepo;
        private readonly IEmailService _emailService;

        public ProjectService(IProjectRepository projRepo, IUserRepository userRepo,
            IUserService userService, IUserRoleRepository userRoleRepo, IEmailService emailService)
        {
            _projRepo = projRepo;
            _userRepo = userRepo;
            _userService = userService;
            _userRoleRepo = userRoleRepo;
            _emailService = emailService;
        }

        public async Task<string> CreateLinkWithToken(Project project, string emailAddress)
        {
            var token = new EmailInvite(2, emailAddress);
            project.InviteTokens.Add(token);
            await _projRepo.Update(project.Id, project);

            var linkWithIdentifier = "/invite/" + project.Id + "/" + token.Token;
            return linkWithIdentifier;
        }

        public async Task<bool> EmailLink(string emailAddress, string emailMessage, string link, string domain, Project project)
        {
            // create email
            var message = new MimeMessage();
            message.To.Add(new MailboxAddress("FutureCombineUser", emailAddress));
            message.Subject = "TheCombine Project Invite";
            message.Body = new TextPart("plain")
            {
                Text = $"You have been invited to a TheCombine project called {project.Name}. \n" +
                       $"To become a member of this project, go to {domain}{link}. \n\n" +
                       $"Message from Project Admin: {emailMessage} \n\n" +
                       "If you did not expect an invite please ignore this email."
            };
            return await _emailService.SendEmail(message);
        }

        public async Task<bool> RemoveTokenAndCreateUserRole(Project project, User user, EmailInvite emailInvite)
        {
            try
            {
                var userRole = new UserRole
                {
                    Permissions = new List<int>
                {
                    (int) Permission.MergeAndCharSet,
                    (int) Permission.Unused,
                    (int) Permission.WordEntry
                },
                    ProjectId = project.Id
                };
                userRole = await _userRoleRepo.Create(userRole);

                // Generate the userRoles and update the user
                user.ProjectRoles.Add(project.Id, userRole.Id);
                await _userRepo.Update(user.Id, user);
                // Generate the JWT based on those new userRoles
                var updatedUser = await _userService.MakeJwt(user);
                if (updatedUser is null)
                {
                    throw new Exception("Unable to generate JWT.");
                }

                await _userRepo.Update(updatedUser.Id, updatedUser);

                // Removes token and updates user

                project.InviteTokens.Remove(emailInvite);
                await _projRepo.Update(project.Id, project);

                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<bool> CanImportLift(string projectId)
        {
            var project = await _projRepo.GetProject(projectId);
            if (project is null)
            {
                return false;
            }

            return !project.LiftImported;
        }
    }
}
