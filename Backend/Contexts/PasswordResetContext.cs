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

        public PasswordResetContext(IOptions<Startup.Settings> options)
        {
            var client = new MongoClient(options.Value.ConnectionString);
            _db = client.GetDatabase(options.Value.CombineDatabase);
        }

        private IMongoCollection<EmailToken> PasswordResets => _db.GetCollection<EmailToken>(
            "PasswordResetCollection");

        public Task ClearAll(string email)
        {
            return PasswordResets.DeleteManyAsync(x => x.Email == email);
        }

        public async Task<EmailToken?> FindByToken(string token)
        {
            return (await PasswordResets.FindAsync(r => r.Token == token)).SingleOrDefault();
        }

        public Task Insert(EmailToken reset)
        {
            return PasswordResets.InsertOneAsync(reset);
        }
    }
}

