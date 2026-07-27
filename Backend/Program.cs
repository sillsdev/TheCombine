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

            WebApplication app;
            using (var startupServices = CreateStartupServiceProvider(builder.Services))
            {
                var startup = new Startup(
                    startupServices.GetRequiredService<ILoggerFactory>().CreateLogger<Startup>(),
                    builder.Configuration);
                startup.ConfigureServices(builder.Services);

                app = builder.Build();
                startup.Configure(app, app.Environment, app.Lifetime);
            }

            app.Run();
        }

        /// <summary>
        /// Build a service provider from a copy of <paramref name="services"/>, so that <see cref="Startup"/>'s
        /// bootstrap logger shares the same providers as the app. The caller must dispose the returned provider.
        /// </summary>
        private static ServiceProvider CreateStartupServiceProvider(IServiceCollection services)
        {
            IServiceCollection startupServices = new ServiceCollection();
            foreach (ServiceDescriptor service in services)
            {
                startupServices.Add(service);
            }
            return startupServices.BuildServiceProvider();
        }
    }
}
