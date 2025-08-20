using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;

namespace Backend.Tests.Mocks
{
    internal sealed class EmailVerifyServiceMock : IEmailVerifyService
    {
        private bool _boolResponse;
        internal void SetNextBoolResponse(bool response)
        {
            _boolResponse = response;
        }

        public Task<bool> RequestEmailVerify(User user)
        {
            return Task.FromResult(_boolResponse);
        }

        public Task<bool> ValidateToken(string token)
        {
            return Task.FromResult(_boolResponse);
        }
    }
}
