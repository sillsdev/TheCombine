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
            Assert.That(domain.Equals(new SemanticDomain { Name = Name }));
        }

        [Test]
        public void TestEqualsNull()
        {
            var domain = new SemanticDomain { Name = Name };
            Assert.IsFalse(domain.Equals(null));
        }

        [Test]
        public void TestHashCode()
        {
            Assert.AreNotEqual(
                new SemanticDomain { Id = "1" }.GetHashCode(),
                new SemanticDomain { Id = "2" }.GetHashCode()
            );

            Assert.AreNotEqual(
                new SemanticDomain { Name = "1" }.GetHashCode(),
                new SemanticDomain { Name = "2" }.GetHashCode()
            );

            Assert.AreNotEqual(
                new SemanticDomain { Guid = Guid.NewGuid().ToString() }.GetHashCode(),
                new SemanticDomain { Name = Guid.NewGuid().ToString() }.GetHashCode()
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
            Assert.That(domain.Equals(new SemanticDomainFull { Name = Name }));
        }

        [Test]
        public void TestEqualsNull()
        {
            var domain = new SemanticDomainFull { Name = Name };
            Assert.IsFalse(domain.Equals(null));
        }

        [Test]
        public void TestHashCode()
        {
            Assert.AreNotEqual(
                new SemanticDomainFull { Id = "1" }.GetHashCode(),
                new SemanticDomainFull { Id = "2" }.GetHashCode()
            );

            Assert.AreNotEqual(
                new SemanticDomainFull { Name = "1" }.GetHashCode(),
                new SemanticDomainFull { Name = "2" }.GetHashCode()
            );

            Assert.AreNotEqual(
                new SemanticDomainFull { Description = "1" }.GetHashCode(),
                new SemanticDomainFull { Description = "2" }.GetHashCode()
            );

            Assert.AreNotEqual(
                new SemanticDomainFull { Questions = new List<string> { "1" } }.GetHashCode(),
                new SemanticDomainFull { Questions = new List<string> { "2" } }.GetHashCode()
            );
        }
    }
}
