using System;
using System.Threading.Tasks;
using BackendFramework.Interfaces;

namespace Backend.Tests.Mocks
{
    internal sealed class AcknowledgmentServiceMock : IAcknowledgmentService
    {
        public void MarkAcknowledged(string requestId)
        {
            // Do nothing
        }

        public Task SendWithRetry(string userId, Func<string, Task> sendMessageAsync)
        {
            return Task.CompletedTask;
        }
    }
}
