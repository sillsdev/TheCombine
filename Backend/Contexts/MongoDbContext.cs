using System;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace BackendFramework.Contexts;

/// <summary>
/// MongoDB context for accessing the configured database and executing transactional operations.
/// </summary>
public class MongoDbContext : IMongoDbContext
{
    /// <summary>
    /// Gets the configured MongoDB database instance.
    /// </summary>
    public IMongoDatabase Db { get; }

    /// <summary>
    /// Creates a new <see cref="MongoDbContext"/> from application settings.
    /// </summary>
    /// <param name="options">Options containing the Mongo connection string and database name.</param>
    public MongoDbContext(IOptions<Startup.Settings> options)
    {
        var client = new MongoClient(options.Value.ConnectionString);
        Db = client.GetDatabase(options.Value.CombineDatabase);
    }

    /// <summary>
    /// Begins a MongoDB transaction and returns a disposable transaction wrapper.
    /// </summary>
    /// <returns>A transaction wrapper containing the active client session.</returns>
    public async Task<IMongoTransaction> BeginTransaction()
    {
        var session = await Db.Client.StartSessionAsync();
        try
        {
            session.StartTransaction();
            return new MongoTransactionWrapper(session);
        }
        catch
        {
            session.Dispose();
            throw;
        }
    }

    /// <summary>
    /// Executes an operation in a transaction, committing on success and aborting on exception.
    /// </summary>
    /// <typeparam name="T">The operation result type.</typeparam>
    /// <param name="operation">Operation to execute with the transaction session.</param>
    /// <returns>The operation result.</returns>
    public async Task<T> ExecuteInTransaction<T>(Func<IClientSessionHandle, Task<T>> operation)
    {
        using var transaction = await BeginTransaction();
        try
        {
            var result = await operation(transaction.Session);
            await transaction.CommitTransactionAsync();
            return result;
        }
        catch
        {
            await transaction.AbortTransactionAsync();
            throw;
        }
    }

    /// <summary>
    /// Executes an operation in a transaction, committing when a non-null result is returned.
    /// Null represents an operation that could complete and shouldn't be committed, so it aborts.
    /// </summary>
    /// <typeparam name="T">The operation result type.</typeparam>
    /// <param name="operation">Operation to execute with the transaction session.</param>
    /// <returns>
    /// The operation result when non-null; otherwise <see langword="null"/> after aborting the transaction.
    /// </returns>
    public async Task<T?> ExecuteInTransactionAllowNull<T>(Func<IClientSessionHandle, Task<T?>> operation)
    {
        using var transaction = await BeginTransaction();
        try
        {
            var result = await operation(transaction.Session);
            if (result is null)
            {
                await transaction.AbortTransactionAsync();
                return default;
            }

            await transaction.CommitTransactionAsync();
            return result;
        }
        catch
        {
            await transaction.AbortTransactionAsync();
            throw;
        }
    }

    private class MongoTransactionWrapper(IClientSessionHandle session) : IMongoTransaction
    {
        private readonly IClientSessionHandle _session = session;

        public IClientSessionHandle Session => _session;

        public Task CommitTransactionAsync() => _session.CommitTransactionAsync();

        public Task AbortTransactionAsync() => _session.AbortTransactionAsync();

        public void Dispose() => _session.Dispose();
    }
}
