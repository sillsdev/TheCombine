using System.Diagnostics;
using BackendFramework.Otel;
using Microsoft.Extensions.DependencyInjection;
using NUnit.Framework;

namespace Backend.Tests.Otel
{
    public class OtelServiceTests
    {
        [Test]
        public static void TestStartActivityWithTag()
        {
            var services = new ServiceCollection();
            OtelService.AddOtelInstrumentation(services);

            AddActivityListener();

            var activity = OtelService.StartActivityWithTag("test key", "test val");
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
                ShouldListenTo = _ => true,
                Sample = (ref ActivityCreationOptions<ActivityContext> _) => ActivitySamplingResult.AllData
            };
            ActivitySource.AddActivityListener(activityListener);
        }
    }
}
