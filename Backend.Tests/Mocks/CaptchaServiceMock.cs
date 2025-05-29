using System.Threading.Tasks;
using BackendFramework.Interfaces;

namespace Backend.Tests.Mocks
{
    internal sealed class CaptchaServiceMock : ICaptchaService
    {
        public Task<bool> VerifyToken(string token)
        {
            return Task.FromResult(true);
        }
    }
}
