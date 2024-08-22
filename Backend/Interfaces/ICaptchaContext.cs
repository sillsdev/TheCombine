namespace BackendFramework.Interfaces
{
    public interface ICaptchaContext
    {
        bool CaptchaEnabled { get; }
        string? CaptchaSecretKey { get; }
        string? CaptchaVerifyUrl { get; }
    }
}
