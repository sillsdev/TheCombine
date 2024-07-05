
// using System;
using System.Diagnostics;
using System.Diagnostics.Metrics;
// using System.Net.Http;
// using System.Net.Http.Json;
using System.Security.Claims;
// using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
// using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using OpenTelemetry;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

namespace BackendFramework.Otel
{

    public static class OtelKernel
    {

        public const string ServiceName = "Backend-Otel";
        // private readonly LocationCache _locationCache;

        // public OtelKernel(LocationCache locationCache, IServiceCollection serviceCollection)
        // {
        //     _locationCache = locationCache;
        //     AddOpenTelemetryInstrumentation(serviceCollection);
        // }

        public static void AddOpenTelemetryInstrumentation(this IServiceCollection services)
        {
            var appResourceBuilder = ResourceBuilder.CreateDefault().AddService(ServiceName);
            // todo: include version 
            services.AddOpenTelemetry().WithTracing(tracerProviderBuilder => tracerProviderBuilder
                .SetResourceBuilder(appResourceBuilder)
                .AddSource(ServiceName)
                .AddProcessor<LocationEnricher>()
                .AddAspNetCoreInstrumentation(options =>
                {
                    options.RecordException = true;
                    options.EnrichWithHttpRequest = (activity, request) =>
                    {
                        var contentLength = request.Headers.ContentLength;
                        if (contentLength.HasValue)
                        {
                            activity.SetTag("inbound.http.request.body.size", contentLength.Value);
                        }
                        else
                        {
                            activity.SetTag("inbound.http.request.body.size", "no content");
                        }
                        activity.EnrichWithUser(request.HttpContext);
                    };
                    options.EnrichWithHttpResponse = (activity, response) =>
                    {
                        var contentLength = response.Headers.ContentLength;
                        if (contentLength.HasValue)
                        {
                            activity.SetTag("inbound.http.response.body.size", contentLength.Value);
                        }
                        else
                        {
                            activity.SetTag("inbound.http.response.body.size", "no content");
                        }
                        activity.EnrichWithUser(response.HttpContext);
                    };
                })
                .AddHttpClientInstrumentation(options =>
                {
                    options.EnrichWithHttpRequestMessage = (activity, request) =>
                    {
                        var contentLength = request.Content?.Headers.ContentLength;
                        if (contentLength.HasValue)
                        {
                            activity.SetTag("outbound.http.request.body.size", contentLength.Value);
                        }
                        else
                        {
                            activity.SetTag("outbound.http.request.body.size", "no content");
                        }

                        if (request.RequestUri is not null)
                        {
                            activity.SetTag("url.path", request.RequestUri.AbsolutePath);
                            if (!string.IsNullOrEmpty(request.RequestUri.Query))
                                activity.SetTag("url.query", request.RequestUri.Query);
                        }
                        else
                        {
                            activity.SetTag("outbound.http.response.body.size", "no content");
                        }

                        // await GetLocation(activity);
                    };
                    options.EnrichWithHttpResponseMessage = (activity, response) =>
                    {
                        var contentLength = response.Content.Headers.ContentLength;
                        if (contentLength.HasValue)
                        {
                            activity.SetTag("outbound.http.response.body.size", contentLength.Value);
                        }
                    };
                })
                // .AddSource("MongoDB.Driver.Core.Extensions.DiagnosticSources")
                .AddConsoleExporter()
                .AddOtlpExporter()
            );

            // var meter = new Meter(ServiceName);
            // // var counter = meter.CreateCounter<int>("words-created");
            // services.AddOpenTelemetry().WithMetrics(metricProviderBuilder => metricProviderBuilder
            //     .SetResourceBuilder(appResourceBuilder)
            //     .AddMeter(meter.Name)
            //     .AddAspNetCoreInstrumentation()
            //     .AddHttpClientInstrumentation()
            //     .AddConsoleExporter()
            //     .AddOtlpExporter()
            // );

            var meter = new Meter(ServiceName);

        }

        private static void EnrichWithUser(this Activity activity, HttpContext httpContext)
        {
            var claimsPrincipal = httpContext.User;
            // var userId = claimsPrincipal?.FindFirstValue("sub");
            var userId = claimsPrincipal;
            if (userId != null)
            {
                activity.SetTag("app.user.id", userId);
            }
            var userRole = claimsPrincipal?.FindFirstValue("role");
            if (userRole != null)
            {
                activity.SetTag("app.user.role", userRole);
            }
            if (httpContext.RequestAborted.IsCancellationRequested)
            {
                activity.SetTag("http.abort", true);
            }
        }

        private class LocationEnricher(LocationProvider locationProvider) : BaseProcessor<Activity>
        {
            private bool firstTime = true;
            public override async void OnStart(Activity data)
            {
                if (firstTime == true)
                {
                    firstTime = false;

                    LocationApi? response = await locationProvider.GetLocation();

                    // var location = new
                    // {
                    //     Country = response?.country,
                    //     Region = response?.regionName,
                    //     City = response?.city,
                    // };

                    // data?.SetTag("inonstart", "here!");

                    // data?.AddTag("country", location.Country);
                    // data?.AddTag("region", location.Region);
                    // data?.AddTag("city", location.City);
                }

            }

            // private static void Record(Activity data, LocationApi response)
            // {
            //     var location = new
            //     {
            //         Country = response?.country,
            //         Region = response?.regionName,
            //         City = response?.city,
            //     };

            //     data?.AddTag("country", location.Country);
            //     data?.AddTag("region", location.Region);
            //     data?.AddTag("city", location.City);

            // }
        }


    }

}

