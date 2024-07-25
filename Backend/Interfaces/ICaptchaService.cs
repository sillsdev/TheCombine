using System.Threading.Tasks;

namespace BackendFramework.Interfaces
{
    public interface ICaptchaService
    {
        Task<bool> VerifyToken(string token);
    }
}
