namespace BackendFramework.Interfaces
{
    public interface IEmailContext
    {
        /// <summary> Denotes an invalid (null) SMTP Port. </summary>
        /// This is value is set if the user does not supply an SMTP port number.
        public const int InvalidPort = -1;

        string? SmtpServer { get; }
        int SmtpPort { get; }
        string? SmtpUsername { get; }
        string? SmtpPassword { get; }
        string? SmtpAddress { get; }
        string? SmtpFrom { get; }
    }
}
