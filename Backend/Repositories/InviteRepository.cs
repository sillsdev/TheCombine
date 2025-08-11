using System.Diagnostics.CodeAnalysis;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Repositories
{
    [ExcludeFromCodeCoverage]
    public class InviteRepository(IMongoDbContext mongoDbContext) : IInviteRepository
    {
        private readonly IMongoCollection<ProjectInvite> _invites =
            mongoDbContext.Db.GetCollection<ProjectInvite>("InviteCollection");

        public async Task ClearAll(string projectId, string email)
        {
            await _invites.DeleteManyAsync(x => x.ProjectId == projectId && x.Email == email);
        }

        public async Task<ProjectInvite?> FindByToken(string token)
        {
            return (await _invites.FindAsync(r => r.Token == token)).SingleOrDefault();
        }

        public async Task Insert(ProjectInvite invite)
        {
            await _invites.InsertOneAsync(invite);
        }
    }
}

