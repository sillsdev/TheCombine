using System.Diagnostics.CodeAnalysis;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace BackendFramework.Contexts
{
    [ExcludeFromCodeCoverage]
    public class EmailVerifyContext : IEmailVerifyContext
    {
        private readonly IMongoDatabase _db;
        public int ExpireTime { get; }

        public EmailVerifyContext(IOptions<Startup.Settings> options)
        {
            var client = new MongoClient(options.Value.ConnectionString);
            _db = client.GetDatabase(options.Value.CombineDatabase);
            ExpireTime = options.Value.PassResetExpireTime;
        }

        private IMongoCollection<EmailToken> EmailTokens => _db.GetCollection<EmailToken>("EmailVerifyCollection");

        public Task ClearAll(string email)
        {
            return EmailTokens.DeleteManyAsync(x => x.Email == email);
        }

        public async Task<EmailToken?> FindByToken(string token)
        {
            return (await EmailTokens.FindAsync(r => r.Token == token)).SingleOrDefault();
        }

        public Task Insert(EmailToken reset)
        {
            return EmailTokens.InsertOneAsync(reset);
        }
    }
}

