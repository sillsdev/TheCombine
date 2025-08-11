using System.Diagnostics.CodeAnalysis;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Repositories
{
    [ExcludeFromCodeCoverage]
    public class PasswordResetRepository(IMongoDbContext mongoDbContext) : IPasswordResetRepository
    {
        private readonly IMongoDatabase _db = mongoDbContext.Db;

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

