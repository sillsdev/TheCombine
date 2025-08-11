using System;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.Extensions.Options;
using MimeKit;
using static BackendFramework.Helper.Domain;

namespace BackendFramework.Services
{
    /// <summary> More complex functions and application logic for <see cref="Project"/>s </summary>
    public class InviteService(IOptions<Startup.Settings> options, IInviteRepository inviteRepo,
        IUserRepository userRepo, IUserRoleRepository userRoleRepo, IEmailService emailService,
        IPermissionService permissionService) : IInviteService
    {
        private readonly TimeSpan _expireTime = options.Value.ExpireTimeProjectInvite;
        private readonly IInviteRepository _inviteRepo = inviteRepo;
        private readonly IUserRepository _userRepo = userRepo;
        private readonly IUserRoleRepository _userRoleRepo = userRoleRepo;
        private readonly IEmailService _emailService = emailService;
        private readonly IPermissionService _permissionService = permissionService;

        internal static string CreateLink(ProjectInvite invite)
        {
            // Matches the Path.ProjInvite route in src\router\appRoutes.tsx
            return $"{FrontendDomain}/invite/{invite.ProjectId}/{invite.Token}?email={invite.Email}";
        }

        internal async Task<ProjectInvite> CreateProjectInvite(string projectId, Role role, string emailAddress)
        {
            var invite = new ProjectInvite(projectId, emailAddress, role);
            await _inviteRepo.Insert(invite);
            return invite;
        }

        private MimeMessage CreateEmail(string emailAddress, string emailMessage, string link, string projectName)
        {
            var message = new MimeMessage();
            message.To.Add(new MailboxAddress("FutureCombineUser", emailAddress));
            message.Subject = "TheCombine Project Invite";
            message.Body = new TextPart("plain")
            {
                Text = $"You have been invited project '{projectName}' on The Combine.\n" +
                       $"To become a member of this project, go to {link}.\n" +
                       $"Use this email address during registration: {emailAddress}.\n\n" +
                       $"Message from Project Admin: {emailMessage}\n\n" +
                       $"(This link will expire in {_expireTime.TotalDays} days.)\n\n" +
                       "If you did not expect an invite please ignore this email."
            };
            return message;
        }

        public async Task<string> EmailLink(Project project, Role role, string emailAddress, string message)
        {
            var link = CreateLink(await CreateProjectInvite(project.Id, role, emailAddress));
            await _emailService.SendEmail(CreateEmail(emailAddress, message, link, project.Name));
            return link;
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
                await _inviteRepo.ClearAll(projectId, invite.Email);

                return true;
            }
            catch (PermissionService.InvalidJwtTokenException)
            {
                return false;
            }
        }

        private bool ValidateToken(EmailToken token)
        {
            return DateTime.UtcNow < token.Created.Add(_expireTime);
        }

        public async Task<EmailInviteStatus> ValidateProjectToken(string projectId, string token)
        {
            var status = new EmailInviteStatus(false, false);

            var invite = await _inviteRepo.FindByToken(token);
            if (invite is null)
            {
                return status;
            }

            status.IsTokenValid = ValidateToken(invite);
            var user = await _userRepo.GetUserByEmail(invite.Email);
            if (user is null)
            {
                return status;
            }

            status.IsUserValid = !user.ProjectRoles.ContainsKey(projectId);
            if (!status.IsTokenValid || !status.IsUserValid)
            {
                return status;
            }

            var result = await RemoveTokenAndCreateUserRole(projectId, user, invite);
            return result ? status : new EmailInviteStatus(false, true);
        }

        public sealed class InviteException(string msg) : Exception(msg);
    }
}
