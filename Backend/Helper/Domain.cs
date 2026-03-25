using System;

namespace BackendFramework.Helper
{
    public static class Domain
    {
        private static readonly string? _frontendServer =
            Environment.GetEnvironmentVariable("COMBINE_FRONTEND_SERVER_NAME");

        public static readonly string FrontendDomain =
            string.IsNullOrEmpty(_frontendServer) ? "http://localhost:1234" : $"https://{_frontendServer}";
    }
}
