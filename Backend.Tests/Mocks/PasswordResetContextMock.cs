using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;

namespace Backend.Tests.Mocks
{
    internal sealed class PasswordResetContextMock : IPasswordResetContext
    {
        private List<EmailToken> _resets;

        public PasswordResetContextMock()
        {
            _resets = new List<EmailToken>();
        }

        public Task ClearAll(string email)
        {
            _resets.RemoveAll(x => x.Email == email);
            return Task.CompletedTask;
        }

        public Task<EmailToken?> FindByToken(string token)
        {
            return Task.FromResult(_resets.FindAll(x => x.Token == token).SingleOrDefault());
        }

        public List<EmailToken> GetResets()
        {
            return _resets;
        }

        public void SetResets(List<EmailToken> resets)
        {
            _resets = resets;
        }

        public Task Insert(EmailToken reset)
        {
            _resets.Add(reset);
            return Task.CompletedTask;
        }
    }
}
