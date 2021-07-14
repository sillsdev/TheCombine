using NUnit.Framework;

namespace Backend.Tests
{
    public class UtilTests
    {
        [Test]
        public void TestRandString()
        {
            var randomString = Util.RandString(10);
            Assert.That(char.IsUpper(randomString[0]));
            Assert.That(char.IsLower(randomString[1]));
            Assert.That(char.IsLower(randomString[2]));
            Assert.That(char.IsLower(randomString[3]));
            Assert.That(char.IsUpper(randomString[4]));
        }
    }
}
