using System;
using static BackendFramework.Helper.Time;
using NUnit.Framework;

namespace Backend.Tests.Helper
{
    internal sealed class TimeTests
    {
        [Test]
        public void TestToUtcIso8601()
        {
            Assert.That(ToUtcIso8601(new DateTime(2020, 1, 1)), Is.EqualTo("2020-01-01T00:00:00.0000000"));
        }

        [Test]
        public void TestUtcNowIso8601()
        {
            var time = UtcNowIso8601();
            Assert.That(time.Contains('T'), Is.True);
            Assert.That(time.EndsWith('Z'), Is.True);
            Assert.That(DateTime.Now, Is.EqualTo(DateTime.Parse(time)).Within(TimeSpan.FromSeconds(10)));
        }
    }
}
