using System;
using System.Threading.Tasks;
using MongoDB.Driver;

namespace BackendFramework.Interfaces
{
    /// <summary>
    /// Abstraction over MongoDB database access and transaction execution.
    /// </summary>
    public interface IMongoDbContext
    {
        /// <summary>
        /// Gets the configured MongoDB database instance.
        /// </summary>
        IMongoDatabase Db { get; }

        /// <summary>
        /// Begins a new transaction and returns the transaction wrapper.
        /// </summary>
        /// <returns>A transaction wrapper containing the active client session.</returns>
        Task<IMongoTransaction> BeginTransaction();

        /// <summary>
        /// Executes an operation in a transaction, committing on success and aborting on exception.
        /// </summary>
        /// <typeparam name="T">The operation result type.</typeparam>
        /// <param name="operation">Operation to execute with the transaction session.</param>
        /// <returns>The operation result.</returns>
        Task<T> ExecuteInTransaction<T>(Func<IClientSessionHandle, Task<T>> operation);

        /// <summary>
        /// Executes an operation in a transaction, committing only when a non-null result is returned.
        /// Null represents an operation that could complete and shouldn't be committed, so it aborts.
        /// </summary>
        /// <typeparam name="T">The operation result type.</typeparam>
        /// <param name="operation">Operation to execute with the transaction session.</param>
        /// <returns>
        /// The operation result when non-null; otherwise <see langword="null"/> after aborting the transaction.
        /// </returns>
        Task<T?> ExecuteInTransactionAllowNull<T>(Func<IClientSessionHandle, Task<T?>> operation);
    }

    /// <summary>
    /// Represents a MongoDB transaction wrapper that exposes the active session and transaction controls.
    /// </summary>
    public interface IMongoTransaction : IDisposable
    {
        IClientSessionHandle Session { get; }
        Task CommitTransactionAsync();
        Task AbortTransactionAsync();
    }
}
