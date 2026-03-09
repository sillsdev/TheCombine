using System;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using MongoDB.Driver;

namespace Backend.Tests.Mocks;

public class MongoDbContextMock : IMongoDbContext
{
    public IMongoDatabase Db => throw new NotSupportedException();

    public Task<IMongoTransaction> BeginTransaction()
        => Task.FromResult<IMongoTransaction>(new MongoTransactionMock());

    public Task<T> ExecuteWithTransaction<T>(Func<IClientSessionHandle, Task<T>> operation)
    {
        throw new NotImplementedException();
    }

    public Task<T?> ExecuteWithTransactionAllowNull<T>(Func<IClientSessionHandle, Task<T?>> operation) where T : class
    {
        throw new NotImplementedException();
    }

    private sealed class MongoTransactionMock : IMongoTransaction
    {
        public IClientSessionHandle Session => null!;

        public Task CommitTransactionAsync() => Task.CompletedTask;

        public Task AbortTransactionAsync() => Task.CompletedTask;

        public void Dispose() { }
    }
}
