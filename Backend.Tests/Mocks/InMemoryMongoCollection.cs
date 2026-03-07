using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Bson.IO;
using MongoDB.Bson.Serialization;
using MongoDB.Driver;
using MongoDB.Driver.Search;

namespace Backend.Tests.Mocks;

/// <summary>
/// An in-memory implementation of <see cref="IMongoCollection{T}"/> for testing.
/// Supports the operations used by <see cref="BackendFramework.Repositories.WordRepository"/>.
/// </summary>
internal sealed class InMemoryMongoCollection<T> : IMongoCollection<T>
{
    private readonly List<BsonDocument> _documents = [];
    private readonly IBsonSerializer<T> _serializer;
    private readonly IBsonSerializerRegistry _registry;

    public InMemoryMongoCollection(string collectionName)
    {
        _serializer = BsonSerializer.LookupSerializer<T>();
        _registry = BsonSerializer.SerializerRegistry;
        CollectionNamespace = new CollectionNamespace("testDb", collectionName);
    }

    public CollectionNamespace CollectionNamespace { get; }
    public IMongoDatabase Database => throw new NotSupportedException();
    public IBsonSerializer<T> DocumentSerializer => _serializer;
    public IMongoIndexManager<T> Indexes => throw new NotSupportedException();
    public IMongoSearchIndexManager SearchIndexes => throw new NotSupportedException();
    public MongoCollectionSettings Settings => new MongoCollectionSettings();

    // --- Core methods used by WordRepository ---

    public Task<IAsyncCursor<TProjection>> FindAsync<TProjection>(
        FilterDefinition<T> filter,
        FindOptions<T, TProjection>? options = null,
        CancellationToken cancellationToken = default)
        => Task.FromResult(BuildCursor<TProjection>(filter, options?.Limit));

    public Task<IAsyncCursor<TProjection>> FindAsync<TProjection>(
        IClientSessionHandle session,
        FilterDefinition<T> filter,
        FindOptions<T, TProjection>? options = null,
        CancellationToken cancellationToken = default)
        => FindAsync(filter, options, cancellationToken);

    public IAsyncCursor<TProjection> FindSync<TProjection>(
        FilterDefinition<T> filter,
        FindOptions<T, TProjection>? options = null,
        CancellationToken cancellationToken = default)
        => BuildCursor<TProjection>(filter, options?.Limit);

    public IAsyncCursor<TProjection> FindSync<TProjection>(
        IClientSessionHandle session,
        FilterDefinition<T> filter,
        FindOptions<T, TProjection>? options = null,
        CancellationToken cancellationToken = default)
        => FindSync(filter, options, cancellationToken);

    public Task InsertManyAsync(
        IEnumerable<T> documents,
        InsertManyOptions? options = null,
        CancellationToken cancellationToken = default)
    {
        DoInsertMany(documents);
        return Task.CompletedTask;
    }

    public Task InsertManyAsync(
        IClientSessionHandle session,
        IEnumerable<T> documents,
        InsertManyOptions? options = null,
        CancellationToken cancellationToken = default)
        => InsertManyAsync(documents, options, cancellationToken);

    public Task InsertOneAsync(
        T document,
        InsertOneOptions? options = null,
        CancellationToken cancellationToken = default)
    {
        DoInsertMany([document]);
        return Task.CompletedTask;
    }

    public Task InsertOneAsync(
        T document,
        CancellationToken cancellationToken)
        => InsertOneAsync(document, null, cancellationToken);

    public Task InsertOneAsync(
        IClientSessionHandle session,
        T document,
        InsertOneOptions? options = null,
        CancellationToken cancellationToken = default)
        => InsertOneAsync(document, options, cancellationToken);

    public Task<TProjection> FindOneAndDeleteAsync<TProjection>(
        FilterDefinition<T> filter,
        FindOneAndDeleteOptions<T, TProjection>? options = null,
        CancellationToken cancellationToken = default)
    {
        var renderArgs = new RenderArgs<T>(_serializer, _registry);
        var renderedFilter = filter.Render(renderArgs);
        var doc = _documents.FirstOrDefault(d => MatchesFilter(d, renderedFilter));
        if (doc is null)
        {
            return Task.FromResult<TProjection>(default!);
        }

        _documents.Remove(doc);
        return Task.FromResult(BsonSerializer.Deserialize<TProjection>(doc));
    }

    public Task<TProjection> FindOneAndDeleteAsync<TProjection>(
        IClientSessionHandle session,
        FilterDefinition<T> filter,
        FindOneAndDeleteOptions<T, TProjection>? options = null,
        CancellationToken cancellationToken = default)
        => FindOneAndDeleteAsync(filter, options, cancellationToken);

    public Task<DeleteResult> DeleteManyAsync(
        FilterDefinition<T> filter,
        CancellationToken cancellationToken = default)
        => DeleteManyAsync(filter, null, cancellationToken);

    public Task<DeleteResult> DeleteManyAsync(
        FilterDefinition<T> filter,
        DeleteOptions? options,
        CancellationToken cancellationToken = default)
    {
        var renderArgs = new RenderArgs<T>(_serializer, _registry);
        var renderedFilter = filter.Render(renderArgs);
        var toRemove = _documents.Where(d => MatchesFilter(d, renderedFilter)).ToList();
        toRemove.ForEach(d => _documents.Remove(d));
        return Task.FromResult<DeleteResult>(new DeleteResult.Acknowledged(toRemove.Count));
    }

    public Task<long> CountDocumentsAsync(
        FilterDefinition<T> filter,
        CountOptions? options = null,
        CancellationToken cancellationToken = default)
    {
        var renderArgs = new RenderArgs<T>(_serializer, _registry);
        var renderedFilter = filter.Render(renderArgs);
        var count = _documents.Count(d => MatchesFilter(d, renderedFilter));
        if (options?.Limit.HasValue == true)
        {
            count = Math.Min(count, (int)options.Limit.Value);
        }

        return Task.FromResult((long)count);
    }

    // --- Private helpers ---

    private void DoInsertMany(IEnumerable<T> documents)
    {
        foreach (var document in documents)
        {
            EnsureId(document);
            var bsonDoc = SerializeDocument(document);
            _documents.Add(bsonDoc);
        }
    }

    private static void EnsureId(T document)
    {
        var idProp = typeof(T).GetProperty("Id", BindingFlags.Public | BindingFlags.Instance);
        if (idProp?.PropertyType == typeof(string) && idProp.GetValue(document) is string id &&
            string.IsNullOrEmpty(id))
        {
            idProp.SetValue(document, ObjectId.GenerateNewId().ToString());
        }
    }

    private BsonDocument SerializeDocument(T document)
    {
        using var writer = new BsonDocumentWriter(new BsonDocument());
        var context = BsonSerializationContext.CreateRoot(writer);
        _serializer.Serialize(context, document);
        return writer.Document;
    }

    private IEnumerable<BsonDocument> GetMatchingBsonDocuments(FilterDefinition<T> filter, int? limit)
    {
        var renderArgs = new RenderArgs<T>(_serializer, _registry);
        var renderedFilter = filter.Render(renderArgs);
        var matching = _documents.Where(d => MatchesFilter(d, renderedFilter));
        if (limit.HasValue)
        {
            matching = matching.Take(limit.Value);
        }

        return matching;
    }

    private IEnumerable<T> GetMatchingDocuments(FilterDefinition<T> filter, int? limit)
        => GetMatchingBsonDocuments(filter, limit).Select(doc => BsonSerializer.Deserialize<T>(doc));

    private IAsyncCursor<TProjection> BuildCursor<TProjection>(FilterDefinition<T> filter, int? limit)
    {
        var matchingDocs = GetMatchingBsonDocuments(filter, limit);
        var results = matchingDocs.Select(doc => BsonSerializer.Deserialize<TProjection>(doc));
        return new InMemoryAsyncCursor<TProjection>(results);
    }

    // --- BSON filter evaluator ---

    private static bool MatchesFilter(BsonDocument doc, BsonDocument filter)
    {
        foreach (var element in filter)
        {
            switch (element.Name)
            {
                case "$and":
                    if (!element.Value.AsBsonArray.All(f => MatchesFilter(doc, f.AsBsonDocument)))
                    {
                        return false;
                    }

                    break;
                default:
                    var fieldValue = GetFieldValue(doc, element.Name);
                    if (!MatchesFieldValue(fieldValue, element.Value))
                    {
                        return false;
                    }

                    break;
            }
        }

        return true;
    }

    private static BsonValue GetFieldValue(BsonDocument doc, string fieldPath)
    {
        var parts = fieldPath.Split('.');
        BsonValue current = doc;
        foreach (var part in parts)
        {
            if (current is BsonDocument bsonDoc)
            {
                if (!bsonDoc.TryGetValue(part, out current))
                {
                    return BsonNull.Value;
                }
            }
            else if (current is BsonArray bsonArr)
            {
                if (int.TryParse(part, out var idx) && idx < bsonArr.Count)
                {
                    current = bsonArr[idx];
                }
                else
                {
                    return BsonNull.Value;
                }
            }
            else
            {
                return BsonNull.Value;
            }
        }

        return current;
    }

    private static bool MatchesFieldValue(BsonValue docValue, BsonValue filterValue)
    {
        if (filterValue is BsonDocument operators)
        {
            foreach (var op in operators)
            {
                switch (op.Name)
                {
                    case "$in":
                        if (!op.Value.AsBsonArray.Contains(docValue))
                        {
                            return false;
                        }

                        break;
                    case "$exists":
                        var shouldExist = op.Value.AsBoolean;
                        var exists = docValue is not BsonNull && docValue != BsonNull.Value;
                        if (shouldExist != exists)
                        {
                            return false;
                        }

                        break;
                    case "$elemMatch":
                        if (docValue is not BsonArray arr || !arr.Any(
                                elem => elem is BsonDocument elemDoc && MatchesFilter(elemDoc, op.Value.AsBsonDocument)))
                        {
                            return false;
                        }

                        break;
                    default:
                        throw new NotSupportedException(
                            $"Filter operator '{op.Name}' is not supported by InMemoryMongoCollection");
                }
            }

            return true;
        }

        // Simple equality
        return docValue.Equals(filterValue);
    }

    // --- Unsupported IMongoCollection methods ---

    public IAsyncCursor<TResult> Aggregate<TResult>(
        PipelineDefinition<T, TResult> pipeline,
        AggregateOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public IAsyncCursor<TResult> Aggregate<TResult>(
        IClientSessionHandle session,
        PipelineDefinition<T, TResult> pipeline,
        AggregateOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task<IAsyncCursor<TResult>> AggregateAsync<TResult>(
        PipelineDefinition<T, TResult> pipeline,
        AggregateOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task<IAsyncCursor<TResult>> AggregateAsync<TResult>(
        IClientSessionHandle session,
        PipelineDefinition<T, TResult> pipeline,
        AggregateOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public void AggregateToCollection<TResult>(
        PipelineDefinition<T, TResult> pipeline,
        AggregateOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public void AggregateToCollection<TResult>(
        IClientSessionHandle session,
        PipelineDefinition<T, TResult> pipeline,
        AggregateOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task AggregateToCollectionAsync<TResult>(
        PipelineDefinition<T, TResult> pipeline,
        AggregateOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task AggregateToCollectionAsync<TResult>(
        IClientSessionHandle session,
        PipelineDefinition<T, TResult> pipeline,
        AggregateOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public BulkWriteResult<T> BulkWrite(
        IEnumerable<WriteModel<T>> requests,
        BulkWriteOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public BulkWriteResult<T> BulkWrite(
        IClientSessionHandle session,
        IEnumerable<WriteModel<T>> requests,
        BulkWriteOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task<BulkWriteResult<T>> BulkWriteAsync(
        IEnumerable<WriteModel<T>> requests,
        BulkWriteOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task<BulkWriteResult<T>> BulkWriteAsync(
        IClientSessionHandle session,
        IEnumerable<WriteModel<T>> requests,
        BulkWriteOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    [Obsolete]
    public long Count(
        FilterDefinition<T> filter,
        CountOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    [Obsolete]
    public long Count(
        IClientSessionHandle session,
        FilterDefinition<T> filter,
        CountOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    [Obsolete]
    public Task<long> CountAsync(
        FilterDefinition<T> filter,
        CountOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    [Obsolete]
    public Task<long> CountAsync(
        IClientSessionHandle session,
        FilterDefinition<T> filter,
        CountOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public long CountDocuments(
        FilterDefinition<T> filter,
        CountOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public long CountDocuments(
        IClientSessionHandle session,
        FilterDefinition<T> filter,
        CountOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task<long> CountDocumentsAsync(
        IClientSessionHandle session,
        FilterDefinition<T> filter,
        CountOptions? options = null,
        CancellationToken cancellationToken = default)
        => CountDocumentsAsync(filter, options, cancellationToken);

    public DeleteResult DeleteMany(
        FilterDefinition<T> filter,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public DeleteResult DeleteMany(
        FilterDefinition<T> filter,
        DeleteOptions options,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public DeleteResult DeleteMany(
        IClientSessionHandle session,
        FilterDefinition<T> filter,
        DeleteOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task<DeleteResult> DeleteManyAsync(
        IClientSessionHandle session,
        FilterDefinition<T> filter,
        DeleteOptions? options = null,
        CancellationToken cancellationToken = default)
        => DeleteManyAsync(filter, options, cancellationToken);

    public DeleteResult DeleteOne(
        FilterDefinition<T> filter,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public DeleteResult DeleteOne(
        FilterDefinition<T> filter,
        DeleteOptions? options,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public DeleteResult DeleteOne(
        IClientSessionHandle session,
        FilterDefinition<T> filter,
        DeleteOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task<DeleteResult> DeleteOneAsync(
        FilterDefinition<T> filter,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task<DeleteResult> DeleteOneAsync(
        FilterDefinition<T> filter,
        DeleteOptions? options,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task<DeleteResult> DeleteOneAsync(
        IClientSessionHandle session,
        FilterDefinition<T> filter,
        DeleteOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public IAsyncCursor<TField> Distinct<TField>(
        FieldDefinition<T, TField> field,
        FilterDefinition<T> filter,
        DistinctOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public IAsyncCursor<TField> Distinct<TField>(
        IClientSessionHandle session,
        FieldDefinition<T, TField> field,
        FilterDefinition<T> filter,
        DistinctOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task<IAsyncCursor<TField>> DistinctAsync<TField>(
        FieldDefinition<T, TField> field,
        FilterDefinition<T> filter,
        DistinctOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task<IAsyncCursor<TField>> DistinctAsync<TField>(
        IClientSessionHandle session,
        FieldDefinition<T, TField> field,
        FilterDefinition<T> filter,
        DistinctOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public IAsyncCursor<TItem> DistinctMany<TItem>(
        FieldDefinition<T, IEnumerable<TItem>> field,
        FilterDefinition<T> filter,
        DistinctOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public IAsyncCursor<TItem> DistinctMany<TItem>(
        IClientSessionHandle session,
        FieldDefinition<T, IEnumerable<TItem>> field,
        FilterDefinition<T> filter,
        DistinctOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task<IAsyncCursor<TItem>> DistinctManyAsync<TItem>(
        FieldDefinition<T, IEnumerable<TItem>> field,
        FilterDefinition<T> filter,
        DistinctOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task<IAsyncCursor<TItem>> DistinctManyAsync<TItem>(
        IClientSessionHandle session,
        FieldDefinition<T, IEnumerable<TItem>> field,
        FilterDefinition<T> filter,
        DistinctOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public long EstimatedDocumentCount(
        EstimatedDocumentCountOptions? options = null,
        CancellationToken cancellationToken = default)
        => _documents.Count;

    public Task<long> EstimatedDocumentCountAsync(
        EstimatedDocumentCountOptions? options = null,
        CancellationToken cancellationToken = default)
        => Task.FromResult((long)_documents.Count);

    public TProjection FindOneAndDelete<TProjection>(
        FilterDefinition<T> filter,
        FindOneAndDeleteOptions<T, TProjection>? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public TProjection FindOneAndDelete<TProjection>(
        IClientSessionHandle session,
        FilterDefinition<T> filter,
        FindOneAndDeleteOptions<T, TProjection>? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public TProjection FindOneAndReplace<TProjection>(
        FilterDefinition<T> filter,
        T replacement,
        FindOneAndReplaceOptions<T, TProjection>? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public TProjection FindOneAndReplace<TProjection>(
        IClientSessionHandle session,
        FilterDefinition<T> filter,
        T replacement,
        FindOneAndReplaceOptions<T, TProjection>? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task<TProjection> FindOneAndReplaceAsync<TProjection>(
        FilterDefinition<T> filter,
        T replacement,
        FindOneAndReplaceOptions<T, TProjection>? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task<TProjection> FindOneAndReplaceAsync<TProjection>(
        IClientSessionHandle session,
        FilterDefinition<T> filter,
        T replacement,
        FindOneAndReplaceOptions<T, TProjection>? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public TProjection FindOneAndUpdate<TProjection>(
        FilterDefinition<T> filter,
        UpdateDefinition<T> update,
        FindOneAndUpdateOptions<T, TProjection>? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public TProjection FindOneAndUpdate<TProjection>(
        IClientSessionHandle session,
        FilterDefinition<T> filter,
        UpdateDefinition<T> update,
        FindOneAndUpdateOptions<T, TProjection>? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task<TProjection> FindOneAndUpdateAsync<TProjection>(
        FilterDefinition<T> filter,
        UpdateDefinition<T> update,
        FindOneAndUpdateOptions<T, TProjection>? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task<TProjection> FindOneAndUpdateAsync<TProjection>(
        IClientSessionHandle session,
        FilterDefinition<T> filter,
        UpdateDefinition<T> update,
        FindOneAndUpdateOptions<T, TProjection>? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public void InsertMany(
        IEnumerable<T> documents,
        InsertManyOptions? options = null,
        CancellationToken cancellationToken = default)
        => DoInsertMany(documents);

    public void InsertMany(
        IClientSessionHandle session,
        IEnumerable<T> documents,
        InsertManyOptions? options = null,
        CancellationToken cancellationToken = default)
        => InsertMany(documents, options, cancellationToken);

    public void InsertOne(
        T document,
        InsertOneOptions? options = null,
        CancellationToken cancellationToken = default)
        => DoInsertMany([document]);

    public void InsertOne(
        IClientSessionHandle session,
        T document,
        InsertOneOptions? options = null,
        CancellationToken cancellationToken = default)
        => InsertOne(document, options, cancellationToken);

#pragma warning disable CS0618
    public IAsyncCursor<TResult> MapReduce<TResult>(
        BsonJavaScript map,
        BsonJavaScript reduce,
        MapReduceOptions<T, TResult>? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public IAsyncCursor<TResult> MapReduce<TResult>(
        IClientSessionHandle session,
        BsonJavaScript map,
        BsonJavaScript reduce,
        MapReduceOptions<T, TResult>? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task<IAsyncCursor<TResult>> MapReduceAsync<TResult>(
        BsonJavaScript map,
        BsonJavaScript reduce,
        MapReduceOptions<T, TResult>? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task<IAsyncCursor<TResult>> MapReduceAsync<TResult>(
        IClientSessionHandle session,
        BsonJavaScript map,
        BsonJavaScript reduce,
        MapReduceOptions<T, TResult>? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();
#pragma warning restore CS0618

    public IFilteredMongoCollection<TDerivedDocument> OfType<TDerivedDocument>()
        where TDerivedDocument : T
        => throw new NotSupportedException();

    public ReplaceOneResult ReplaceOne(
        FilterDefinition<T> filter,
        T replacement,
        ReplaceOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public ReplaceOneResult ReplaceOne(
        FilterDefinition<T> filter,
        T replacement,
        UpdateOptions options,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public ReplaceOneResult ReplaceOne(
        IClientSessionHandle session,
        FilterDefinition<T> filter,
        T replacement,
        ReplaceOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public ReplaceOneResult ReplaceOne(
        IClientSessionHandle session,
        FilterDefinition<T> filter,
        T replacement,
        UpdateOptions options,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task<ReplaceOneResult> ReplaceOneAsync(
        FilterDefinition<T> filter,
        T replacement,
        ReplaceOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task<ReplaceOneResult> ReplaceOneAsync(
        FilterDefinition<T> filter,
        T replacement,
        UpdateOptions options,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task<ReplaceOneResult> ReplaceOneAsync(
        IClientSessionHandle session,
        FilterDefinition<T> filter,
        T replacement,
        ReplaceOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task<ReplaceOneResult> ReplaceOneAsync(
        IClientSessionHandle session,
        FilterDefinition<T> filter,
        T replacement,
        UpdateOptions options,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public UpdateResult UpdateMany(
        FilterDefinition<T> filter,
        UpdateDefinition<T> update,
        UpdateOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public UpdateResult UpdateMany(
        IClientSessionHandle session,
        FilterDefinition<T> filter,
        UpdateDefinition<T> update,
        UpdateOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task<UpdateResult> UpdateManyAsync(
        FilterDefinition<T> filter,
        UpdateDefinition<T> update,
        UpdateOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task<UpdateResult> UpdateManyAsync(
        IClientSessionHandle session,
        FilterDefinition<T> filter,
        UpdateDefinition<T> update,
        UpdateOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public UpdateResult UpdateOne(
        FilterDefinition<T> filter,
        UpdateDefinition<T> update,
        UpdateOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public UpdateResult UpdateOne(
        IClientSessionHandle session,
        FilterDefinition<T> filter,
        UpdateDefinition<T> update,
        UpdateOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task<UpdateResult> UpdateOneAsync(
        FilterDefinition<T> filter,
        UpdateDefinition<T> update,
        UpdateOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task<UpdateResult> UpdateOneAsync(
        IClientSessionHandle session,
        FilterDefinition<T> filter,
        UpdateDefinition<T> update,
        UpdateOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public IChangeStreamCursor<TResult> Watch<TResult>(
        PipelineDefinition<ChangeStreamDocument<T>, TResult> pipeline,
        ChangeStreamOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public IChangeStreamCursor<TResult> Watch<TResult>(
        IClientSessionHandle session,
        PipelineDefinition<ChangeStreamDocument<T>, TResult> pipeline,
        ChangeStreamOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task<IChangeStreamCursor<TResult>> WatchAsync<TResult>(
        PipelineDefinition<ChangeStreamDocument<T>, TResult> pipeline,
        ChangeStreamOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public Task<IChangeStreamCursor<TResult>> WatchAsync<TResult>(
        IClientSessionHandle session,
        PipelineDefinition<ChangeStreamDocument<T>, TResult> pipeline,
        ChangeStreamOptions? options = null,
        CancellationToken cancellationToken = default)
        => throw new NotSupportedException();

    public IMongoCollection<T> WithReadConcern(ReadConcern readConcern) => this;
    public IMongoCollection<T> WithReadPreference(ReadPreference readPreference) => this;
    public IMongoCollection<T> WithWriteConcern(WriteConcern writeConcern) => this;
}

/// <summary>
/// A simple in-memory <see cref="IAsyncCursor{T}"/> that yields all items in a single batch.
/// </summary>
internal sealed class InMemoryAsyncCursor<T>(IEnumerable<T> documents) : IAsyncCursor<T>
{
    private readonly IEnumerator<T> _enumerator = documents.GetEnumerator();
    private bool _exhausted;

    public IEnumerable<T> Current { get; private set; } = [];

    public bool MoveNext(CancellationToken cancellationToken = default)
    {
        if (_exhausted)
        {
            return false;
        }

        _exhausted = true;
        var batch = new List<T>();
        while (_enumerator.MoveNext())
        {
            batch.Add(_enumerator.Current);
        }

        Current = batch;
        return batch.Count > 0;
    }

    public Task<bool> MoveNextAsync(CancellationToken cancellationToken = default)
        => Task.FromResult(MoveNext(cancellationToken));

    public void Dispose() => _enumerator.Dispose();
}
