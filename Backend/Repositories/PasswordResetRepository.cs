using System.Diagnostics.CodeAnalysis;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Otel;
using MongoDB.Driver;

namespace BackendFramework.Repositories
{
    /// <summary> Atomic database functions for Password Reset <see cref="EmailToken"/>s. </summary>
    [ExcludeFromCodeCoverage]
    public class PasswordResetRepository(IMongoDbContext dbContext) : IPasswordResetRepository
    {
        private IMongoCollection<EmailToken> _passwordResets =
            dbContext.Db.GetCollection<EmailToken>("PasswordResetCollection");

        private const string otelTagName = "otel.PasswordResetRepository";

        public async Task ClearAll(string email)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "clearing all password resets");

            await _passwordResets.DeleteManyAsync(x => x.Email == email);
        }

        public async Task<EmailToken?> FindByToken(string token)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "finding password reset by token");

            return (await _passwordResets.FindAsync(r => r.Token == token)).SingleOrDefault();
        }

        public async Task Insert(EmailToken reset)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "inserting password reset");

            await _passwordResets.InsertOneAsync(reset);
        }
    }
}

