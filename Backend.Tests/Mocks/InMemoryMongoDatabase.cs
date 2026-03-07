using System;
using System.Collections.Concurrent;
using System.Threading;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Backend.Tests.Mocks;

/// <summary>
/// An in-memory implementation of <see cref="IMongoDatabase"/> for testing.
/// Returns <see cref="InMemoryMongoCollection{T}"/> instances keyed by collection name.
/// </summary>
internal sealed class InMemoryMongoDatabase : IMongoDatabase
{
    private readonly ConcurrentDictionary<string, object> _collections = new();

    public IMongoCollection<T> GetCollection<T>(
        string name,
        MongoCollectionSettings? settings = null)
    {
        return (IMongoCollection<T>)_collections.GetOrAdd(
            name,
            _ => new InMemoryMongoCollection<T>(name));
    }

    // --- Unsupported IMongoDatabase members ---
    public IMongoClient Client => throw new NotSupportedException();
    public DatabaseNamespace DatabaseNamespace => throw new NotSupportedException();
    public MongoDatabaseSettings Settings => throw new NotSupportedException();

    public IAsyncCursor<TResult> Aggregate<TResult>(
        PipelineDefinition<NoPipelineInput, TResult> pipeline,
        AggregateOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public IAsyncCursor<TResult> Aggregate<TResult>(
        IClientSessionHandle session,
        PipelineDefinition<NoPipelineInput, TResult> pipeline,
        AggregateOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task<IAsyncCursor<TResult>> AggregateAsync<TResult>(
        PipelineDefinition<NoPipelineInput, TResult> pipeline,
        AggregateOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task<IAsyncCursor<TResult>> AggregateAsync<TResult>(
        IClientSessionHandle session,
        PipelineDefinition<NoPipelineInput, TResult> pipeline,
        AggregateOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public void AggregateToCollection<TResult>(
        PipelineDefinition<NoPipelineInput, TResult> pipeline,
        AggregateOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public void AggregateToCollection<TResult>(
        IClientSessionHandle session,
        PipelineDefinition<NoPipelineInput, TResult> pipeline,
        AggregateOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task AggregateToCollectionAsync<TResult>(
        PipelineDefinition<NoPipelineInput, TResult> pipeline,
        AggregateOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task AggregateToCollectionAsync<TResult>(
        IClientSessionHandle session,
        PipelineDefinition<NoPipelineInput, TResult> pipeline,
        AggregateOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public void CreateCollection(
        string name,
        CreateCollectionOptions? options = null,
        CancellationToken cancellationToken = default)
    { }

    public void CreateCollection(
        IClientSessionHandle session,
        string name,
        CreateCollectionOptions? options = null,
        CancellationToken cancellationToken = default)
    { }

    public Task CreateCollectionAsync(
        string name,
        CreateCollectionOptions? options = null,
        CancellationToken cancellationToken = default)
        => Task.CompletedTask;

    public Task CreateCollectionAsync(
        IClientSessionHandle session,
        string name,
        CreateCollectionOptions? options = null,
        CancellationToken cancellationToken = default)
        => Task.CompletedTask;

    public void CreateView<TDocument, TProjection>(
        string viewName,
        string viewOn,
        PipelineDefinition<TDocument, TProjection> pipeline,
        CreateViewOptions<TDocument>? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public void CreateView<TDocument, TProjection>(
        IClientSessionHandle session,
        string viewName,
        string viewOn,
        PipelineDefinition<TDocument, TProjection> pipeline,
        CreateViewOptions<TDocument>? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task CreateViewAsync<TDocument, TProjection>(
        string viewName,
        string viewOn,
        PipelineDefinition<TDocument, TProjection> pipeline,
        CreateViewOptions<TDocument>? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task CreateViewAsync<TDocument, TProjection>(
        IClientSessionHandle session,
        string viewName,
        string viewOn,
        PipelineDefinition<TDocument, TProjection> pipeline,
        CreateViewOptions<TDocument>? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public void DropCollection(
        string name,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public void DropCollection(
        string name,
        DropCollectionOptions options,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public void DropCollection(
        DropCollectionOptions options,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public void DropCollection(
        IClientSessionHandle session,
        string name,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public void DropCollection(
        IClientSessionHandle session,
        string name,
        DropCollectionOptions options,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public void DropCollection(
        IClientSessionHandle session,
        DropCollectionOptions options,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task DropCollectionAsync(
        string name,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task DropCollectionAsync(
        string name,
        DropCollectionOptions options,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task DropCollectionAsync(
        DropCollectionOptions options,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task DropCollectionAsync(
        IClientSessionHandle session,
        string name,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task DropCollectionAsync(
        IClientSessionHandle session,
        string name,
        DropCollectionOptions options,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task DropCollectionAsync(
        IClientSessionHandle session,
        DropCollectionOptions options,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public IAsyncCursor<string> ListCollectionNames(
        ListCollectionNamesOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public IAsyncCursor<string> ListCollectionNames(
        IClientSessionHandle session,
        ListCollectionNamesOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task<IAsyncCursor<string>> ListCollectionNamesAsync(
        ListCollectionNamesOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task<IAsyncCursor<string>> ListCollectionNamesAsync(
        IClientSessionHandle session,
        ListCollectionNamesOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public IAsyncCursor<BsonDocument> ListCollections(
        ListCollectionsOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public IAsyncCursor<BsonDocument> ListCollections(
        IClientSessionHandle session,
        ListCollectionsOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task<IAsyncCursor<BsonDocument>> ListCollectionsAsync(
        ListCollectionsOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task<IAsyncCursor<BsonDocument>> ListCollectionsAsync(
        IClientSessionHandle session,
        ListCollectionsOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public void RenameCollection(
        string oldName,
        string newName,
        RenameCollectionOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public void RenameCollection(
        IClientSessionHandle session,
        string oldName,
        string newName,
        RenameCollectionOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task RenameCollectionAsync(
        string oldName,
        string newName,
        RenameCollectionOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task RenameCollectionAsync(
        IClientSessionHandle session,
        string oldName,
        string newName,
        RenameCollectionOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public TResult RunCommand<TResult>(
        Command<TResult> command,
        ReadPreference? readPreference = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public TResult RunCommand<TResult>(
        IClientSessionHandle session,
        Command<TResult> command,
        ReadPreference? readPreference = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task<TResult> RunCommandAsync<TResult>(
        Command<TResult> command,
        ReadPreference? readPreference = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task<TResult> RunCommandAsync<TResult>(
        IClientSessionHandle session,
        Command<TResult> command,
        ReadPreference? readPreference = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public IChangeStreamCursor<TResult> Watch<TResult>(
        PipelineDefinition<ChangeStreamDocument<BsonDocument>, TResult> pipeline,
        ChangeStreamOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public IChangeStreamCursor<TResult> Watch<TResult>(
        IClientSessionHandle session,
        PipelineDefinition<ChangeStreamDocument<BsonDocument>, TResult> pipeline,
        ChangeStreamOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task<IChangeStreamCursor<TResult>> WatchAsync<TResult>(
        PipelineDefinition<ChangeStreamDocument<BsonDocument>, TResult> pipeline,
        ChangeStreamOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task<IChangeStreamCursor<TResult>> WatchAsync<TResult>(
        IClientSessionHandle session,
        PipelineDefinition<ChangeStreamDocument<BsonDocument>, TResult> pipeline,
        ChangeStreamOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public IMongoDatabase WithReadConcern(ReadConcern readConcern) => this;
    public IMongoDatabase WithReadPreference(ReadPreference readPreference) => this;
    public IMongoDatabase WithWriteConcern(WriteConcern writeConcern) => this;
}
