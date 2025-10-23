using System.Diagnostics.CodeAnalysis;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Otel;
using MongoDB.Driver;

namespace BackendFramework.Repositories
{
    /// <summary> Atomic database functions for Email Verify <see cref="EmailToken"/>s. </summary>
    [ExcludeFromCodeCoverage]
    public class EmailVerifyRepository(IMongoDbContext dbContext) : IEmailVerifyRepository
    {
        private IMongoCollection<EmailToken> _emailVerifies =
            dbContext.Db.GetCollection<EmailToken>("EmailVerifyCollection");

        private const string otelTagName = "otel.EmailVerifyRepository";

        public async Task ClearAll(string email)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "clearing all email verifications");

            await _emailVerifies.DeleteManyAsync(x => x.Email == email);
        }

        public async Task<EmailToken?> FindByToken(string token)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "finding email verification by token");

            return (await _emailVerifies.FindAsync(r => r.Token == token)).SingleOrDefault();
        }

        public async Task Insert(EmailToken reset)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "inserting email verification");

            await _emailVerifies.InsertOneAsync(reset);
        }
    }
}

