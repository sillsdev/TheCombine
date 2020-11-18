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
        private readonly IUserService _userService;

        public PasswordResetService(IPasswordResetContext passwordResets, IUserService userService)
        {
            _passwordResets = passwordResets;
            _userService = userService;
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


        /**
         * <summary> Reset a users password using a Password reset request token </summary>
         * <returns> returns false if the request has expired </returns>
         */
        async Task<bool> IPasswordResetService.ResetPassword(string token, string password)
        {
            var request = await _passwordResets.FindByToken(token);
            if (!(request is null) && DateTime.Now < request.ExpireTime)
            {
                var user = (await _userService.GetAllUsers()).Single(u =>
                    u.Email.ToLowerInvariant() == request.Email.ToLowerInvariant());
                await _userService.ChangePassword(user.Id, password);
                await ExpirePasswordReset(request.Email);
                return true;
            }

            return false;
        }
    }
}
