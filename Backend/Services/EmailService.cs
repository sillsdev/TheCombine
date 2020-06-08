using BackendFramework.Interfaces;
using System.Threading.Tasks;
using MimeKit;

namespace BackendFramework.Services
{
    public class EmailService : IEmailService
    {
        private readonly IEmailContext _emailContext;

        public EmailService(IEmailContext emailContext)
        {
            _emailContext = emailContext;
        }

        public async Task<bool> SendEmail(MimeMessage message)
        {
            using (var client = new MailKit.Net.Smtp.SmtpClient())
            {

                client.Connect(_emailContext.SmtpServer, _emailContext.SmtpPort);

                //SMTP server authentication if needed
                client.Authenticate(_emailContext.SmtpUsername, _emailContext.SmtpPassword);

                // set from field
                message.From.Clear();
                message.From.Add(new MailboxAddress("The Combine", _emailContext.SmtpUsername));

                await client.SendAsync(message);

                client.Disconnect(true);
            }
            return true;
        }
    }
}