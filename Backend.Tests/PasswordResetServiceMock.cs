using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;

namespace Backend.Tests
{
    class PasswordResetServiceMock : IPasswordResetService
    {
        public Task<PasswordReset> CreatePasswordReset(string email)
        {
            return Task.FromResult(new PasswordReset(email));
        }

        public Task ExpirePasswordReset(string email)
        {
            return Task.CompletedTask;
        }

        public Task<bool> ResetPassword(string token, string password)
        {
            // todo: More sophisticated mock
            return Task.FromResult(true);
        }
    }
}
