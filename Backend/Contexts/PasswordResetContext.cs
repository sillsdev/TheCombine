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
    public class PasswordResetContext(IOptions<Startup.Settings> options, IMongoDbContext mongoDbContext)
        : IPasswordResetContext
    {
        private readonly IMongoDatabase _db = mongoDbContext.Db;

        public TimeSpan ExpireTime { get; } = options.Value.ExpireTimePasswordReset;

        private IMongoCollection<EmailToken> PasswordResets => _db.GetCollection<EmailToken>(
            "PasswordResetCollection");

        public async Task ClearAll(string email)
        {
            await PasswordResets.DeleteManyAsync(x => x.Email == email);
        }

        public async Task<EmailToken?> FindByToken(string token)
        {
            return (await PasswordResets.FindAsync(r => r.Token == token)).SingleOrDefault();
        }

        public async Task Insert(EmailToken reset)
        {
            await PasswordResets.InsertOneAsync(reset);
        }
    }
}

