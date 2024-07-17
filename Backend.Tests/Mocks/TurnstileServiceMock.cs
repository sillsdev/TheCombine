using System.Threading.Tasks;
using BackendFramework.Interfaces;

namespace Backend.Tests.Mocks
{
    sealed internal class TurnstileServiceMock : ITurnstileService
    {
        public Task<bool> VerifyToken(string token)
        {
            return Task.FromResult(true);
        }
    }
}
