using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IBannerRepository
    {
        Task<Banner> Get();
        Task<ResultOfUpdate> Update(Banner banner);
    }
}
