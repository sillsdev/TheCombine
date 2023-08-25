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
