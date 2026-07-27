using System.Diagnostics.CodeAnalysis;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace BackendFramework
{
    [ExcludeFromCodeCoverage]
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            using var startupLoggerFactory = CreateStartupLoggerFactory(builder.Services);
            var startup = new Startup(startupLoggerFactory.CreateLogger<Startup>(), builder.Configuration);
            startup.ConfigureServices(builder.Services);

            var app = builder.Build();
            startup.Configure(app, app.Environment, app.Lifetime);
            app.Run();
        }

        /// <summary>
        /// Build a logger factory from a copy of <paramref name="services"/>, so that <see cref="Startup"/> logs
        /// through the same providers as the app, before the real provider is built.
        /// </summary>
        private static ILoggerFactory CreateStartupLoggerFactory(IServiceCollection services)
        {
            IServiceCollection startupLoggingServices = new ServiceCollection();
            foreach (ServiceDescriptor service in services)
            {
                startupLoggingServices.Add(service);
            }
            return startupLoggingServices.BuildServiceProvider().GetRequiredService<ILoggerFactory>();
        }
    }
}
