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
        private readonly Consent _consent = new() { FileName = FileName, FileType = ConsentType.Audio };

        [Test]
        public void TestClone()
        {
            var speakerA = new Speaker { Id = Id, ProjectId = ProjectId, Name = Name, Consent = _consent };
            Assert.That(speakerA.Equals(speakerA.Clone()), Is.True);
        }

        [Test]
        public void TestEquals()
        {
            var speaker = new Speaker { Name = Name, Consent = _consent };
            Assert.That(speaker.Equals(null), Is.False);
            Assert.That(new Speaker { Id = "diff-id", ProjectId = ProjectId, Name = Name, Consent = _consent }
                .Equals(speaker), Is.False);
            Assert.That(new Speaker { Id = Id, ProjectId = "diff-proj-id", Name = Name, Consent = _consent }
                .Equals(speaker), Is.False);
            Assert.That(new Speaker { Id = Id, ProjectId = ProjectId, Name = "Mr. Different", Consent = _consent }
                .Equals(speaker), Is.False);
            Assert.That(new Speaker { Id = Id, ProjectId = ProjectId, Name = Name, Consent = new() }
                .Equals(speaker), Is.False);
        }

        [Test]
        public void TestHashCode()
        {
            var code = new Speaker { Name = Name, Consent = _consent }.GetHashCode();
            Assert.That(new Speaker { Id = "diff-id", ProjectId = ProjectId, Name = Name, Consent = _consent }
                .GetHashCode(), Is.Not.EqualTo(code));
            Assert.That(new Speaker { Id = Id, ProjectId = "diff-proj-id", Name = Name, Consent = _consent }
                .GetHashCode(), Is.Not.EqualTo(code));
            Assert.That(new Speaker { Id = Id, ProjectId = ProjectId, Name = "Mr. Different", Consent = _consent }
                .GetHashCode(), Is.Not.EqualTo(code));
            Assert.That(new Speaker { Id = Id, ProjectId = ProjectId, Name = Name, Consent = new() }
                .GetHashCode(), Is.Not.EqualTo(code));
        }
    }

    public class ConsentTests
    {
        private const string FileName = "audio.mp3";
        private readonly Consent _consent = new() { FileName = FileName, FileType = ConsentType.Audio };

        [Test]
        public void TestClone()
        {
            Assert.That(_consent.Equals(_consent.Clone()), Is.True);
        }

        [Test]
        public void TestEquals()
        {
            Assert.That(_consent.Equals(null), Is.False);
            Assert.That(new Consent { FileName = "diff", FileType = ConsentType.Audio }.Equals(_consent), Is.False);
            Assert.That(new Consent { FileName = FileName, FileType = ConsentType.Image }.Equals(_consent), Is.False);
        }

        [Test]
        public void TestHashCode()
        {
            var code = _consent.GetHashCode();
            Assert.That(new Consent { FileName = "diff", FileType = ConsentType.Audio }.GetHashCode(), Is.Not.EqualTo(code));
            Assert.That(new Consent { FileName = FileName, FileType = ConsentType.Image }.GetHashCode(), Is.Not.EqualTo(code));
        }
    }
}
