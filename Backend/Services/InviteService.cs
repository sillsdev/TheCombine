using System;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using MimeKit;

namespace BackendFramework.Services
{
    /// <summary> More complex functions and application logic for <see cref="Project"/>s </summary>
    public class InviteService : IInviteService
    {
        private readonly IInviteContext _inviteContext;
        private readonly IUserRepository _userRepo;
        private readonly IUserRoleRepository _userRoleRepo;
        private readonly IEmailService _emailService;
        private readonly IPermissionService _permissionService;

        public InviteService(IInviteContext inviteContext, IUserRepository userRepo, IUserRoleRepository userRoleRepo,
            IEmailService emailService, IPermissionService permissionService)
        {
            _inviteContext = inviteContext;
            _userRepo = userRepo;
            _userRoleRepo = userRoleRepo;
            _emailService = emailService;
            _permissionService = permissionService;
        }

        public TimeSpan ExpireTime => _inviteContext.ExpireTime;

        public async Task<string> CreateLinkWithToken(string projectId, Role role, string emailAddress)
        {
            var token = new ProjectInvite(projectId, emailAddress, role);
            await _inviteContext.Insert(token);
            return $"/invite/{projectId}/{token.Token}?email={emailAddress}";
        }

        public async Task<bool> EmailLink(
            string emailAddress, string emailMessage, string link, string domain, string projectName)
        {
            // create email
            var message = new MimeMessage();
            message.To.Add(new MailboxAddress("FutureCombineUser", emailAddress));
            message.Subject = "TheCombine Project Invite";
            message.Body = new TextPart("plain")
            {
                Text = $"You have been invited project '{projectName}' on The Combine.\n" +
                       $"To become a member of this project, go to {domain}{link}.\n" +
                       $"Use this email address during registration: {emailAddress}.\n\n" +
                       $"Message from Project Admin: {emailMessage}\n\n" +
                       $"(This link will expire in {ExpireTime.TotalDays} days.)\n\n" +
                       "If you did not expect an invite please ignore this email."
            };
            return await _emailService.SendEmail(message);
        }

        public async Task<ProjectInvite?> FindByToken(string token)
        {
            return await _inviteContext.FindByToken(token);
        }

        public async Task<bool> RemoveTokenAndCreateUserRole(string projectId, User user, ProjectInvite invite)
        {
            if (invite.Role == Role.Owner)
            {
                throw new InviteException("Email invites cannot make project Owners!");
            }

            try
            {
                var userRole = new UserRole { ProjectId = projectId, Role = invite.Role };
                userRole = await _userRoleRepo.Create(userRole);

                // Generate the userRoles and update the user
                user.ProjectRoles.Add(projectId, userRole.Id);
                await _userRepo.Update(user.Id, user);
                // Generate the JWT based on those new userRoles
                var updatedUser = await _permissionService.MakeJwt(user)
                    ?? throw new PermissionService.InvalidJwtTokenException("Unable to generate JWT.");

                await _userRepo.Update(updatedUser.Id, updatedUser);
                await _inviteContext.ClearAll(projectId, invite.Email);

                return true;
            }
            catch (PermissionService.InvalidJwtTokenException)
            {
                return false;
            }
        }

        public sealed class InviteException : Exception
        {
            public InviteException() { }

            public InviteException(string msg) : base(msg) { }
        }
    }
}
