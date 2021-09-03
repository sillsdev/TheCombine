using System;
using System.Diagnostics.CodeAnalysis;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Repositories
{
    /// <summary> Atomic database functions for <see cref="Banner"/> singleton. </summary>
    [ExcludeFromCodeCoverage]
    public class BannerRepository : IBannerRepository
    {
        private readonly IBannerContext _bannerDatabase;

        public BannerRepository(IBannerContext collectionSettings)
        {
            _bannerDatabase = collectionSettings;
        }

        private async Task<Banner> CreateEmptyBanner()
        {
            var emptyBanner = new Banner();
            await _bannerDatabase.Banners.InsertOneAsync(emptyBanner);
            return emptyBanner;
        }

        public async Task<Banner> Get()
        {
            var bannerList = await _bannerDatabase.Banners.FindAsync(b => true);
            try
            {
                return await bannerList.FirstAsync();
            }
            catch (InvalidOperationException)
            {
                return await CreateEmptyBanner();
            }
        }

        public async Task<ResultOfUpdate> Update(Banner banner)
        {
            var existingBanner = await Get();
            var filter = Builders<Banner>.Filter.Eq(b => b.Id, existingBanner.Id);
            var updateDef = Builders<Banner>.Update.Set(b => banner, banner);
            var updateResult = await _bannerDatabase.Banners.UpdateOneAsync(filter, updateDef);

            // The Banner singleton should always exist, so this case should never happen.
            if (!updateResult.IsAcknowledged || updateResult.ModifiedCount != 1)
            {
                throw new BannerSingletonNotFound();
            }

            return ResultOfUpdate.Updated;
        }

        [Serializable]
        private class BannerSingletonNotFound : Exception
        {
        }
    }
}
