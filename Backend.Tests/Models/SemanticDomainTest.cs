using System.Collections.Generic;
using BackendFramework.Models;
using NUnit.Framework;

namespace Backend.Tests.Models
{
    public class SemanticDomainTests
    {
        [Test]
        public void TestEquals()
        {
            var domain = new SemanticDomain
            {
                Created = "now",
                Id = "6.5.1.1",
                Lang = "en",
                Name = "House",
                UserId = "myself"
            };
            Util.AssertDeepClone(domain, domain.Clone(), true);
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
        [Test]
        public void TestClone()
        {
            var domain = new SemanticDomainFull
            {
                Description = "Words referring to a house where people live.",
                Id = "6.5.1.1",
                Name = "House",
                Questions = ["What general words refer to a house where people live?"]
            };
            Util.AssertDeepClone(domain, domain.Clone(), true);
        }
    }
}
