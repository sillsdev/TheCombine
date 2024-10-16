using System.Diagnostics;
using System.Runtime.CompilerServices;
using Microsoft.Extensions.DependencyInjection;

namespace BackendFramework.Otel
{
    public class OtelService
    {
        public static Activity? AddOtelTag(string key, object? value, [CallerMemberName] string activityName = "")
        {
            var activitySource = new ActivitySource(OtelKernel.SourceName);
            using var activity = activitySource.StartActivity(activityName);
            activity?.AddTag(key, value);
            return activity;

        }

        public static void AddOtelInstrumentation(IServiceCollection services)
        {
            services.AddOpenTelemetryInstrumentation();
        }
    }
}
