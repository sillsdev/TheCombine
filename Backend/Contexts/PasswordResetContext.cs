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
        private readonly IMongoDatabase _db;
        public int ExpireTime { get; }

        public PasswordResetContext(IOptions<Startup.Settings> options)
        {
            var client = new MongoClient(options.Value.ConnectionString);
            _db = client.GetDatabase(options.Value.CombineDatabase);
            ExpireTime = options.Value.PassResetExpireTime;
        }

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

