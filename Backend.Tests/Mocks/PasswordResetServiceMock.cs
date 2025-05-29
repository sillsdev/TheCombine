using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;

namespace Backend.Tests.Mocks
{
    internal sealed class PasswordResetServiceMock : IPasswordResetService
    {
        private bool? _responseBool;
        internal void SetNextBoolResponse(bool response)
        {
            _responseBool = response;
        }

        public Task<PasswordReset> CreatePasswordReset(string email)
        {
            return Task.FromResult(new PasswordReset(15, email));
        }

        public Task ExpirePasswordReset(string email)
        {
            return Task.CompletedTask;
        }

        public Task<bool> ValidateToken(string token)
        {
            // TODO: More sophisticated mock
            return Task.FromResult(_responseBool ?? false);
        }

        public Task<bool> ResetPassword(string token, string password)
        {
            // TODO: More sophisticated mock
            return Task.FromResult(_responseBool ?? false);
        }
    }
}
