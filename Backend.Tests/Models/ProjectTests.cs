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
            project2.LiftImported = !project.LiftImported;
            Assert.IsFalse(project.Equals(project2));

            project2 = project.Clone();
            project2.AutocompleteSetting = 1 - project.AutocompleteSetting;
            Assert.IsFalse(project.Equals(project2));

            project2 = project.Clone();
            project2.SemDomWritingSystem.Bcp47 = "diff";
            Assert.IsFalse(project.Equals(project2));

            project2 = project.Clone();
            project2.VernacularWritingSystem.Name = "different";
            Assert.IsFalse(project.Equals(project2));

            project2 = project.Clone();
            project2.AnalysisWritingSystems.Add(new WritingSystem());
            Assert.IsFalse(project.Equals(project2));

            project2 = project.Clone();
            project2.SemanticDomains.Add(new SemanticDomain());
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

        [Test]
        public void TestClone()
        {
            var system = new WritingSystem { Name = "WritingSystemName", Bcp47 = "en", Font = "calibri" };
            var project = new Project { Name = "ProjectName", VernacularWritingSystem = system };
            var domain = new SemanticDomain { Name = "SemanticDomainName", Id = "1" };
            project.SemanticDomains.Add(domain);

            var customField = new CustomField { Name = "CustomFieldName", Type = "type" };
            project.CustomFields.Add(customField);

            var emailInvite = new EmailInvite(10, "user@combine.org");
            project.InviteTokens.Add(emailInvite);

            var project2 = project.Clone();
            Assert.AreEqual(project, project2);
        }

        [Test]
        public void TestHashCode()
        {
            Assert.AreNotEqual(
                new Project { Name = Name }.GetHashCode(),
                new Project { Name = "Different Name" }.GetHashCode()
            );
        }
    }

    public class CustomFieldTests
    {
        private const string Name = "Name";
        private const string Type = "Type";

        [Test]
        public void TestEquals()
        {
            var field = new CustomField { Name = Name, Type = Type };
            Assert.That(field.Equals(new CustomField { Name = Name, Type = Type }));
        }

        [Test]
        public void TestEqualsNull()
        {
            var field = new CustomField { Name = Name };
            Assert.IsFalse(field.Equals(null));
        }

        [Test]
        public void TestNotEquals()
        {
            var field = new CustomField { Name = Name, Type = Type };
            Assert.IsFalse(field.Equals(new CustomField { Name = Name, Type = "Other Type" }));
            Assert.IsFalse(field.Equals(new CustomField { Name = "Other Name", Type = Type }));
        }

        [Test]
        public void TestClone()
        {
            var field = new CustomField { Name = Name, Type = Type };
            Assert.AreEqual(field, field.Clone());
        }

        [Test]
        public void TestHashCode()
        {
            Assert.AreNotEqual(
                new CustomField { Name = Name }.GetHashCode(),
                new CustomField { Name = "Different Name" }.GetHashCode()
            );
        }
    }

    public class WritingSystemTests
    {
        private const string Name = "System 1";
        private const string Bcp47 = "lang-1";
        private const string Font = "calibri";

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
            var sysString = system.ToString();
            Assert.IsTrue(sysString.Contains(Name) && sysString.Contains(Bcp47));
        }

        [Test]
        public void TestClone()
        {
            var system = new WritingSystem { Name = Name, Bcp47 = Bcp47, Font = Font };
            var clonedSystem = system.Clone();
            Assert.AreEqual(system, clonedSystem);
        }
    }
}
