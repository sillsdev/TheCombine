using System;
using System.Collections.Generic;
using System.Linq;
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
            Assert.That(sense.Equals(new Sense { Guid = _commonGuid, Accessibility = Accessibility }), Is.True);
        }

        [Test]
        public void TestEqualsNull()
        {
            var sense = new Sense { Accessibility = Accessibility };
            Assert.That(sense.Equals(null), Is.False);
        }

        [Test]
        public void TestClone()
        {
            var sense = new Sense { Accessibility = Status.Deleted };
            Assert.That(sense, Is.EqualTo(sense.Clone()));
        }

        [Test]
        public void TestHashCode()
        {
            Assert.That(
                new Sense { Guid = _commonGuid, Accessibility = Status.Active }.GetHashCode(),
                Is.Not.EqualTo(new Sense { Guid = _commonGuid, Accessibility = Status.Deleted }.GetHashCode()));
        }

        [Test]
        public void TestIsEmpty()
        {
            var emptyDef = new Definition { Language = "l1" };
            var fullDef = new Definition { Language = "l2", Text = "something" };
            var emptyGloss = new Gloss { Language = "l3" };
            var fullGloss = new Gloss { Language = "l4", Def = "anything" };
            Assert.That(new Sense { Glosses = new List<Gloss> { emptyGloss, fullGloss } }.IsEmpty(), Is.False);
            Assert.That(new Sense { Definitions = new List<Definition> { fullDef, emptyDef } }.IsEmpty(), Is.False);
            Assert.That(new Sense
            {
                Definitions = new List<Definition> { emptyDef },
                Glosses = new List<Gloss> { emptyGloss }
            }.IsEmpty(), Is.True);
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
            Assert.That(new Sense().IsContainedIn(domSense), Is.True);
            Assert.That(domSense.IsContainedIn(new Sense()), Is.False);
            // For non-empty senses, semantic domains aren't checked.
            Assert.That(domGlossSense.IsContainedIn(defGlossSense), Is.True);
            Assert.That(defGlossSense.IsContainedIn(domGlossSense), Is.False);
        }

        [Test]
        public void TestCopyDomains()
        {
            // Add domains from a new sense, one a duplicate and one new.
            var oldSense = Util.RandomSense();
            var newSense = oldSense.Clone();
            var oldSemDom = Util.RandomSemanticDomain();
            var oldSemDomDup = oldSemDom.Clone();
            oldSemDom.UserId = "id-not-in-dup";
            oldSense.SemanticDomains.Add(oldSemDom);
            newSense.SemanticDomains.Add(oldSemDomDup);
            var newSemDom = Util.RandomSemanticDomain();
            newSense.SemanticDomains.Add(newSemDom);

            var userId = Util.RandString();
            oldSense.CopyDomains(newSense, userId);

            // Ensure the duplicate domain isn't added.
            var oldDom = oldSense.SemanticDomains.FindAll(dom => dom.Id == oldSemDom.Id);
            Assert.That(oldDom.Count, Is.EqualTo(1));
            Assert.That(oldDom.First().UserId, Is.Not.EqualTo(userId));

            // Ensure the new domain is added.
            var newDom = oldSense.SemanticDomains.FindAll(dom => dom.Id == newSemDom.Id);
            Assert.That(newDom.Count, Is.EqualTo(1));
            Assert.That(newDom.First().UserId, Is.EqualTo(userId));
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
            Assert.That(definition.Equals(new Definition { Language = Language, Text = Text }), Is.True);
        }

        [Test]
        public void TestNotEquals()
        {
            var definition = new Definition { Language = Language, Text = Text };
            Assert.That(definition.Equals(new Definition { Language = Language, Text = "Different text" }), Is.False);
            Assert.That(definition.Equals(new Definition { Language = "Different language", Text = Text }), Is.False);
        }

        [Test]
        public void TestEqualsNull()
        {
            var definition = new Definition { Language = Language, Text = Text };
            Assert.That(definition.Equals(null), Is.False);
        }

        [Test]
        public void TestHashCode()
        {
            var defHash = new Definition { Language = Language, Text = Text }.GetHashCode();
            Assert.That(defHash, Is.Not.EqualTo(new Definition { Language = "DifferentLang", Text = Text }.GetHashCode()));
            Assert.That(defHash, Is.Not.EqualTo(new Definition { Language = Language, Text = "DifferentText" }.GetHashCode()));
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
            Assert.That(gloss.Equals(new Gloss { Language = Language, Def = Def }), Is.True);
        }

        [Test]
        public void TestEqualsNull()
        {
            var gloss = new Gloss { Language = Language, Def = Def };
            Assert.That(gloss.Equals(null), Is.False);
        }

        [Test]
        public void TestHashCode()
        {
            Assert.That(
                new Gloss { Language = "1" }.GetHashCode(),
                Is.Not.EqualTo(new Gloss { Language = "2" }.GetHashCode())
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
            Assert.That(gramInfo1.Equals(gramInfo2), Is.True);
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
            Assert.That(new GrammaticalInfo("1").GetHashCode(), Is.Not.EqualTo(new GrammaticalInfo("2").GetHashCode()));
            Assert.That(
                new GrammaticalInfo { CatGroup = GramCatGroup.Prenoun }.GetHashCode(),
                Is.Not.EqualTo(new GrammaticalInfo { CatGroup = GramCatGroup.Preverb }.GetHashCode())
            );
        }
    }
}
