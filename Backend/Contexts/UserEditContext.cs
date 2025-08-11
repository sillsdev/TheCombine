using System.Diagnostics.CodeAnalysis;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Contexts
{
    [ExcludeFromCodeCoverage]
    public class UserEditContext(IMongoDbContext mongoDbContext) : IUserEditContext
    {
        private readonly IMongoDatabase _db = mongoDbContext.Db;

        public IMongoCollection<UserEdit> UserEdits => _db.GetCollection<UserEdit>("UserEditsCollection");
    }
}
