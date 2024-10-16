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
            // Arrange
            var services = new ServiceCollection();
            services.AddOpenTelemetryInstrumentation();
            AddActivityListener();

            // Act
            var activity = OtelService.AddOtelTag("test key", "test val");
            var tag = activity?.GetTagItem("test key");
            var wrongTag = activity?.GetTagItem("wrong key");

            // Assert
            Assert.That(activity, Is.Not.Null);
            Assert.That(tag, Is.Not.Null);
            Assert.That(wrongTag, Is.Null);
        }

        private static void AddActivityListener()
        {
            var activityListener = new ActivityListener
            {
                ShouldListenTo = s => true,
                Sample = (ref ActivityCreationOptions<ActivityContext> activityOptions) => ActivitySamplingResult.AllData
            };
            ActivitySource.AddActivityListener(activityListener);
        }
    }
}
