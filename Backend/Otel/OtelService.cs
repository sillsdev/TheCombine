using System.Diagnostics;
using Microsoft.Extensions.DependencyInjection;

namespace BackendFramework.Otel
{
    public class OtelService
    {
        public static Activity? AddOtelTag(string key, object? value)
        {
            var activitySource = new ActivitySource(OtelKernel.SourceName);

            using (var activity = activitySource.StartActivity())
            {
                activity?.AddTag(key, value);
                return activity;
            }
        }

        public static void AddOtelInstrumentation(IServiceCollection services)
        {
            services.AddOpenTelemetryInstrumentation();
        }
    }
}
