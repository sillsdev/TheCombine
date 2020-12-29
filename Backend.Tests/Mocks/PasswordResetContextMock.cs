using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;

namespace Backend.Tests.Mocks
{
    public class PasswordResetContextMock : IPasswordResetContext
    {
        private List<PasswordReset> _resets;

        public int ExpireTime => 15;

        public PasswordResetContextMock()
        {
            _resets = new List<PasswordReset>();
        }

        public Task ClearAll(string email)
        {
            _resets.RemoveAll(x => x.Email == email);
            return Task.CompletedTask;
        }

        public Task<PasswordReset?> FindByToken(string token)
        {
            return Task.FromResult<PasswordReset?>(_resets.FindAll(x => x.Token == token).SingleOrDefault());
        }

        public List<PasswordReset> GetResets()
        {
            return _resets;
        }

        public void SetResets(List<PasswordReset> resets)
        {
            _resets = resets;
        }

        public Task Insert(PasswordReset reset)
        {
            _resets.Add(reset);
            return Task.CompletedTask;
        }
    }
}
