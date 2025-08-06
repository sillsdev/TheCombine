using BackendFramework.Models;
using BackendFramework.Interfaces;
using System.Threading.Tasks;
using System.Linq;
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

        public async Task<EmailToken> CreatePasswordReset(string email)
        {
            var resetRequest = new EmailToken(email);
            await _passwordResets.Insert(resetRequest);
            return resetRequest;
        }

        public async Task ExpirePasswordReset(string email)
        {
            await _passwordResets.ClearAll(email);
        }

        public async Task<bool> ValidateToken(string token)
        {
            var request = await _passwordResets.FindByToken(token);
            return request is not null && DateTime.Now <= request.Created.AddMinutes(_passwordResets.ExpireTime);
        }

        /// <summary> Reset a users password using a Password reset request token. </summary>
        /// <returns> Returns false if the request is invalid or expired. </returns>
        public async Task<bool> ResetPassword(string token, string password)
        {
            var request = await _passwordResets.FindByToken(token);
            if (request is null || DateTime.Now > request.Created.AddMinutes(_passwordResets.ExpireTime))
            {
                return false;
            }
            var user = (await _userRepo.GetAllUsers()).Single(u =>
                u.Email.Equals(request.Email, StringComparison.OrdinalIgnoreCase));
            await _userRepo.ChangePassword(user.Id, password);
            await ExpirePasswordReset(request.Email);
            return true;
        }
    }
}
