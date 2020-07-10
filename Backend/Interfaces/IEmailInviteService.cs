using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IEmailInviteService
    {
        Task<string> CreateLinkWithToken(string projectId, string emailAddress);
        Task<bool> RemoveTokenAndCreateUserRole(Project projectId, string userId, string token);
    }
}