using System.Diagnostics;
using Microsoft.Extensions.DependencyInjection;

namespace BackendFramework.Otel;

public class OtelService
{
    public static void AddOtelTag(string key, object? value)
    {
        using var activity = new ActivitySource(OtelKernel.SourceName).StartActivity();
        activity?.AddTag(key, value);
    }

    public static void AddOtelInstrumentation(IServiceCollection services)
    {
        services.AddOpenTelemetryInstrumentation();
    }
}