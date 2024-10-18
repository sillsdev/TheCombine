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
            // Arrange
            var services = new ServiceCollection();
            services.AddOpenTelemetryInstrumentation();
            AddActivityListener();

            // Act
            var activity = OtelService.StartActivityWithTag("test key", "test val");
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
                ShouldListenTo = _ => true,
                Sample = (ref ActivityCreationOptions<ActivityContext> _) => ActivitySamplingResult.AllData
            };
            ActivitySource.AddActivityListener(activityListener);
        }
    }
}
