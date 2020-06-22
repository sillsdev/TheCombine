using BackendFramework.Interfaces;

namespace Backend.Tests
{
    class FrontendContextMock : IFrontendContext
    {
        public string FrontendUrl { get; set; } = "http://localhost:3000";
    }
}
