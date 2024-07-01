using System;
using System.Collections.Generic;
using BackendFramework.Models;
using NUnit.Framework;

namespace Backend.Tests.Models
{
    public class SemanticDomainTests
    {
        private const string Name = "Home";

        [Test]
        public void TestEquals()
        {
            var domain = new SemanticDomain { Name = Name };
            Assert.That(domain.Equals(new SemanticDomain { Name = Name }), Is.True);
        }

        [Test]
        public void TestEqualsNull()
        {
            var domain = new SemanticDomain { Name = Name };
            Assert.That(domain.Equals(null), Is.False);
        }

        [Test]
        public void TestHashCode()
        {
            Assert.That(
                new SemanticDomain { Id = "1" }.GetHashCode(),
                Is.Not.EqualTo(new SemanticDomain { Id = "2" }.GetHashCode())
            );

            Assert.That(
                new SemanticDomain { Name = "1" }.GetHashCode(),
                Is.Not.EqualTo(new SemanticDomain { Name = "2" }.GetHashCode())
            );

            Assert.That(
                new SemanticDomain { Guid = Guid.NewGuid().ToString() }.GetHashCode(),
                Is.Not.EqualTo(new SemanticDomain { Name = Guid.NewGuid().ToString() }.GetHashCode())
            );
        }

        private static readonly List<string> _invalidIds = new()
        {
            "",
            "a",
            "123",
            "1.42.9",
            ".1.3.6",
            "9.9.r",
            "1.2.3..4"
        };

        [TestCaseSource(nameof(_invalidIds))]
        public void TestIsValidIdInvalid(string id)
        {
            Assert.That(SemanticDomain.IsValidId(id), Is.False);
            Assert.That(SemanticDomain.IsValidId(id, true), Is.False);
        }

        private static readonly List<string> _validIds = new()
        {
            "6",
            "3.7",
            "1.2.9",
            "9.9.9.1",
        };

        [TestCaseSource(nameof(_validIds))]
        public void TestIsValidIdValid(string id)
        {
            Assert.That(SemanticDomain.IsValidId(id), Is.True);
            Assert.That(SemanticDomain.IsValidId(id, true), Is.True);
        }

        private static readonly List<string> _customIds = new()
        {
            "0",
            "3.0",
            "1.2.0",
            "9.9.9.0",
        };

        [TestCaseSource(nameof(_customIds))]
        public void TestIsValidIdCustom(string id)
        {
            Assert.That(SemanticDomain.IsValidId(id), Is.False);
            Assert.That(SemanticDomain.IsValidId(id, true), Is.True);
        }
    }

    public class SemanticDomainFullTests
    {
        private const string Name = "Home";

        [Test]
        public void TestEquals()
        {
            var domain = new SemanticDomainFull { Name = Name };
            Assert.That(domain.Equals(new SemanticDomainFull { Name = Name }), Is.True);
        }

        [Test]
        public void TestEqualsNull()
        {
            var domain = new SemanticDomainFull { Name = Name };
            Assert.That(domain.Equals(null), Is.False);
        }

        [Test]
        public void TestHashCode()
        {
            Assert.That(
                new SemanticDomainFull { Id = "1" }.GetHashCode(),
                Is.Not.EqualTo(new SemanticDomainFull { Id = "2" }.GetHashCode())
            );

            Assert.That(
                new SemanticDomainFull { Name = "1" }.GetHashCode(),
                Is.Not.EqualTo(new SemanticDomainFull { Name = "2" }.GetHashCode())
            );

            Assert.That(
                new SemanticDomainFull { Description = "1" }.GetHashCode(),
                Is.Not.EqualTo(new SemanticDomainFull { Description = "2" }.GetHashCode())
            );

            Assert.That(
                new SemanticDomainFull { Questions = new List<string> { "1" } }.GetHashCode(),
                Is.Not.EqualTo(new SemanticDomainFull { Questions = new List<string> { "2" } }.GetHashCode())
            );
        }
    }
}
