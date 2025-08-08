using System;
using System.Diagnostics.CodeAnalysis;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace BackendFramework.Contexts
{
    [ExcludeFromCodeCoverage]
    public class InviteContext : IInviteContext
    {
        private readonly IMongoDatabase _db;
        public TimeSpan ExpireTime { get; }

        public InviteContext(IOptions<Startup.Settings> options)
        {
            var client = new MongoClient(options.Value.ConnectionString);
            _db = client.GetDatabase(options.Value.CombineDatabase);
            ExpireTime = options.Value.ExpireTimeProjectInvite;
        }

        private IMongoCollection<ProjectInvite> Invites => _db.GetCollection<ProjectInvite>("InviteCollection");

        public Task ClearAll(string projectId, string email)
        {
            return Invites.DeleteManyAsync(x => x.ProjectId == projectId && x.Email == email);
        }

        public async Task<ProjectInvite?> FindByToken(string token)
        {
            return (await Invites.FindAsync(r => r.Token == token)).SingleOrDefault();
        }

        public Task Insert(ProjectInvite invite)
        {
            return Invites.InsertOneAsync(invite);
        }
    }
}

