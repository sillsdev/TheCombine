using System.Threading.Tasks;
using BackendFramework.Interfaces;
using MimeKit;

namespace Backend.Tests.Mocks
{
    internal class EmailServiceMock : IEmailService
    {
        public Task<bool> SendEmail(MimeMessage msg)
        {
            return Task.FromResult(true);
        }
    }
}
