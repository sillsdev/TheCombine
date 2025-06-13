using BackendFramework.Models;
using BackendFramework.Interfaces;
using System.Threading.Tasks;
using System;

namespace BackendFramework.Services
{
    public class PasswordResetService : IPasswordResetService
    {
        private readonly IPasswordResetContext _passwordResets;
        private readonly IUserRepository _userRepo;

        public PasswordResetService(IPasswordResetContext passwordResets, IUserRepository userRepo)
        {
            _passwordResets = passwordResets;
            _userRepo = userRepo;
        }

        public async Task<EmailToken> CreateEmailToken(string email)
        {
            var emailToken = new EmailToken(_passwordResets.ExpireTime, email);
            await _passwordResets.Insert(emailToken);
            return emailToken;
        }

        public async Task ExpireTokens(string email)
        {
            await _passwordResets.ClearAll(email);
        }

        public async Task<bool> ValidateToken(string token)
        {
            var request = await _passwordResets.FindByToken(token);
            return request is not null && DateTime.Now <= request.ExpireTime;
        }

        /// <summary> Reset a users password using a Password reset request token. </summary>
        /// <returns> Returns false if the request is invalid or expired. </returns>
        public async Task<bool> ResetPassword(string token, string password)
        {
            var request = await _passwordResets.FindByToken(token);
            if (request is null || DateTime.Now > request.ExpireTime)
            {
                return false;
            }
            var user = await _userRepo.GetUserByEmail(request.Email);
            if (user is null)
            {
                return false;
            }
            await _userRepo.ChangePassword(user.Id, password);
            await ExpireTokens(request.Email);
            return true;
        }

        /// <summary> Validate a user's email address using a password reset request token. </summary>
        /// <returns> Returns false if the request is invalid or expired. </returns>
        public async Task<bool> VerifyEmail(string token)
        {
            var request = await _passwordResets.FindByToken(token);
            if (request is null || DateTime.Now > request.ExpireTime)
            {
                return false;
            }
            var user = await _userRepo.GetUserByEmail(request.Email);
            if (user is null)
            {
                return false;
            }
            await _userRepo.VerifyEmail(user.Id);
            await ExpireTokens(request.Email);
            return true;
        }
    }
}
