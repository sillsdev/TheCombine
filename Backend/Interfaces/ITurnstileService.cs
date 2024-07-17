using System.Threading.Tasks;

namespace BackendFramework.Interfaces
{
    public interface ITurnstileService
    {
        Task<bool> VerifyToken(string token);
    }
}
