using NUnit.Framework;

namespace Backend.Tests
{
    public class UtilTests
    {
        [Test]
        public void TestRandString()
        {
            var randomString = Util.RandString(10);
            Assert.That(char.IsUpper(randomString[0]), Is.True);
            Assert.That(char.IsLower(randomString[1]), Is.True);
            Assert.That(char.IsLower(randomString[2]), Is.True);
            Assert.That(char.IsLower(randomString[3]), Is.True);
            Assert.That(char.IsUpper(randomString[4]), Is.True);
        }
    }
}
