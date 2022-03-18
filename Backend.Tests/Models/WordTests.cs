using System;
using BackendFramework.Models;
using NUnit.Framework;

namespace Backend.Tests.Models
{
    public class WordTests
    {
        private const string Vernacular = "fr";
        private const string Text = "Text";

        /// <summary> Words create a unique Guid by default. Use a common GUID to ensure equality in tests. </summary>
        private readonly Guid _commonGuid = Guid.NewGuid();

        [Test]
        public void TestEquals()
        {
            var word = new Word { Guid = _commonGuid, Vernacular = Vernacular };
            Assert.That(word.Equals(new Word { Guid = _commonGuid, Vernacular = Vernacular }));
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
            var word = new Word { Guid = _commonGuid, Note = new Note { Language = Vernacular, Text = Text } };
            Assert.That(word.Equals(
                new Word { Guid = _commonGuid, Note = new Note { Language = Vernacular, Text = Text } }));
        }

        [Test]
        public void TestNotEqualsNote()
        {
            var word = new Word { Guid = _commonGuid, Note = new Note { Language = Vernacular, Text = "Bad Text" } };
            Assert.IsFalse(word.Equals(
                new Word { Guid = _commonGuid, Note = new Note { Language = Vernacular, Text = Text } }));
        }

        [Test]
        public void TestHashCode()
        {
            Assert.AreNotEqual(
                new Word { Guid = _commonGuid, Vernacular = "1" }.GetHashCode(),
                new Word { Guid = _commonGuid, Vernacular = "2" }.GetHashCode());
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
        public void TestNotEquals()
        {
            var note = new Note { Language = Language, Text = Text };
            Assert.IsFalse(note.Equals(new Note { Language = "Different language", Text = Text }));
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

        [Test]
        public void TestAppendBlank()
        {
            var note = new Note(Language, Text);

            var blankNote = new Note();
            var newNote = note.Clone();
            blankNote.Append(newNote);
            Assert.That(blankNote.Equals(note));

            blankNote = new Note();
            var oldNote = note.Clone();
            oldNote.Append(blankNote);
            Assert.That(oldNote.Equals(note));
        }

        [Test]
        public void TestAppendIdentical()
        {
            var note = new Note(Language, Text);
            var oldNote = note.Clone();
            var newNote = note.Clone();
            oldNote.Append(newNote);
            Assert.That(oldNote.Equals(note));
        }

        [Test]
        public void TestAppendSameLanguage()
        {
            var note = new Note(Language, Text);
            var oldNote = note.Clone();
            var newNote = note.Clone();
            const string newText = "sameLangNewText";
            newNote.Text = newText;
            oldNote.Append(newNote);
            var expectedNote = note.Clone();
            expectedNote.Text += $"; {newText}";
            Assert.That(oldNote.Equals(expectedNote));
        }

        [Test]
        public void TestAppendDiffLanguage()
        {
            var note = new Note(Language, Text);
            var oldNote = note.Clone();
            var newNote = note.Clone();
            const string newLanguage = "diffLang";
            newNote.Language = newLanguage;
            oldNote.Append(newNote);
            var expectedNote = note.Clone();
            expectedNote.Text += $"; [{newLanguage}] {newNote.Text}";
            Assert.That(oldNote.Equals(expectedNote));
        }
    }

    public class SenseTests
    {
        private const State Accessibility = State.Duplicate;

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
            var sense = new Sense { Accessibility = State.Deleted };
            Assert.AreEqual(sense, sense.Clone());
        }

        [Test]
        public void TestHashCode()
        {
            Assert.AreNotEqual(
                new Sense { Guid = _commonGuid, Accessibility = State.Active }.GetHashCode(),
                new Sense { Guid = _commonGuid, Accessibility = State.Deleted }.GetHashCode());
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
            Assert.AreNotEqual(
                new Definition { Language = Language, Text = Text }.GetHashCode(),
                new Definition { Language = "Different Language", Text = Text }.GetHashCode());
            Assert.AreNotEqual(
                new Definition { Language = Language, Text = Text }.GetHashCode(),
                new Definition { Language = Language, Text = "Different text" }.GetHashCode());
        }
    }

    public class FlagTests
    {
        private const string Text = "Text";

        [Test]
        public void TestEquals()
        {
            var flag = new Flag { Active = true, Text = Text };
            Assert.That(flag.Equals(new Flag { Active = true, Text = Text }));
        }

        [Test]
        public void TestEqualsNull()
        {
            var flag = new Flag { Active = true };
            Assert.IsFalse(flag.Equals(null));
        }

        [Test]
        public void TestNotEquals()
        {
            var flag = new Flag { Active = true, Text = Text };
            Assert.IsFalse(flag.Equals(new Flag { Active = false, Text = Text }));
            Assert.IsFalse(flag.Equals(new Flag { Active = true, Text = "Different text" }));
        }

        [Test]
        public void TestHashCode()
        {
            Assert.AreNotEqual(
                new Flag { Text = "1" }.GetHashCode(),
                new Flag { Text = "2" }.GetHashCode());
            Assert.AreNotEqual(
                new Flag { Active = true }.GetHashCode(),
                new Flag { Active = false }.GetHashCode());
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
