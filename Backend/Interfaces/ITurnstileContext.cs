namespace BackendFramework.Interfaces
{
    public interface ITurnstileContext
    {
        string? TurnstileSecretKey { get; }
        string? TurnstileVerifyUrl { get; }
    }
}
