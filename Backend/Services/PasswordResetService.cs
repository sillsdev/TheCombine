using BackendFramework.Models;
using BackendFramework.Interfaces;
using System.Threading.Tasks;
using MongoDB.Driver;
using System.Linq;
using System;

namespace BackendFramework.Services
{
    public class PasswordResetService : IPasswordResetService
    {
        private readonly IPasswordResetContext _passwordResets;
        private readonly IUserService _userService;

        public PasswordResetService(IPasswordResetContext passwordResets, IUserService userSerivce)
        {
            _passwordResets = passwordResets;
            _userService = userSerivce;
        }

        public async Task<PasswordReset> CreatePasswordReset(string email)
        {
            var resetRequest = new PasswordReset(email);
            await _passwordResets.Insert(resetRequest);
            return resetRequest;
        }

        public async Task ExpirePasswordReset(string email)
        {
            await _passwordResets.ClearAll(email);
        }

        async Task<bool> IPasswordResetService.ResetPassword(string token, string password)
        {
            var request = await _passwordResets.FindByToken(token);
            if (DateTime.Now < request.ExpireTime)
            {
                var user = (await _userService.GetAllUsers()).Where(u => u.Email == request.Email).Single();
                await _userService.ChangePassword(user.Id, password);
                await ExpirePasswordReset(request.Email);
                return true;
            }
            else
            {
                return false;
            }
        }
    }
}
