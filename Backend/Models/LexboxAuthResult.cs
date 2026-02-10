namespace BackendFramework.Models
{
    public class LexboxAuthResult
    {
        public LexboxAuthUser? User { get; init; }
        public string? ReturnUrl { get; init; }
    }
}
