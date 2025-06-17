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

        public Task<EmailToken> CreateEmailToken(string email)
        {
            return Task.FromResult(new EmailToken(15, email));
        }

        public Task ExpireTokens(string email)
        {
            return Task.CompletedTask;
        }

        public Task<bool> VerifyEmail(string token)
        {
            return Task.FromResult(_boolResponse);
        }
    }
}
