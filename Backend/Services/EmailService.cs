using System;
using System.Diagnostics.CodeAnalysis;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using MimeKit;

namespace BackendFramework.Services
{
    [ExcludeFromCodeCoverage]
    public class EmailService : IEmailService
    {
        private readonly IEmailContext _emailContext;

        public EmailService(IEmailContext emailContext)
        {
            _emailContext = emailContext;
        }

        public async Task<bool> SendEmail(MimeMessage message)
        {
            if (!_emailContext.EmailEnabled)
            {
                throw new EmailNotEnabledException();
            }

            using var client = new MailKit.Net.Smtp.SmtpClient();

            await client.ConnectAsync(_emailContext.SmtpServer, _emailContext.SmtpPort);

            // SMTP server authentication if needed
            await client.AuthenticateAsync(_emailContext.SmtpUsername, _emailContext.SmtpPassword);

            // Set from field
            message.From.Clear();
            message.From.Add(new MailboxAddress(_emailContext.SmtpFrom, _emailContext.SmtpAddress));

            await client.SendAsync(message);

            await client.DisconnectAsync(true);
            return true;
        }

        private sealed class EmailNotEnabledException : Exception { }
    }
}
