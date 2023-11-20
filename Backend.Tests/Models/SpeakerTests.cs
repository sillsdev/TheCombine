using BackendFramework.Models;
using NUnit.Framework;

namespace Backend.Tests.Models
{
    public class SpeakerTests
    {
        private const string Id = "SpeakerTestsId";
        private const string ProjectId = "SpeakerTestsProjectId";
        private const string Name = "Ms. Given Family";
        private const string FileName = "audio.mp3";

        [Test]
        public void TestClone()
        {
            var speakerA = new Speaker { Id = Id, ProjectId = ProjectId, Name = Name, Consent = ConsentType.Audio };
            Assert.That(speakerA.Equals(speakerA.Clone()), Is.True);
        }

        [Test]
        public void TestEquals()
        {
            var speaker = new Speaker { Name = Name, Consent = ConsentType.Audio };
            Assert.That(speaker.Equals(null), Is.False);
            Assert.That(new Speaker { Id = "diff-id", ProjectId = ProjectId, Name = Name, Consent = ConsentType.Audio }
                .Equals(speaker), Is.False);
            Assert.That(new Speaker { Id = Id, ProjectId = "diff-proj-id", Name = Name, Consent = ConsentType.Audio }
                .Equals(speaker), Is.False);
            Assert.That(new Speaker { Id = Id, ProjectId = ProjectId, Name = "Mr. Diff", Consent = ConsentType.Audio }
                .Equals(speaker), Is.False);
            Assert.That(new Speaker { Id = Id, ProjectId = ProjectId, Name = Name, Consent = ConsentType.Image }
                .Equals(speaker), Is.False);
        }

        [Test]
        public void TestHashCode()
        {
            var code = new Speaker { Name = Name, Consent = ConsentType.Audio }.GetHashCode();
            Assert.That(new Speaker { Id = "diff-id", ProjectId = ProjectId, Name = Name, Consent = ConsentType.Audio }
                .GetHashCode(), Is.Not.EqualTo(code));
            Assert.That(new Speaker { Id = Id, ProjectId = "diff-proj-id", Name = Name, Consent = ConsentType.Audio }
                .GetHashCode(), Is.Not.EqualTo(code));
            Assert.That(new Speaker { Id = Id, ProjectId = ProjectId, Name = "Mr. Diff", Consent = ConsentType.Audio }
                .GetHashCode(), Is.Not.EqualTo(code));
            Assert.That(new Speaker { Id = Id, ProjectId = ProjectId, Name = Name, Consent = ConsentType.Image }
                .GetHashCode(), Is.Not.EqualTo(code));
        }
    }
}
