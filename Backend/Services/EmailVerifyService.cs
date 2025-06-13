using BackendFramework.Models;
using BackendFramework.Interfaces;
using System.Threading.Tasks;
using System;

namespace BackendFramework.Services
{
    public class EmailVerifyService(IEmailVerifyContext context, IUserRepository userRepo) : IEmailVerifyService
    {
        private readonly IEmailVerifyContext _emailVerifyContext = context;
        private readonly IUserRepository _userRepo = userRepo;

        public async Task<EmailToken> CreateEmailToken(string email)
        {
            var emailToken = new EmailToken(_emailVerifyContext.ExpireTime, email);
            await _emailVerifyContext.Insert(emailToken);
            return emailToken;
        }

        public async Task ExpireTokens(string email)
        {
            await _emailVerifyContext.ClearAll(email);
        }

        /// <summary> Validate a user's email address using an email token. </summary>
        /// <returns> Returns false if the email token is invalid or expired. </returns>
        public async Task<bool> VerifyEmail(string token)
        {
            var emailToken = await _emailVerifyContext.FindByToken(token);
            if (emailToken is null || DateTime.Now > emailToken.ExpireTime)
            {
                return false;
            }
            var user = await _userRepo.GetUserByEmail(emailToken.Email);
            if (user is null)
            {
                return false;
            }
            await _userRepo.VerifyEmail(user.Id);
            await ExpireTokens(emailToken.Email);
            return true;
        }
    }
}
