using System;

namespace BackendFramework.Helper
{
    public static class Domain
    {
        private static readonly string? _frontendServer =
            Environment.GetEnvironmentVariable("COMBINE_FRONTEND_SERVER_NAME");

        public static readonly string FrontendDomain =
            _frontendServer is null ? "http://localhost:3000" : $"https://{_frontendServer}";
    }
}
