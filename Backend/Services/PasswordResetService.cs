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

        public async Task<PasswordReset> CreatePasswordReset(string email)
        {
            var resetRequest = new PasswordReset(_passwordResets.ExpireTime, email);
            await _passwordResets.Insert(resetRequest);
            return resetRequest;
        }

        public async Task ExpirePasswordReset(string email)
        {
            await _passwordResets.ClearAll(email);
        }

        /// <summary> Reset a users password using a Password reset request token. </summary>
        /// <returns> Returns false if the request is invalid or expired. </returns>
        async Task<bool> IPasswordResetService.ResetPassword(string token, string password)
        {
            var request = await _passwordResets.FindByToken(token);
            if (request is null || DateTime.Now > request.ExpireTime)
            {
                return false;
            }
            var user = (await _userRepo.GetAllUsers()).Single(u =>
                u.Email.ToLowerInvariant() == request.Email.ToLowerInvariant());
            await _userRepo.ChangePassword(user.Id, password);
            await ExpirePasswordReset(request.Email);
            return true;
        }
    }
}
