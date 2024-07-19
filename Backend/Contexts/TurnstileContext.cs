using System.Diagnostics.CodeAnalysis;
using BackendFramework.Interfaces;
using Microsoft.Extensions.Options;

namespace BackendFramework.Contexts
{
    [ExcludeFromCodeCoverage]
    public class TurnstileContext : ITurnstileContext
    {
        public bool TurnstileEnabled { get; }
        public string? TurnstileSecretKey { get; }
        public string? TurnstileVerifyUrl { get; }

        public TurnstileContext(IOptions<Startup.Settings> options)
        {
            TurnstileEnabled = options.Value.TurnstileEnabled;
            TurnstileSecretKey = options.Value.TurnstileSecretKey;
            TurnstileVerifyUrl = options.Value.TurnstileVerifyUrl;
        }
    }
}
