using System.Diagnostics;
using BackendFramework.Otel;
using Microsoft.Extensions.DependencyInjection;
using NUnit.Framework;

namespace Backend.Tests.Otel
{
    public class OtelServiceTests
    {
        [Test]
        public static void TestAddOtelTag()
        {
            var services = new ServiceCollection();
            OtelService.AddOtelInstrumentation(services);

            AddActivityListener();

            var activity = OtelService.AddOtelTag("test key", "test val");
            Assert.That(activity, Is.Not.Null);

            var tag = activity?.GetTagItem("test key");
            Assert.That(tag, Is.Not.Null);

            var wrongTag = activity?.GetTagItem("wrong key");
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
