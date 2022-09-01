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

    public class SemanticDomainTreeNodeTests
    {
        [Test]
        public void TestEquals()
        {
            var node = new SemanticDomain { Name = "name", Id = "0.0" };
            var treeNode = new SemanticDomainTreeNode { Node = node };
            Assert.That(treeNode.Equals(new SemanticDomainTreeNode { Node = node }));
        }

        [Test]
        public void TestEqualsNull()
        {
            var treeNode = new SemanticDomainTreeNode();
            Assert.IsFalse(treeNode.Equals(null));
        }

        [Test]
        public void TestHashCode()
        {
            var node1 = new SemanticDomain { Name = "name1", Id = "0.1" };
            var node2 = new SemanticDomain { Name = "name2", Id = "0.2" };

            Assert.AreNotEqual(
                new SemanticDomainTreeNode { Node = node1 }.GetHashCode(),
                new SemanticDomainTreeNode { Node = node2 }.GetHashCode()
            );
            Assert.AreNotEqual(
                new SemanticDomainTreeNode { Parent = node1 }.GetHashCode(),
                new SemanticDomainTreeNode { Parent = node2 }.GetHashCode()
            );
            Assert.AreNotEqual(
                new SemanticDomainTreeNode { Previous = node1 }.GetHashCode(),
                new SemanticDomainTreeNode { Previous = node2 }.GetHashCode()
            );
            Assert.AreNotEqual(
                new SemanticDomainTreeNode { Next = node1 }.GetHashCode(),
                new SemanticDomainTreeNode { Next = node2 }.GetHashCode()
            );

            var children1 = new List<SemanticDomain> { node1 };
            var children2 = new List<SemanticDomain> { node2 };
            Assert.AreNotEqual(
                new SemanticDomainTreeNode { Children = children1 }.GetHashCode(),
                new SemanticDomainTreeNode { Children = children2 }.GetHashCode()
            );
        }
    }
}
