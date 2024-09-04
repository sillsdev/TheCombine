using System.Diagnostics;

namespace BackendFramework.Otel;

public class BackendActivitySource
{
    public static ActivitySource Get()
    {
        return new ActivitySource("service");
    }
}
