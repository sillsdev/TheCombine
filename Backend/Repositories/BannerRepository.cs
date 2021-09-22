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
            var bannerList = await _bannerDatabase.Banners.FindAsync(x => true);
            try
            {
                return await bannerList.FirstAsync();
            }
            catch (InvalidOperationException)
            {
                return await CreateEmptyBanner();
            }
        }

        public async Task<ResultOfUpdate> Update(SiteBanner banner)
        {
            var existingBanner = await Get();
            var filter = Builders<Banner>.Filter.Eq(x => x.Id, existingBanner.Id);
            var updateDef = Builders<Banner>.Update
                .Set(x => x.Login, banner.Login)
                .Set(x => x.Announcement, banner.Announcement);
            var updateResult = await _bannerDatabase.Banners.UpdateOneAsync(filter, updateDef);

            // The Banner singleton should always exist, so this case should never happen.
            if (!updateResult.IsAcknowledged)
            {
                throw new BannerSingletonNotFound();
            }

            return ResultOfUpdate.Updated;
        }

        [Serializable]
        private class BannerSingletonNotFound : Exception { }
    }
}
