using System;
using MongoDB.Driver;

namespace BackendFramework.Interfaces
{
    public interface IMongoDbContext : IDisposable
    {
        IMongoDatabase Db { get; }
    }
}
