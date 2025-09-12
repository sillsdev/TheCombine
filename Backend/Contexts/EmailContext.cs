using System.Diagnostics.CodeAnalysis;
using BackendFramework.Interfaces;
using Microsoft.Extensions.Options;

namespace BackendFramework.Contexts
{
    [ExcludeFromCodeCoverage]
    public class EmailContext(IOptions<Startup.Settings> options) : IEmailContext
    {
        public bool EmailEnabled { get; } = options.Value.EmailEnabled;
        public string? SmtpServer { get; } = options.Value.SmtpServer;
        public int SmtpPort { get; } = options.Value.SmtpPort ?? IEmailContext.InvalidPort;
        public string? SmtpUsername { get; } = options.Value.SmtpUsername;
        public string? SmtpPassword { get; } = options.Value.SmtpPassword;
        public string? SmtpAddress { get; } = options.Value.SmtpAddress;
        public string? SmtpFrom { get; } = options.Value.SmtpFrom;
    }
}
