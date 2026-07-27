using System.Diagnostics.CodeAnalysis;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Logging;

namespace BackendFramework
{
    [ExcludeFromCodeCoverage]
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            using var startupLoggerFactory = LoggerFactory.Create(logging =>
                logging.AddConfiguration(builder.Configuration.GetSection("Logging")).AddConsole());
            var startup = new Startup(startupLoggerFactory.CreateLogger<Startup>(), builder.Configuration);
            startup.ConfigureServices(builder.Services);

            var app = builder.Build();
            startup.Configure(app, app.Environment, app.Lifetime);
            app.Run();
        }
    }
}
