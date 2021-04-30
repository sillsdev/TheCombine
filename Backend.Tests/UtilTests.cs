using NUnit.Framework;

namespace Backend.Tests
{
    public class UtilTests
    {
        [Test]
        public void TestRandString()
        {
            var randomString = Util.RandString(10);
            Assert.IsTrue(char.IsUpper(randomString[0]));
            Assert.IsTrue(char.IsLower(randomString[1]));
            Assert.IsTrue(char.IsLower(randomString[2]));
            Assert.IsTrue(char.IsLower(randomString[3]));
            Assert.IsTrue(char.IsUpper(randomString[4]));
        }

    }
}