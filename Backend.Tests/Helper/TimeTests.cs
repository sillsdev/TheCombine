using System;
using NUnit.Framework;
using BackendFramework.Helper;

namespace Backend.Tests.Helper
{
    public class TimeTests
    {
        [Test]
        public void TestToUtcIso8601()
        {
            Assert.AreEqual(
                Time.ToUtcIso8601(new DateTime(2020, 1, 1)),
                "2020-01-01T00:00:00.0000000"
            );
        }

        [Test]
        public void TestUtcNowIso8601()
        {
            var time = Time.UtcNowIso8601();
            Assert.That(time.Contains("T"));
            Assert.That(time.EndsWith("Z"));
            Assert.That(DateTime.Now, Is.EqualTo(DateTime.Parse(time)).Within(TimeSpan.FromSeconds(10)));
        }
    }
}
