﻿using System;
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
            Assert.That(project.Equals(new Project { Name = Name }), Is.True);
        }

        [Test]
        public void TestEqualsNull()
        {
            var project = new Project { Name = Name };
            Assert.That(project.Equals(null), Is.False);
        }

        [Test]
        public void TestNotEquals()
        {
            var project = new Project { Name = Name };

            var project2 = project.Clone();
            project2.IsActive = !project.IsActive;
            Assert.That(project.Equals(project2), Is.False);

            project2 = project.Clone();
            project2.LiftImported = !project.LiftImported;
            Assert.That(project.Equals(project2), Is.False);

            project2 = project.Clone();
            project2.DefinitionsEnabled = !project.DefinitionsEnabled;
            Assert.That(project.Equals(project2), Is.False);

            project2 = project.Clone();
            project2.GrammaticalInfoEnabled = !project.GrammaticalInfoEnabled;
            Assert.That(project.Equals(project2), Is.False);

            project2 = project.Clone();
            project2.AutocompleteSetting = 1 - project.AutocompleteSetting;
            Assert.That(project.Equals(project2), Is.False);

            project2 = project.Clone();
            project2.SemDomWritingSystem.Bcp47 = "diff";
            Assert.That(project.Equals(project2), Is.False);

            project2 = project.Clone();
            project2.VernacularWritingSystem.Name = "different";
            Assert.That(project.Equals(project2), Is.False);

            project2 = project.Clone();
            project2.AnalysisWritingSystems.Add(new WritingSystem());
            Assert.That(project.Equals(project2), Is.False);

            project2 = project.Clone();
            project2.SemanticDomains.Add(new SemanticDomain());
            Assert.That(project.Equals(project2), Is.False);

            project2 = project.Clone();
            project.ValidCharacters.Add("a");
            project2.ValidCharacters.Add("b");
            Assert.That(project.Equals(project2), Is.False);

            project2 = project.Clone();
            project.RejectedCharacters.Add("a");
            project2.RejectedCharacters.Add("b");
            Assert.That(project.Equals(project2), Is.False);

            project2 = project.Clone();
            project2.CustomFields.Add(new CustomField());
            Assert.That(project.Equals(project2), Is.False);

            project2 = project.Clone();
            project.WordFields.Add("a");
            project2.WordFields.Add("b");
            Assert.That(project.Equals(project2), Is.False);

            project2 = project.Clone();
            project.PartsOfSpeech.Add("a");
            project2.PartsOfSpeech.Add("b");
            Assert.That(project.Equals(project2), Is.False);

            project2 = project.Clone();
            project2.InviteTokens.Add(new EmailInvite());
            Assert.That(project.Equals(project2), Is.False);

            project2 = project.Clone();
            project2.WorkshopSchedule.Add(DateTime.Now);
            Assert.That(project.Equals(project2), Is.False);
        }

        [Test]
        public void TestClone()
        {
            var system = new WritingSystem("en", "WritingSystemName", "calibri");
            var project = new Project { Name = "ProjectName", VernacularWritingSystem = system };
            var domain = new SemanticDomain { Name = "SemanticDomainName", Id = "1" };
            project.SemanticDomains.Add(domain);

            var customField = new CustomField { Name = "CustomFieldName", Type = "type" };
            project.CustomFields.Add(customField);

            var emailInvite = new EmailInvite(10, "user@combine.org", Role.Harvester);
            project.InviteTokens.Add(emailInvite);

            var project2 = project.Clone();
            Assert.That(project, Is.EqualTo(project2));
        }

        [Test]
        public void TestHashCode()
        {
            Assert.That(
                new Project { Name = Name }.GetHashCode(),
                Is.Not.EqualTo(new Project { Name = "Different Name" }.GetHashCode())
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
            Assert.That(field.Equals(new CustomField { Name = Name, Type = Type }), Is.True);
        }

        [Test]
        public void TestEqualsNull()
        {
            var field = new CustomField { Name = Name };
            Assert.That(field.Equals(null), Is.False);
        }

        [Test]
        public void TestNotEquals()
        {
            var field = new CustomField { Name = Name, Type = Type };
            Assert.That(field.Equals(new CustomField { Name = Name, Type = "Other Type" }), Is.False);
            Assert.That(field.Equals(new CustomField { Name = "Other Name", Type = Type }), Is.False);
        }

        [Test]
        public void TestClone()
        {
            var field = new CustomField { Name = Name, Type = Type };
            Assert.That(field, Is.EqualTo(field.Clone()));
        }

        [Test]
        public void TestHashCode()
        {
            Assert.That(
                new CustomField { Name = Name }.GetHashCode(),
                Is.Not.EqualTo(new CustomField { Name = "Different Name" }.GetHashCode())
            );
        }
    }

    public class WritingSystemTests
    {
        private const string Bcp47 = "lang-1";
        private const string Name = "System 1";
        private const string Font = "calibri";

        [Test]
        public void TestEquals()
        {
            var system = new WritingSystem(Bcp47, Name);
            Assert.That(system.Equals(new WritingSystem(Bcp47, Name)), Is.True);
        }

        [Test]
        public void TestEqualsNull()
        {
            var system = new WritingSystem(Bcp47, Name);
            Assert.That(system.Equals(null), Is.False);
        }

        [Test]
        public void TestNotEquals()
        {
            var system = new WritingSystem(Bcp47, Name);
            Assert.That(system.Equals(new WritingSystem(Bcp47)), Is.False);

            system = new WritingSystem(Bcp47, Name, Font);
            Assert.That(system.Equals(new WritingSystem(Bcp47, Name)), Is.False);
        }

        [Test]
        public void TestToString()
        {
            var system = new WritingSystem(Bcp47, Name);
            var sysString = system.ToString();
            Assert.That(sysString.Contains(Name) && sysString.Contains(Bcp47), Is.True);
        }

        [Test]
        public void TestClone()
        {
            var system = new WritingSystem(Bcp47, Name, Font);
            var clonedSystem = system.Clone();
            Assert.That(system, Is.EqualTo(clonedSystem));
        }
    }
}
