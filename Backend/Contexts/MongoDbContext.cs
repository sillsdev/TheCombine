using System.Threading.Tasks;
using BackendFramework.Interfaces;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace BackendFramework.Contexts;

public class MongoDbContext : IMongoDbContext
{
    public IMongoDatabase Db { get; }

    public MongoDbContext(IOptions<Startup.Settings> options)
    {
        var client = new MongoClient(options.Value.ConnectionString);
        Db = client.GetDatabase(options.Value.CombineDatabase);
    }

    public async Task<IMongoTransaction> BeginTransaction()
    {
        var session = await Db.Client.StartSessionAsync();
        session.StartTransaction();
        return new MongoTransactionWrapper(session);
    }

    private class MongoTransactionWrapper(IClientSessionHandle session) : IMongoTransaction
    {
        private readonly IClientSessionHandle _session = session;

        public IClientSessionHandle Session => _session;

        public Task CommitTransactionAsync()
        {
            return _session.CommitTransactionAsync();
        }

        public Task AbortTransactionAsync()
        {
            return _session.AbortTransactionAsync();
        }

        public void Dispose()
        {
            _session.Dispose();
        }
    }
}
