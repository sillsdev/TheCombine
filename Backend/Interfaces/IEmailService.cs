using System.Threading.Tasks;
using MimeKit;

namespace BackendFramework.Interfaces
{
    public interface IEmailService
    {
        Task<bool> SendEmail(MimeMessage message);
    }
}
