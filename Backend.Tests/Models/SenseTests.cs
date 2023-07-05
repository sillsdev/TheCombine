using System;
using System.Collections.Generic;
using BackendFramework.Models;
using NUnit.Framework;

namespace Backend.Tests.Models
{
    public class SenseTests
    {
        private const Status Accessibility = Status.Duplicate;

        /// <summary> Words create a unique Guid by default. Use a common GUID to ensure equality in tests. </summary>
        private readonly Guid _commonGuid = Guid.NewGuid();

        [Test]
        public void TestEquals()
        {
            var sense = new Sense { Guid = _commonGuid, Accessibility = Accessibility };
            Assert.That(sense.Equals(new Sense { Guid = _commonGuid, Accessibility = Accessibility }));
        }

        [Test]
        public void TestEqualsNull()
        {
            var sense = new Sense { Accessibility = Accessibility };
            Assert.IsFalse(sense.Equals(null));
        }

        [Test]
        public void TestClone()
        {
            var sense = new Sense { Accessibility = Status.Deleted };
            Assert.AreEqual(sense, sense.Clone());
        }

        [Test]
        public void TestHashCode()
        {
            Assert.AreNotEqual(
                new Sense { Guid = _commonGuid, Accessibility = Status.Active }.GetHashCode(),
                new Sense { Guid = _commonGuid, Accessibility = Status.Deleted }.GetHashCode());
        }

        [Test]
        public void TestIsEmpty()
        {
            var emptyDef = new Definition { Language = "l1" };
            var fullDef = new Definition { Language = "l2", Text = "something" };
            var emptyGloss = new Gloss { Language = "l3" };
            var fullGloss = new Gloss { Language = "l4", Def = "anything" };
            Assert.IsFalse(new Sense { Glosses = new List<Gloss> { emptyGloss, fullGloss } }.IsEmpty());
            Assert.IsFalse(new Sense { Definitions = new List<Definition> { fullDef, emptyDef } }.IsEmpty());
            Assert.IsTrue(new Sense
            {
                Definitions = new List<Definition> { emptyDef },
                Glosses = new List<Gloss> { emptyGloss }
            }.IsEmpty());
        }

        [Test]
        public void TestIsContainedIn()
        {
            var domList = new List<SemanticDomain> { new SemanticDomain { Id = "id" } };
            var glossList = new List<Gloss> { new Gloss { Def = "def" } };
            var defList = new List<Definition> { new Definition { Text = "text" } };
            var domSense = new Sense { SemanticDomains = domList };
            var domGlossSense = new Sense { Glosses = glossList, SemanticDomains = domList };
            var defGlossSense = new Sense { Definitions = defList, Glosses = glossList };
            // For empty senses, semantic domains are checked.
            Assert.IsTrue((new Sense()).IsContainedIn(domSense));
            Assert.IsFalse(domSense.IsContainedIn(new Sense()));
            // For non-empty senses, semantic domains aren't checked.
            Assert.IsTrue(domGlossSense.IsContainedIn(defGlossSense));
            Assert.IsFalse(defGlossSense.IsContainedIn(domGlossSense));
        }
    }

    public class DefinitionTests
    {
        private const string Language = "fr";
        private const string Text = "Test definition text";

        [Test]
        public void TestEquals()
        {
            var definition = new Definition { Language = Language, Text = Text };
            Assert.That(definition.Equals(new Definition { Language = Language, Text = Text }));
        }

        [Test]
        public void TestNotEquals()
        {
            var definition = new Definition { Language = Language, Text = Text };
            Assert.IsFalse(definition.Equals(new Definition { Language = Language, Text = "Different text" }));
            Assert.IsFalse(definition.Equals(new Definition { Language = "Different language", Text = Text }));
        }

        [Test]
        public void TestEqualsNull()
        {
            var definition = new Definition { Language = Language, Text = Text };
            Assert.IsFalse(definition.Equals(null));
        }

        [Test]
        public void TestHashCode()
        {
            var defHash = new Definition { Language = Language, Text = Text }.GetHashCode();
            Assert.AreNotEqual(defHash, new Definition { Language = "DifferentLang", Text = Text }.GetHashCode());
            Assert.AreNotEqual(defHash, new Definition { Language = Language, Text = "DifferentText" }.GetHashCode());
        }
    }

    public class GlossTests
    {
        private const string Language = "fr";
        private const string Def = "def";

        [Test]
        public void TestEquals()
        {
            var gloss = new Gloss { Language = Language, Def = Def };
            Assert.That(gloss.Equals(new Gloss { Language = Language, Def = Def }));
        }

        [Test]
        public void TestEqualsNull()
        {
            var gloss = new Gloss { Language = Language, Def = Def };
            Assert.IsFalse(gloss.Equals(null));
        }

        [Test]
        public void TestHashCode()
        {
            Assert.AreNotEqual(
                new Gloss { Language = "1" }.GetHashCode(),
                new Gloss { Language = "2" }.GetHashCode()
            );
        }
    }

    public class GrammaticalInfoTests
    {
        private const GramCatGroup CatGroup = GramCatGroup.Other;
        private const string GrammaticalCategory = "abcdefg";

        [Test]
        public void TestEquals()
        {
            var gramInfo1 = new GrammaticalInfo { CatGroup = CatGroup, GrammaticalCategory = GrammaticalCategory };
            var gramInfo2 = new GrammaticalInfo { CatGroup = CatGroup, GrammaticalCategory = GrammaticalCategory };
            Assert.That(gramInfo1.Equals(gramInfo2));
        }

        [Test]
        public void TestEqualsNull()
        {
            var gramInfo = new GrammaticalInfo { CatGroup = CatGroup, GrammaticalCategory = GrammaticalCategory };
            Assert.That(gramInfo.Equals(null), Is.False);
        }

        [Test]
        public void TestHashCode()
        {
            Assert.AreNotEqual(new GrammaticalInfo("1").GetHashCode(), new GrammaticalInfo("2").GetHashCode());
            Assert.AreNotEqual(
                new GrammaticalInfo { CatGroup = GramCatGroup.Prenoun }.GetHashCode(),
                new GrammaticalInfo { CatGroup = GramCatGroup.Preverb }.GetHashCode()
            );
        }
    }
}
