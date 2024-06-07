
// using System.Reflection.PortableExecutable;
using Microsoft.Extensions.DependencyInjection;
// using OpenTelemetry.Logs;
// using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
// using SIL.WritingSystems;
// using OpenTelemetry.Exporter;


namespace BackendFramework.Otel;

public static class OtelKernel
{

    public const string ServiceName = "TC-Otel";
    public static void AddOpenTelemetryInstrumentation(this IServiceCollection services)
    {


        services.AddOpenTelemetry().WithTracing(builder => builder.AddOtlpExporter()
                                .AddSource(ServiceName)
                                .AddAspNetCoreInstrumentation()
                                .AddOtlpExporter()
                    .ConfigureResource(resource =>
                        resource
                            .AddService(ServiceName))
                    );

    }





}
