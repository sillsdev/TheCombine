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
            OtelService.AddOtelTag("test key", "test val");

        }

    }
}
