using System;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using MimeKit;
using static BackendFramework.Helper.Domain;

namespace BackendFramework.Services
{
    public class PasswordResetService(IPasswordResetContext passwordResetContext, IUserRepository userRepo,
        IEmailService emailService) : IPasswordResetService
    {
        private readonly IPasswordResetContext _passwordResetContext = passwordResetContext;
        private readonly IUserRepository _userRepo = userRepo;
        private readonly IEmailService _emailService = emailService;

        internal async Task<EmailToken> CreatePasswordReset(string email)
        {
            var resetRequest = new EmailToken(email);
            await _passwordResetContext.Insert(resetRequest);
            return resetRequest;
        }

        internal async Task ExpirePasswordReset(string email)
        {
            await _passwordResetContext.ClearAll(email);
        }

        /// <summary> Reset a users password using a Password reset request token. </summary>
        /// <returns> Returns false if the request is invalid or expired. </returns>
        public async Task<bool> ResetPassword(string token, string password)
        {
            var request = await _passwordResetContext.FindByToken(token);
            if (request is null || !ValidateToken(request))
            {
                return false;
            }
            var user = (await _userRepo.GetAllUsers()).Single(u =>
                u.Email.Equals(request.Email, StringComparison.OrdinalIgnoreCase));
            await _userRepo.ChangePassword(user.Id, password);
            await ExpirePasswordReset(request.Email);
            return true;
        }

        public async Task<bool> ResetPasswordRequest(string EmailOrUsername)
        {
            // Find user attached to email or username.
            var user = await _userRepo.GetUserByEmailOrUsername(EmailOrUsername, false);

            if (user is null)
            {
                // Return true to avoid revealing to the frontend whether the user exists.
                return true;
            }

            // Create password reset.
            var resetRequest = await CreatePasswordReset(user.Email);

            // The url needs to match Path.PwReset in src/types/path.ts.
            var url = $"{FrontendDomain}/pw/reset/{resetRequest.Token}";

            // Create email.
            var message = new MimeMessage();
            message.To.Add(new MailboxAddress(user.Name, user.Email));
            message.Subject = "Combine password reset";
            message.Body = new TextPart("plain")
            {
                Text = $"A password reset has been requested for the user {user.Username}. " +
                    $"Follow this link to reset {user.Username}'s password: {url}\n\n" +
                    $"(This link will expire in {_passwordResetContext.ExpireTime.TotalMinutes} minutes.)\n\n" +
                    "If you did not request a password reset, please ignore this email."
            };
            return await _emailService.SendEmail(message);
        }

        public async Task<bool> ValidateToken(string token)
        {
            var request = await _passwordResetContext.FindByToken(token);
            return request is not null && ValidateToken(request);
        }

        private bool ValidateToken(EmailToken token)
        {
            return DateTime.UtcNow <= token.Created.Add(_passwordResetContext.ExpireTime);
        }
    }
}
