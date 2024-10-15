using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Otel;

namespace Backend.Tests.Mocks
{
    sealed internal class LocationProviderMock : ILocationProvider
    {
        public Task<LocationApi?> GetLocation()
        {
            LocationApi location = new LocationApi
            {
                // note that status is not currently being added as a tag
                Country = "test country",
                RegionName = "test region",
                City = "city"
            };
            return Task.FromResult<LocationApi?>(location);
        }
    }
}
