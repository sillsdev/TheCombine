using System.Diagnostics.CodeAnalysis;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Repositories
{
    /// <summary> Atomic database functions for <see cref="ProjectInvite"/>s. </summary>
    [ExcludeFromCodeCoverage]
    public class InviteRepository(IMongoDbContext dbContext) : IInviteRepository
    {
        private readonly IMongoCollection<ProjectInvite> _invites =
            dbContext.Db.GetCollection<ProjectInvite>("InviteCollection");

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

