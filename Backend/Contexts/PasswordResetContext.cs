using System.Diagnostics.CodeAnalysis;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace BackendFramework.Contexts
{
    [ExcludeFromCodeCoverage]
    public class PasswordResetContext : IPasswordResetContext
    {
        private readonly IMongoDbContext _mongoDbContext;
        public int ExpireTime { get; }

        public PasswordResetContext(IOptions<Startup.Settings> options, IMongoDbContext mongoDbContext)
        {
            _mongoDbContext = mongoDbContext;
            ExpireTime = options.Value.PassResetExpireTime;
        }

        private IMongoCollection<PasswordReset> PasswordResets => _mongoDbContext.Db.GetCollection<PasswordReset>(
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

