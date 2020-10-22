using BackendFramework.Models;
using NUnit.Framework;

namespace Backend.Tests.Models
{
    public class WordTests
    {
        private const string Vernacular = "fr";
        private const string Text = "Text";

        [Test]
        public void TestEquals()
        {
            var word = new Word { Vernacular = Vernacular };
            Assert.That(word.Equals(new Word { Vernacular = Vernacular }));
        }

        [Test]
        public void TestEqualsNull()
        {
            var word = new Word { Vernacular = Vernacular };
            Assert.IsFalse(word.Equals(null));
        }

        [Test]
        public void TestEqualsNote()
        {
            var word = new Word { Note = new Note { Language = Vernacular, Text = Text } };
            Assert.That(word.Equals(new Word { Note = new Note { Language = Vernacular, Text = Text } }));
        }

        [Test]
        public void TestNotEqualsNote()
        {
            var word = new Word { Note = new Note { Language = Vernacular, Text = "Bad Text" } };
            Assert.IsFalse(word.Equals(new Word { Note = new Note { Language = Vernacular, Text = Text } }));
        }

        [Test]
        public void TestHashCode()
        {
            Assert.AreNotEqual(
                new Word { Vernacular = "1" }.GetHashCode(),
                new Word { Vernacular = "2" }.GetHashCode());
        }
    }

    public class NoteTests
    {
        private const string Language = "fr";
        private const string Text = "Text";

        [Test]
        public void TestEquals()
        {
            var note = new Note { Language = Language };
            Assert.That(note.Equals(new Note { Language = Language }));
        }

        [Test]
        public void TestEqualsNull()
        {
            var note = new Note { Language = Language };
            Assert.IsFalse(note.Equals(null));
        }

        [Test]
        public void TestHashCode()
        {
            Assert.AreNotEqual(
                new Note { Text = "1" }.GetHashCode(),
                new Note { Text = "2" }.GetHashCode());
        }

        [Test]
        public void TestIsBlank()
        {
            Assert.That(new Note().IsBlank());
            Assert.That(new Note { Language = Language }.IsBlank());
            Assert.IsFalse(new Note { Text = Text }.IsBlank());
        }
    }

    public class SenseTests
    {
        private const State Accessibility = State.Active;

        [Test]
        public void TestEquals()
        {
            var sense = new Sense { Accessibility = Accessibility };
            Assert.That(sense.Equals(new Sense { Accessibility = Accessibility }));
        }

        [Test]
        public void TestEqualsNull()
        {
            var sense = new Sense { Accessibility = Accessibility };
            Assert.IsFalse(sense.Equals(null));
        }

        [Test]
        public void TestHashCode()
        {
            Assert.AreNotEqual(
                new Sense { Accessibility = State.Active }.GetHashCode(),
                new Sense { Accessibility = State.Deleted }.GetHashCode());
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
            Assert.AreNotEqual(new Gloss { Language = "1" }.GetHashCode(), new Gloss { Language = "2" });
        }
    }

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
    }
}
