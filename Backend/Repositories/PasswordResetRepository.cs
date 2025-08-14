using System.Diagnostics.CodeAnalysis;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Repositories
{
    /// <summary> Atomic database functions for Password Reset <see cref="EmailToken"/>s. </summary>
    [ExcludeFromCodeCoverage]
    public class PasswordResetRepository(IMongoDbContext dbContext) : IPasswordResetRepository
    {
        private IMongoCollection<EmailToken> _passwordResets =
            dbContext.Db.GetCollection<EmailToken>("PasswordResetCollection");

        public async Task ClearAll(string email)
        {
            await _passwordResets.DeleteManyAsync(x => x.Email == email);
        }

        public async Task<EmailToken?> FindByToken(string token)
        {
            return (await _passwordResets.FindAsync(r => r.Token == token)).SingleOrDefault();
        }

        public async Task Insert(EmailToken reset)
        {
            await _passwordResets.InsertOneAsync(reset);
        }
    }
}

