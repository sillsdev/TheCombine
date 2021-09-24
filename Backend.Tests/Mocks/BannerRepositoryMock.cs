using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;

namespace Backend.Tests.Mocks
{
    public class BannerRepositoryMock : IBannerRepository
    {
        private Dictionary<BannerType, Banner> _banners;

        public BannerRepositoryMock()
        {
            _banners = new Dictionary<BannerType, Banner>();
            _banners[BannerType.Announcement] = new Banner { Type = BannerType.Announcement };
            _banners[BannerType.Login] = new Banner { Type = BannerType.Login };
        }

        public Task<Banner> Get(BannerType type)
        {
            return Task.FromResult(_banners[type]);
        }

        public Task<ResultOfUpdate> Update(SiteBanner banner)
        {
            _banners[banner.Type].Text = banner.Text;
            return Task.FromResult(ResultOfUpdate.Updated);
        }
    }
}
