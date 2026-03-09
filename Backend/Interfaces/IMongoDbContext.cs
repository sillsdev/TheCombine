using System;
using System.Threading.Tasks;
using MongoDB.Driver;

namespace BackendFramework.Interfaces;

public interface IMongoDbContext
{
    IMongoDatabase Db { get; }
    Task<IMongoTransaction> BeginTransaction();
}

public interface IMongoTransaction : IDisposable
{
    IClientSessionHandle Session { get; }
    Task CommitTransactionAsync();
    Task AbortTransactionAsync();
}
