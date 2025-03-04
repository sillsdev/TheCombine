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

        private sealed class TestClass
        {
            public double NumProp { get; set; }

            public string? StringProp { get; set; }

            public TestClass? SubProp { get; set; }
        }

        [Test]
        public void TestAssertDeepCloneTrue()
        {
            var obj1 = new TestClass { NumProp = 2.2, SubProp = new() { StringProp = "hi" } };
            var obj2 = new TestClass { NumProp = 2.2, SubProp = new() { StringProp = "hi" } };
            Util.AssertDeepClone(obj1, obj2, true);
        }

        [Test]
        public void TestAssertDeepCloneFalseNull()
        {
            var obj = new TestClass { NumProp = 2.2, SubProp = new() { StringProp = "hi" } };
            Util.AssertDeepClone(obj, null, false);
        }

        [Test]
        public void TestAssertDeepCloneFalseShallow()
        {
            var obj1 = new TestClass { NumProp = 2.2, SubProp = new() { SubProp = new() { StringProp = "hi" } } };
            var obj2 = new TestClass { NumProp = 2.2, SubProp = new() { SubProp = new() { StringProp = "bye" } } };
            Util.AssertDeepClone(obj1, obj2, false);
        }
    }
}
