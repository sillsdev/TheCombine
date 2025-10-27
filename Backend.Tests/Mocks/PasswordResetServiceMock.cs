using System.Threading.Tasks;
using BackendFramework.Interfaces;

namespace Backend.Tests.Mocks
{
    internal sealed class PasswordResetServiceMock : IPasswordResetService
    {
        private bool _boolResponse;
        internal void SetNextBoolResponse(bool response)
        {
            _boolResponse = response;
        }
        public Task<bool> ResetPassword(string token, string password)
        {
            return Task.FromResult(_boolResponse);
        }

        public Task<bool> ResetPasswordRequest(string emailOrUsername)
        {
            return Task.FromResult(_boolResponse);
        }

        public Task<bool> ValidateToken(string token)
        {
            return Task.FromResult(_boolResponse);
        }
    }
}
