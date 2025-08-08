using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;

namespace Backend.Tests.Mocks
{
    internal sealed class InviteContextMock : IInviteContext
    {
        private List<ProjectInvite> _invites = [];

        public TimeSpan ExpireTime => TimeSpan.FromDays(7); // Default expire time for testing

        public Task ClearAll(string projectId, string email)
        {
            _invites.RemoveAll(x => x.ProjectId == projectId && x.Email == email);
            return Task.CompletedTask;
        }

        public Task<ProjectInvite?> FindByToken(string token)
        {
            return Task.FromResult(_invites.FindAll(x => x.Token == token).SingleOrDefault());
        }

        public Task Insert(ProjectInvite invite)
        {
            _invites.Add(invite);
            return Task.CompletedTask;
        }
    }
}
