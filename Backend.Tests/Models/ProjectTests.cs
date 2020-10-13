using BackendFramework.Models;
using NUnit.Framework;

namespace Backend.Tests.Models
{
    public class ProjectTests
    {
        private const string Name = "Project 1";

        [Test]
        public void TestEquals()
        {

            var project = new Project { Name = Name };
            Assert.That(project.Equals(new Project { Name = Name }));
        }

        [Test]
        public void TestEqualsNull()
        {
            var project = new Project { Name = Name };
            Assert.IsFalse(project.Equals(null));
        }

        [Test]
        public void TestNotEquals()
        {
            var project = new Project { Name = Name };

            var project2 = project.Clone();
            project2.IsActive = !project.IsActive;
            Assert.IsFalse(project.Equals(project2));

            project2 = project.Clone();
            project2.VernacularWritingSystem.Name = "different";
            Assert.IsFalse(project.Equals(project2));

            project2 = project.Clone();
            project2.AutocompleteSetting = 1 - project.AutocompleteSetting;
            Assert.IsFalse(project.Equals(project2));

            project2 = project.Clone();
            project2.SemanticDomains.Add(new SemanticDomain());
            Assert.IsFalse(project.Equals(project2));

            project2 = project.Clone();
            project2.AnalysisWritingSystems.Add(new WritingSystem());
            Assert.IsFalse(project.Equals(project2));

            project2 = project.Clone();
            project.ValidCharacters.Add("a");
            project2.ValidCharacters.Add("b");
            Assert.IsFalse(project.Equals(project2));

            project2 = project.Clone();
            project.RejectedCharacters.Add("a");
            project2.RejectedCharacters.Add("b");
            Assert.IsFalse(project.Equals(project2));

            project2 = project.Clone();
            project2.CustomFields.Add(new CustomField());
            Assert.IsFalse(project.Equals(project2));

            project2 = project.Clone();
            project.WordFields.Add("a");
            project2.WordFields.Add("b");
            Assert.IsFalse(project.Equals(project2));

            project2 = project.Clone();
            project.PartsOfSpeech.Add("a");
            project2.PartsOfSpeech.Add("b");
            Assert.IsFalse(project.Equals(project2));

            project2 = project.Clone();
            project2.InviteTokens.Add(new EmailInvite());
            Assert.IsFalse(project.Equals(project2));
        }
    }

    public class WritingSystemTests
    {
        private const string Name = "System 1";
        private const string Bcp47 = "lang-1";

        [Test]
        public void TestEquals()
        {
            var system = new WritingSystem { Name = Name };
            Assert.That(system.Equals(new WritingSystem { Name = Name }));
        }

        [Test]
        public void TestEqualsNull()
        {
            var system = new WritingSystem { Name = Name };
            Assert.IsFalse(system.Equals(null));
        }

        [Test]
        public void TestNotEquals()
        {
            var system = new WritingSystem { Name = Name, Bcp47 = Bcp47 };
            Assert.IsFalse(system.Equals(new WritingSystem { Name = Name }));
        }

        [Test]
        public void TestToString()
        {
            var system = new WritingSystem { Name = Name, Bcp47 = Bcp47 };
            var systring = system.ToString();
            Assert.IsTrue(systring.Contains(Name) && systring.Contains(Bcp47));
        }
    }
}
