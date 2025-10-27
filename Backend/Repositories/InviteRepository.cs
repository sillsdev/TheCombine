using System.Diagnostics.CodeAnalysis;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Otel;
using MongoDB.Driver;

namespace BackendFramework.Repositories
{
    /// <summary> Atomic database functions for <see cref="ProjectInvite"/>s. </summary>
    [ExcludeFromCodeCoverage]
    public class InviteRepository(IMongoDbContext dbContext) : IInviteRepository
    {
        private readonly IMongoCollection<ProjectInvite> _invites =
            dbContext.Db.GetCollection<ProjectInvite>("InviteCollection");

        private const string otelTagName = "otel.InviteRepository";

        public async Task ClearAll(string projectId, string email)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "clearing all project invites");

            await _invites.DeleteManyAsync(x => x.ProjectId == projectId && x.Email == email);
        }

        public async Task<ProjectInvite?> FindByToken(string token)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "finding project invite by token");

            return (await _invites.FindAsync(r => r.Token == token)).SingleOrDefault();
        }

        public async Task Insert(ProjectInvite invite)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "inserting project invite");

            await _invites.InsertOneAsync(invite);
        }
    }
}

