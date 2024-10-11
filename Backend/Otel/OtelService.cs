using System.Diagnostics;
using Microsoft.Extensions.DependencyInjection;

namespace BackendFramework.Otel;

public class OtelService
{
    public static Activity? AddOtelTag(string key, object? value)
    {
        var activitySource = new ActivitySource(OtelKernel.SourceName);

        AddActivityListener();

        using (var activity = activitySource.StartActivity())
        {
            activity?.AddTag(key, value);
            // if (activity is null)
            // {
            //     return "hm";
            // }
            // else
            // {
            //     return activity;
            // };
            return activity;
        }

    }

    private static void AddActivityListener()
    {
        var activityListener = new ActivityListener
        {
            ShouldListenTo = s => true,
            SampleUsingParentId = (ref ActivityCreationOptions<string> activityOptions) => ActivitySamplingResult.AllData,
            Sample = (ref ActivityCreationOptions<ActivityContext> activityOptions) => ActivitySamplingResult.AllData
        };
        ActivitySource.AddActivityListener(activityListener);

    }

    public static void AddOtelInstrumentation(IServiceCollection services)
    {
        services.AddOpenTelemetryInstrumentation();
    }

}
