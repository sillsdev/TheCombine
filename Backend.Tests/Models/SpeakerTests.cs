using BackendFramework.Models;
using NUnit.Framework;

namespace Backend.Tests.Models
{
    public class SpeakerTests
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

        [Test]
        public void TestContentEquals()
        {
            var speaker = new Speaker { Id = Id, ProjectId = ProjectId, Name = Name, Consent = ConsentType.Audio };

            // Id not covered in ContentEquals.
            Assert.That(new Speaker { Id = "diff-id", ProjectId = ProjectId, Name = Name, Consent = ConsentType.Audio }
                .ContentEquals(speaker), Is.True);

            // Everything else covered in ContentEquals.
            Assert.That(new Speaker { Id = Id, ProjectId = "diff-proj-id", Name = Name, Consent = ConsentType.Audio }
                .ContentEquals(speaker), Is.False);
            Assert.That(new Speaker { Id = Id, ProjectId = ProjectId, Name = "Mr. Diff", Consent = ConsentType.Audio }
                .ContentEquals(speaker), Is.False);
            Assert.That(new Speaker { Id = Id, ProjectId = ProjectId, Name = Name, Consent = ConsentType.Image }
                .ContentEquals(speaker), Is.False);
        }
    }
}
