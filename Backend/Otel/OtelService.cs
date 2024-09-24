using System.Diagnostics;

namespace BackendFramework.Otel;

public class OtelService
{
    public static void AddOtelTag(string key, object? value)
    {
        // return new ActivitySource("service");
        // return new ActivitySource(OtelKernel.SourceName);

        using var activity = new ActivitySource(OtelKernel.SourceName).StartActivity();
        activity?.AddTag(key, value);
    }
}
