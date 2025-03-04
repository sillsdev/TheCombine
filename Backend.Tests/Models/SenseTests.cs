using System.Collections.Generic;
using System.Linq;
using BackendFramework.Models;
using NUnit.Framework;

namespace Backend.Tests.Models
{
    public class SenseTests
    {
        [Test]
        public void TestClone()
        {
            var sense = new Sense
            {
                Accessibility = Status.Deleted,
                Definitions = [new() { Language = "definition-lang", Text = "definition-text" }],
                Glosses = [new() { Def = "gloss-def", Language = "gloss-lang" }],
                GrammaticalInfo = new() { CatGroup = GramCatGroup.Noun },
                ProtectReasons = [new() { Count = 1, Type = ReasonType.Field }],
                SemanticDomains = [new() { Id = "9.8.7.6.5.4.3.2.1.0", Name = "Blastoff!" }]
            };
            Util.AssertDeepClone(sense, sense.Clone(), true);
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
        public void TestCloneAndContentEquals()
        {
            var definition = new Definition { Language = Language, Text = Text };
            Assert.That(definition.ContentEquals(definition.Clone()), Is.True);
            Util.AssertDeepClone(definition, definition.Clone(), true);
        }
    }

    public class GlossTests
    {
        private const string Language = "fr";
        private const string Def = "def";

        [Test]
        public void TestCloneAndContentEquals()
        {
            var gloss = new Gloss { Def = Def, Language = Language };
            Assert.That(gloss.ContentEquals(gloss.Clone()), Is.True);
            Util.AssertDeepClone(gloss, gloss.Clone(), true);
        }
    }

    public class GrammaticalInfoTests
    {
        private const GramCatGroup CatGroup = GramCatGroup.Other;
        private const string GrammaticalCategory = "abcdefg";

        [Test]
        public void TestCloneAndContentEquals()
        {
            var gramInfo = new GrammaticalInfo { CatGroup = CatGroup, GrammaticalCategory = GrammaticalCategory };
            Assert.That(gramInfo.ContentEquals(gramInfo.Clone()), Is.True);
            Util.AssertDeepClone(gramInfo, gramInfo.Clone(), true);
        }
    }
}
