using BackendFramework.ValueModels;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using static BackendFramework.Startup;
using BackendFramework.Interfaces;
namespace BackendFramework.Context
{

    public class UserContext : IUserContext
    {
        private readonly IMongoDatabase _db;

        public UserContext(IOptions<Settings> options)
        {
            var client = new MongoClient(options.Value.ConnectionString);
            _db = client.GetDatabase(options.Value.UsersDatabase);
        }

        public IMongoCollection<User> Users => _db.GetCollection<User>("UsersDatabase");
    }
    
}