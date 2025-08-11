using System.Diagnostics.CodeAnalysis;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Contexts
{
    [ExcludeFromCodeCoverage]
    public class BannerContext(IMongoDbContext mongoDbContext) : IBannerContext
    {
        private readonly IMongoDatabase _db = mongoDbContext.Db;

        public IMongoCollection<Banner> Banners => _db.GetCollection<Banner>("BannerCollection");
    }
}
