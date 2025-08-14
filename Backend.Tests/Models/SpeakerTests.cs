using BackendFramework.Models;
using NUnit.Framework;

namespace Backend.Tests.Models
{
    internal sealed class SpeakerTests
    {
        private const string Id = "SpeakerTestsId";
        private const string ProjectId = "SpeakerTestsProjectId";
        private const string Name = "Ms. Given Family";

        [Test]
        public void TestClone()
        {
            var speaker = new Speaker { Id = Id, ProjectId = ProjectId, Name = Name, Consent = ConsentType.Audio };
            Assert.That(speaker.Clone(), Is.EqualTo(speaker).UsingPropertiesComparer());
        }
    }
}
