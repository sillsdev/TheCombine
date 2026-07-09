using NUnit.Framework;

namespace Backend.Tests.Repositories
{
    /// <summary>
    /// Starts a single shared MongoDB instance for all repository integration tests.
    /// Fixtures isolate themselves by using distinct database names.
    /// </summary>
    [SetUpFixture]
    public sealed class MongoDbSetUpFixture
    {
        internal static MongoDbTestRunner Runner { get; private set; } = null!;

        [OneTimeSetUp]
        public void StartMongo()
        {
            Runner = MongoDbTestRunner.Start();
        }

        [OneTimeTearDown]
        public void StopMongo()
        {
            Runner?.Dispose();
        }
    }
}
