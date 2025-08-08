using System;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using MimeKit;

namespace BackendFramework.Services
{
    /// <summary> More complex functions and application logic for <see cref="Project"/>s </summary>
    public class InviteService(
        IInviteContext inviteContext, IUserRepository userRepo, IUserRoleRepository userRoleRepo,
        IEmailService emailService, IPermissionService permissionService) : IInviteService
    {
        private readonly IInviteContext _inviteContext = inviteContext;
        private readonly IUserRepository _userRepo = userRepo;
        private readonly IUserRoleRepository _userRoleRepo = userRoleRepo;
        private readonly IEmailService _emailService = emailService;
        private readonly IPermissionService _permissionService = permissionService;

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
                       $"(This link will expire in {_inviteContext.ExpireTime.TotalDays} days.)\n\n" +
                       "If you did not expect an invite please ignore this email."
            };
            return await _emailService.SendEmail(message);
        }

        internal async Task<bool> RemoveTokenAndCreateUserRole(string projectId, User user, ProjectInvite invite)
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

        public async Task<EmailInviteStatus> ValidateToken(string projectId, string token)
        {
            var status = new EmailInviteStatus(false, false);
            var invite = await _inviteContext.FindByToken(token);
            User? user = null;
            if (invite is not null)
            {
                status.IsTokenValid = DateTime.Now < invite.Created.Add(_inviteContext.ExpireTime);
                user = await _userRepo.GetUserByEmail(invite.Email);
                status.IsUserValid = user is not null && !user.ProjectRoles.ContainsKey(projectId);
            }
            if (invite is null || user is null || !status.IsTokenValid || !status.IsUserValid)
            {
                return status;
            }
            if (await RemoveTokenAndCreateUserRole(projectId, user, invite))
            {
                return status;
            }
            return new EmailInviteStatus(false, true);
        }

        public sealed class InviteException : Exception
        {
            public InviteException() { }

            public InviteException(string msg) : base(msg) { }
        }
    }
}
