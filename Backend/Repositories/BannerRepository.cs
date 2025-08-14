using System;
using System.Diagnostics.CodeAnalysis;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Repositories
{
    /// <summary> Atomic database functions for <see cref="Banner"/>s. </summary>
    [ExcludeFromCodeCoverage]
    public class BannerRepository(IMongoDbContext dbContext) : IBannerRepository
    {
        private readonly IMongoCollection<Banner> _banners = dbContext.Db.GetCollection<Banner>("BannerCollection");

        private async Task<Banner> CreateEmptyBanner(BannerType type)
        {
            var emptyBanner = new Banner { Type = type };
            await _banners.InsertOneAsync(emptyBanner);
            return emptyBanner;
        }

        public async Task<Banner> GetBanner(BannerType type)
        {
            var bannerList = await _banners.FindAsync(x => x.Type == type);
            try
            {
                return await bannerList.FirstAsync();
            }
            catch (InvalidOperationException)
            {
                return await CreateEmptyBanner(type);
            }
        }

        public async Task<ResultOfUpdate> Update(SiteBanner banner)
        {
            var existingBanner = await GetBanner(banner.Type);
            var filter = Builders<Banner>.Filter.Eq(x => x.Id, existingBanner.Id);
            var updateDef = Builders<Banner>.Update
                .Set(x => x.Type, banner.Type)
                .Set(x => x.Text, banner.Text);
            var updateResult = await _banners.UpdateOneAsync(filter, updateDef);

            // The singleton for each banner type should always exist, so this case should never happen.
            if (!updateResult.IsAcknowledged)
            {
                throw new BannerNotFound();
            }

            return ResultOfUpdate.Updated;
        }

        private sealed class BannerNotFound : Exception { }
    }
}
