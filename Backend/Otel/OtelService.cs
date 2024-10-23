using System.Diagnostics;
using System.Runtime.CompilerServices;

namespace BackendFramework.Otel
{
    public class OtelService
    {
        /// <summary>
        /// Start an Open Telemetry activity and add a tag with given key and value.
        /// To trace a method, call this at the start of the method with `using`, e.g.:
        /// <para>  using var activity = OtelService.StartActivityWithTag("tag key", "value of the tag");</para>
        /// </summary>
        public static Activity? StartActivityWithTag(
            string key, object? value, [CallerMemberName] string activityName = "")
        {
            return new ActivitySource(OtelKernel.SourceName).StartActivity(activityName)?.AddTag(key, value);
        }
    }
}
