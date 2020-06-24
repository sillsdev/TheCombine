using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using System.Linq;

namespace Backend.Tests
{
    public class PasswordResetContextMock : IPasswordResetContext
    {
        protected List<PasswordReset> Resets;

        public PasswordResetContextMock()
        {
            Resets = new List<PasswordReset>();
        }

        public Task ClearAll(string email)
        {
            Resets.RemoveAll(x => x.Email == email);
            return Task.CompletedTask;
        }

        public Task<PasswordReset> FindByToken(string token)
        {
            return Task.FromResult(Resets.FindAll(x => x.Token == token).Single());
        }

        public List<PasswordReset> GetResets()
        {
            return Resets;
        }

        public void SetResets(List<PasswordReset> resets)
        {
            Resets = resets;
        }

        public Task Insert(PasswordReset reset)
        {
            Resets.Add(reset);
            return Task.CompletedTask;
        }
    }
}
