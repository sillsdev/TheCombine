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
        public string SmtpFrom { get; }

        public EmailContext(IOptions<Settings> options)
        {
            SmtpServer = options.Value.SmtpServer;
            SmtpPort = options.Value.SmtpPort;
            SmtpUsername = options.Value.SmtpUsername;
            SmtpPassword = options.Value.SmtpPassword;
            SmtpAddress = options.Value.SmtpAddress;
            SmtpFrom = options.Value.SmtpFrom;
        }
    }
}
