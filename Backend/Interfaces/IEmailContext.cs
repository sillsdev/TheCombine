namespace BackendFramework.Interfaces
{
    public interface IEmailContext
    {
        string SmtpServer { get; }
        int SmtpPort { get; }
        string SmtpUsername { get; }
        string SmtpPassword { get; }
        string SmtpAddress {get; }
    }
}
