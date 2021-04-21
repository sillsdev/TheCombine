using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;

namespace Backend.Tests.Mocks
{
    public class ProjectInviteServiceMock : IProjectInviteService
    {
        public Task<string> CreateLinkWithToken(Project project, string emailAddress)
        {
            return Task.FromResult("");
        }

        public Task<bool> EmailLink(string emailAddress, string emailMessage, string link, string domain, Project project)
        {
            return Task.FromResult(true);
        }

        public Task<bool> RemoveTokenAndCreateUserRole(Project project, User user, EmailInvite token)
        {
            return Task.FromResult(true);
        }
    }
}
