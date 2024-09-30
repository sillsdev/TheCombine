// using System.Net.Http;

using System;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Amazon.Runtime;


// using Microsoft.AspNetCore.Http;
// using Microsoft.AspNetCore.Http.Features;
using Moq;
using Moq.Protected;
using NUnit.Framework;

namespace Backend.Tests.Mocks
{

    internal class HttpClientFactoryMock : IHttpClientFactory
    {

        private Mock<HttpMessageHandler> _handlerMock = null!;

        // public HttpClientFactoryMock()
        // {

        // }

        [SetUp]
        public void Setup()
        {
            _handlerMock = new Mock<HttpMessageHandler>();
            HttpResponseMessage result = new HttpResponseMessage();

            _handlerMock.Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>()
            )
            .Returns(Task.FromResult(result))
            .Verifiable()
            ;

        }

        public HttpClient CreateClient(string? serviceName)
        {
            var httpClient = new HttpClient(_handlerMock.Object)
            {
                BaseAddress = new Uri("https://abc.mockwebsite.xyz/")
            };
            return httpClient;

        }

        public static void Verify(HttpClientFactory client, Func<HttpRequestMessage, bool> match)
        {
            _handlerMock.Protected().Verify(
                "SendAsync",
                Times.Exactly(1),
                ItExpr.Is<HttpRequestMessage>(req => match(req)),
                ItExpr.IsAny<CancellationToken>()
            );

        }


    }
}
