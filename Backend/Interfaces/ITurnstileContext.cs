namespace BackendFramework.Interfaces
{
    public interface ITurnstileContext
    {
        bool TurnstileEnabled { get; }
        string? TurnstileSecretKey { get; }
        string? TurnstileVerifyUrl { get; }
    }
}
