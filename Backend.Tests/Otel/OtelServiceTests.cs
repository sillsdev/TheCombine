// using System.Diagnostics;
using BackendFramework.Otel;
using Microsoft.Extensions.DependencyInjection;
using NUnit.Framework;

namespace Backend.Tests.Otel
{
    public class OtelServiceTests
    {

        [Test]
        public static void TestAddOtelTagCoverage()
        {
            var services = new ServiceCollection();
            OtelService.AddOtelInstrumentation(services);
            OtelService.AddOtelTag("test key", "test val");


        }

        // [Test]
        // public static void TestAddOtelTagCoverage()
        // {
        //     var services = new ServiceCollection();
        //     OtelService.AddOtelInstrumentation(services);
        //     Activity? act = OtelService.AddOtelTag("test key", "test val");
        //     Assert.That(act, Is.Not.Null);


        // }


        // [Test]
        // public static void TestAddOtelTag()
        // {
        //     var services = new ServiceCollection();
        //     OtelService.AddOtelInstrumentation(services);
        //     // var activity = OtelService.AddOtelTag("test key", "test val");
        //     var activity = new ActivitySource(OtelKernel.SourceName).StartActivity();
        //     activity?.AddTag("key", "value");
        //     Assert.That(activity, Is.Not.Null);

        //     // var activity = new Activity("testActivity").Start();
        //     // activity?.SetTag("test", "testing");
        //     // var tags = activity?.GetTagItem("test");
        //     // tags = activity?.Tags;
        //     // Assert.That(Activity.Current, Is.Not.Null);
        //     // Assert.That(tags, Is.Not.Null);

        // }

    }
}
