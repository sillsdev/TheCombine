using BackendFramework.Models;
using BackendFramework.Interfaces;
using System.Threading.Tasks;
using System;
using Microsoft.Extensions.Options;
using static BackendFramework.Helper.Domain;
using MimeKit;

namespace BackendFramework.Services
{
    public class EmailVerifyService(IOptions<Startup.Settings> options, IEmailVerifyRepository emailVerifyRepo,
        IUserRepository userRepo, IEmailService emailService) : IEmailVerifyService
    {
        private readonly TimeSpan _expireTime = options.Value.ExpireTimeEmailVerify;
        private readonly IEmailVerifyRepository _emailVerifyRepo = emailVerifyRepo;
        private readonly IUserRepository _userRepo = userRepo;
        private readonly IEmailService _emailService = emailService;

        public async Task<bool> ValidateToken(string token)
        {
            var emailToken = await GetValidEmailVerify(token);
            if (emailToken is null)
            {
                return false;
            }

            var result = await _userRepo.VerifyEmail(emailToken.Email);
            await _emailVerifyRepo.ClearAll(emailToken.Email);
            return result == Helper.ResultOfUpdate.Updated;
        }

        private async Task<EmailToken?> GetValidEmailVerify(string token)
        {
            var verify = await _emailVerifyRepo.FindByToken(token);
            return (verify is null || IsEmailVerifyValid(verify)) ? verify : null;
        }

        private bool IsEmailVerifyValid(EmailToken verify)
        {
            return verify.Created < DateTime.UtcNow && DateTime.UtcNow < verify.Created.Add(_expireTime);
        }

        public async Task<bool> RequestEmailVerify(User user)
        {
            var emailToken = new EmailToken(user.Email);
            await _emailVerifyRepo.Insert(emailToken);
            return await _emailService.SendEmail(CreateEmail(user, CreateLink(emailToken.Token)));
        }

        private static string CreateLink(string token)
        {
            // Matches the Path.EmailVerify route in src\router\appRoutes.tsx
            return $"{FrontendDomain}/email/verify/{token}";
        }

        private MimeMessage CreateEmail(User user, string url)
        {
            var message = new MimeMessage();
            message.To.Add(new MailboxAddress(user.Name, user.Email));
            message.Subject = "The Combine email verification";
            message.Body = new TextPart("plain")
            {
                Text = $"Email verification has been requested for {user.Name} (username: {user.Username}).\n\n" +
                    "Email verification is required to add users to your projects in The Combine.\n\n" +
                    $"Follow this link to verify your email address: {url}\n\n" +
                    $"(Link will expire in {_expireTime.TotalMinutes} minutes.)\n\n" +
                    "If you do not wish to verify your email address, you may ignore this email."
            };
            return message;
        }
    }
}
