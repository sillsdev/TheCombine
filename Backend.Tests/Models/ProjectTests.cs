using BackendFramework.Models;
using NUnit.Framework;

namespace Backend.Tests.Models
{
    public class ProjectTests
    {
        [Test]
        public void TestClone()
        {
            var project = new Project
            {
                Id = "ProjectId",
                Name = "ProjectName",
                IsActive = true,
                LiftImported = true,
                DefinitionsEnabled = true,
                GrammaticalInfoEnabled = true,
                AutocompleteSetting = OffOnSetting.On,
                ProtectedDataOverrideEnabled = OffOnSetting.Off,
                SemDomWritingSystem = new("fr", "Français"),
                VernacularWritingSystem = new("en", "English", "Calibri"),
                AnalysisWritingSystems = new() { new("es", "Español") },
                SemanticDomains = new() { new() { Name = "SemanticDomainName", Id = "1" } },
                ValidCharacters = new() { "a", "b", "c" },
                RejectedCharacters = new() { "X", "Y", "Z" },
                CustomFields = new() { new() { Name = "CustomFieldName", Type = "type" } },
                WordFields = new() { "some field string" },
                PartsOfSpeech = new() { "noun", "verb" },
                InviteTokens = new() { new(10, "user@combine.org", Role.Harvester) },
                WorkshopSchedule = new() { new(2222, 2, 22), },
            };
            Util.AssertDeepClone(project, project.Clone(), true);
        }
    }

    public class CustomFieldTests
    {
        [Test]
        public void TestClone()
        {
            var field = new CustomField { Name = "Name", Type = "Type" };
            Util.AssertDeepClone(field, field.Clone(), true);
        }
    }

    public class WritingSystemTests
    {
        private const string Bcp47 = "lang-1";
        private const string Name = "System 1";

        [Test]
        public void TestToString()
        {
            var system = new WritingSystem(Bcp47, Name);
            var sysString = system.ToString();
            Assert.That(sysString, Does.Contain(Name));
            Assert.That(sysString, Does.Contain(Bcp47));
            Assert.That(sysString.ToLowerInvariant(), Does.Not.Contain("rtl"));
            system.Rtl = true;
            sysString = system.ToString();
            Assert.That(sysString.ToLowerInvariant(), Does.Contain("rtl"));
        }

        [Test]
        public void TestClone()
        {
            var system = new WritingSystem(Bcp47, Name, "calibri", true);
            Util.AssertDeepClone(system, system.Clone(), true);
        }
    }
}
