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

        public int ExpireTime { get; } = options.Value.PassResetExpireTime;

        private IMongoCollection<PasswordReset> PasswordResets => _db.GetCollection<PasswordReset>(
            "PasswordResetCollection");

        public Task ClearAll(string email)
        {
            return PasswordResets.DeleteManyAsync(x => x.Email == email);
        }

        public async Task<PasswordReset?> FindByToken(string token)
        {
            return (await PasswordResets.FindAsync(r => r.Token == token)).SingleOrDefault();
        }

        public Task Insert(PasswordReset reset)
        {
            return PasswordResets.InsertOneAsync(reset);
        }
    }
}

