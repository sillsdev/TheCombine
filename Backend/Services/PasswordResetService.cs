using System;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.Extensions.Options;
using MimeKit;
using static BackendFramework.Helper.Domain;

namespace BackendFramework.Services
{
    public class PasswordResetService(IOptions<Startup.Settings> options, IPasswordResetRepository passwordResetRepo,
        IUserRepository userRepo, IEmailService emailService) : IPasswordResetService
    {
        private readonly TimeSpan _expireTime = options.Value.ExpireTimePasswordReset;
        private readonly IPasswordResetRepository _passwordResetRepo = passwordResetRepo;
        private readonly IUserRepository _userRepo = userRepo;
        private readonly IEmailService _emailService = emailService;

        private static string CreateLink(string token)
        {
            // Matches the Path.PwReset route in src\router\appRoutes.tsx
            return $"{FrontendDomain}/pw/reset/{token}";
        }

        internal async Task<EmailToken> CreatePasswordReset(string email)
        {
            var resetRequest = new EmailToken(email);
            await _passwordResetRepo.Insert(resetRequest);
            return resetRequest;
        }

        internal async Task ExpirePasswordReset(string email)
        {
            await _passwordResetRepo.ClearAll(email);
        }

        internal async Task<EmailToken?> GetValidPasswordReset(string token)
        {
            var reset = await _passwordResetRepo.FindByToken(token);
            return (reset is null || IsPasswordResetValid(reset)) ? reset : null;
        }

        private bool IsPasswordResetValid(EmailToken reset)
        {
            return reset.Created < DateTime.UtcNow && DateTime.UtcNow < reset.Created.Add(_expireTime);
        }

        /// <summary> Reset a users password using a Password reset request token. </summary>
        /// <returns> Returns false if the request is invalid or expired. </returns>
        public async Task<bool> ResetPassword(string token, string password)
        {
            var request = await GetValidPasswordReset(token);
            if (request is null)
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
            var token = (await CreatePasswordReset(user.Email)).Token;

            return await _emailService.SendEmail(CreateEmail(user, CreateLink(token)));
        }

        private MimeMessage CreateEmail(User user, string url)
        {
            var message = new MimeMessage();
            message.To.Add(new MailboxAddress(user.Name, user.Email));
            message.Subject = "Combine password reset";
            message.Body = new TextPart("plain")
            {
                Text = $"A password reset has been requested for the user {user.Username}. " +
                    $"Follow this link to reset {user.Username}'s password: {url}\n\n" +
                    $"(This link will expire in {_expireTime.TotalMinutes} minutes.)\n\n" +
                    "If you did not request a password reset, please ignore this email."
            };
            return message;
        }

        public async Task<bool> ValidateToken(string token)
        {
            return await GetValidPasswordReset(token) is not null;
        }
    }
}
