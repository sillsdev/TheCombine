using BackendFramework.Interfaces;
using BackendFramework.Models;
using MongoDB.Driver;
using static BackendFramework.Startup;
using Microsoft.Extensions.Options;

namespace BackendFramework.Contexts
{
    public class PasswordResetContext : IPasswordResetContext
    {
        private readonly IMongoDatabase _db;

        public PasswordResetContext(IOptions<Settings> options)
        {
            var client = new MongoClient(options.Value.ConnectionString);
            _db = client.GetDatabase(options.Value.CombineDatabase);
        }

        public IMongoCollection<PasswordReset> PasswordResets => _db.GetCollection<PasswordReset>("PasswordResetCollection");
    }
}
