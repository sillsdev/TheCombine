using System.Threading.Tasks;
using BackendFramework.Interfaces;
using Moq;
using MongoDB.Driver;

namespace Backend.Tests.Mocks;

/// <summary>
/// A mock of <see cref="IMongoDbContext"/> for testing.
/// Provides an <see cref="InMemoryMongoDatabase"/> as <see cref="Db"/> and a no-op transaction.
/// </summary>
/// <remarks>
/// Each instance has its own isolated <see cref="InMemoryMongoDatabase"/>, so tests using
/// different instances have separate data.
/// </remarks>
public class MongoDbContextMock : IMongoDbContext
{
    public IMongoDatabase Db { get; } = new InMemoryMongoDatabase();

    public Task<IMongoTransaction> BeginTransaction()
    {
        return Task.FromResult<IMongoTransaction>(new MongoTransactionMock());
    }

    private sealed class MongoTransactionMock : IMongoTransaction
    {
        /// <summary>
        /// A non-null mock session needed so that MongoDB extension methods pass their null check.
        /// The in-memory collections ignore the session entirely.
        /// </summary>
        private static readonly IClientSessionHandle MockSession =
            new Mock<IClientSessionHandle>().Object;

        public IClientSessionHandle Session => MockSession;

        public Task CommitTransactionAsync() => Task.CompletedTask;

        public Task AbortTransactionAsync() => Task.CompletedTask;

        public void Dispose() { }
    }
}
