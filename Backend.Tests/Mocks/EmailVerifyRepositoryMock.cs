using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;

namespace Backend.Tests.Mocks
{
    internal sealed class EmailVerifyRepositoryMock : IEmailVerifyRepository
    {
        private List<EmailToken> _verifies = [];

        public Task ClearAll(string email)
        {
            _verifies.RemoveAll(x => x.Email == email);
            return Task.CompletedTask;
        }

        public Task<EmailToken?> FindByToken(string token)
        {
            return Task.FromResult(_verifies.FindAll(x => x.Token == token).SingleOrDefault());
        }

        internal List<EmailToken> GetEmailTokens()
        {
            return _verifies;
        }

        public Task Insert(EmailToken emailToken)
        {
            _verifies.Add(emailToken);
            return Task.CompletedTask;
        }
    }
}
