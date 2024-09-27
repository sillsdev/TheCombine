using System;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using MongoDB.Driver;

namespace Backend.Tests.Mocks;

public class MongoDbContextMock : IMongoDbContext
{
    public IMongoDatabase Db => throw new NotSupportedException();
    public Task<IMongoTransaction> BeginTransaction()
    {
        return Task.FromResult<IMongoTransaction>(new MongoTransactionMock());
    }

    private sealed class MongoTransactionMock : IMongoTransaction
    {
        public Task CommitTransactionAsync()
        {
            return Task.CompletedTask;
        }

        public Task AbortTransactionAsync()
        {
            return Task.CompletedTask;
        }

        public void Dispose()
        {
        }
    }
}
