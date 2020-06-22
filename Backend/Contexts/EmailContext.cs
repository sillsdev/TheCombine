using BackendFramework.Interfaces;
using static BackendFramework.Startup;
using Microsoft.Extensions.Options;

namespace BackendFramework.Contexts
{
    public class EmailContext : IEmailContext
    {
        public string SmtpServer { get; }
        public int SmtpPort { get; }
        public string SmtpUsername { get; }
        public string SmtpPassword { get; }
        public string SmtpAddress { get; }

        public EmailContext(IOptions<Settings> options)
        {
            this.SmtpServer = options.Value.SmtpServer;
            this.SmtpPort = options.Value.SmtpPort;
            this.SmtpUsername = options.Value.SmtpUsername;
            this.SmtpPassword = options.Value.SmtpPassword;
            this.SmtpAddress = options.Value.SmtpAddress;
        }
    }
}