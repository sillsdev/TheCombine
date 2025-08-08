using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;

namespace Backend.Tests.Mocks
{
    internal sealed class PasswordResetContextMock : IPasswordResetContext
    {
        private List<EmailToken> _resets = [];

        public TimeSpan ExpireTime => TimeSpan.FromMinutes(15); // Default expire time for testing

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

        public Task Insert(EmailToken reset)
        {
            _resets.Add(reset);
            return Task.CompletedTask;
        }
    }
}
