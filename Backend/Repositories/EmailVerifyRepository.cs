using System.Diagnostics.CodeAnalysis;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Repositories
{
    /// <summary> Atomic database functions for Email Verify <see cref="EmailToken"/>s. </summary>
    [ExcludeFromCodeCoverage]
    public class EmailVerifyRepository(IMongoDbContext dbContext) : IEmailVerifyRepository
    {
        private IMongoCollection<EmailToken> _emailVerifies =
            dbContext.Db.GetCollection<EmailToken>("EmailVerifyCollection");

        public async Task ClearAll(string email)
        {
            await _emailVerifies.DeleteManyAsync(x => x.Email == email);
        }

        public async Task<EmailToken?> FindByToken(string token)
        {
            return (await _emailVerifies.FindAsync(r => r.Token == token)).SingleOrDefault();
        }

        public async Task Insert(EmailToken reset)
        {
            await _emailVerifies.InsertOneAsync(reset);
        }
    }
}

