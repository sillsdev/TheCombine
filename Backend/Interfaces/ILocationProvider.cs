using System.Threading.Tasks;
using BackendFramework.Otel;

namespace BackendFramework.Interfaces
{
    public interface ILocationProvider
    {
        Task<LocationApi?> GetLocation();
    }
}
