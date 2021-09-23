using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IBannerRepository
    {
        Task<Banner> Get(BannerType type);
        Task<ResultOfUpdate> Update(SiteBanner banner);
    }
}
