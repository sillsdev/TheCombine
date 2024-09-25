// using System.Drawing;
// using System.Net.Http;
// using System.Runtime;
// using System.Threading.Tasks;
// using BackendFramework.Otel;
// using Grpc.Net.Client.Balancer;
// using Microsoft.AspNetCore.Http;
// using Microsoft.Extensions.Caching.Memory;
// using NUnit.Framework;
// using Org.BouncyCastle.Crypto.Operators;

// namespace Backend.Tests.Otel
// {
//     public class LocationProviderTests
//     {
//         public const string locationGetterUri = "http://ip-api.com/json/";
//         private IHttpContextAccessor? _contextAccessor;
//         private IMemoryCache? _memoryCache;
//         private IHttpClientFactory? _httpClientFactory;
//         private LocationProvider? _locationProvider;
//         public void Setup()
//         {
//             // _contextAccessor = new HttpContextAccessor();
//             _contextAccessor = StringDigitSubstitute.For HttpContextAccessor();
//             _memoryCache = new MemoryCache;
//             _httpClientFactory = httpClientFactory;
//             _locationProvider = new LocationProvider(_contextAccessor, _memoryCache, _httpClientFactory);

//         }

//         [Test]
//         public void TestGetLocation()
//         {
//             var context = new DefaultHttpContext();
//             context.Request.Headers.

//             _contextAccessor.HttpContext.


//         }

//         public void TestGetLocationUsesCache()
//         {

//         }

//         // [Test]
//         // public void TestGetLocationWithCaching()
//         // {
//         //     // create a mock context with a set IP
//         //     var httpContext = new DefaultHttpContext();


//         //     // call GetLocation() 


//         // }

//         // [Test]
//         // public void TestGetLocationFromIp()
//         // {
//         //     var ipAddressWithoutPort = "100.0.0.0";

//         //     // how to set up locationProvider
//         //     var location = _locationProvider.GetLocationFromIp(ipAddressWithoutPort);

//         //     // ideally, would create a locationAPI and check that values match
//         //     // (but that would also then be quite dependent on implementation, 
//         //     // e.g. which fields we are returning)
//         //     Assert.That(location, Is.Not.Null);

//         // }
//     }
// }
