using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;

namespace Backend.Tests.Mocks
{
    public class BannerRepositoryMock : IBannerRepository
    {
        private Banner _banner;

        public BannerRepositoryMock()
        {
            _banner = new Banner();
        }

        public Task<Banner> Get()
        {
            return Task.FromResult(_banner);
        }

        public Task<ResultOfUpdate> Update(SiteBanner banner)
        {
            _banner = new Banner { Id = _banner.Id, Login = banner.Login, Announcement = banner.Announcement };
            return Task.FromResult(ResultOfUpdate.Updated);
        }
    }
}
