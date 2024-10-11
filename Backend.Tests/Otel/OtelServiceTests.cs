// using System.Diagnostics;
using System;
using System.Diagnostics;
using BackendFramework.Otel;
using Microsoft.Extensions.DependencyInjection;
using NUnit.Framework;

namespace Backend.Tests.Otel
{
    public class OtelServiceTests
    {

        // [Test]
        // public static void TestAddOtelTagCoverage()
        // {
        //     var services = new ServiceCollection();
        //     OtelService.AddOtelInstrumentation(services);
        //     OtelService.AddOtelTag("test key", "test val");


        // }


        [Test]
        public static void TestAddOtelTag()
        {
            var services = new ServiceCollection();
            OtelService.AddOtelInstrumentation(services);

            // AddActivityListener();

            var activity = OtelService.AddOtelTag("test key", "test val");
            Console.WriteLine("result was " + activity);
            Assert.That(activity, Is.Not.Null);
            // var activity = new ActivitySource(OtelKernel.SourceName).StartActivity();
            // activity?.AddTag("key", "value");
            // Assert.That(activity, Is.Not.Null);

            // var activity = new Activity("testActivity").Start();
            // activity?.SetTag("test", "testing");
            var tag = activity?.GetTagItem("test key");
            // tags = activity?.Tags;
            // Assert.That(Activity.Current, Is.Not.Null);
            Assert.That(tag, Is.Not.Null);

            var wrongTag = activity?.GetTagItem("wrong key");
            // tags = activity?.Tags;
            // Assert.That(Activity.Current, Is.Not.Null);
            Assert.That(wrongTag, Is.Null);

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

    }
}
