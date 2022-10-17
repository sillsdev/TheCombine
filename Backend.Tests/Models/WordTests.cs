using System;
using System.Collections.Generic;
using System.Linq;
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

        [Test]
        public void TestContains()
        {
            var word = Util.RandomWord();
            var diffWord = word.Clone();
            diffWord.Senses.RemoveAt(1);
            Assert.IsTrue(word.Contains(diffWord));
            diffWord.Vernacular = "different";
            Assert.IsFalse(word.Contains(diffWord));
        }

        [Test]
        public void TestAppendContainedWordContents()
        {
            var oldWord = Util.RandomWord();
            var newWord = Util.RandomWord(oldWord.ProjectId);
            newWord.Vernacular = oldWord.Vernacular;

            // Make newWord have a cloned sense of oldWord,
            // but with one new semantic domain added.
            var newSense = oldWord.Senses.First().Clone();
            var newSemDom = Util.RandomSemanticDomain();
            newSense.SemanticDomains.Add(newSemDom);
            newWord.Senses = new List<Sense> { newSense };

            // Clear oldWord's Note, Flag and add some to newWord.
            oldWord.Note = new Note();
            oldWord.Flag = new Flag();
            var newNote = new Note(Vernacular, Text);
            newWord.Note = newNote.Clone();
            var newFlag = new Flag(Text);
            newWord.Flag = newFlag.Clone();

            // Add something to newWord in Audio, EditedBy, History.
            newWord.Audio.Add(Text);
            newWord.EditedBy.Add(Text);
            newWord.History.Add(Text);

            Assert.That(oldWord.AppendContainedWordContents(newWord));

            var updatedSense = oldWord.Senses.Find(s => s.Guid == newSense.Guid);
            Assert.That(updatedSense, Is.Not.Null);
            var updatedDom = updatedSense!.SemanticDomains.Find(dom => dom.Id == newSemDom.Id);
            Assert.That(updatedDom, Is.Not.Null);
            Assert.That(oldWord.Flag.Equals(newFlag));
            Assert.That(oldWord.Note.Equals(newNote));
            Assert.That(oldWord.Audio.Contains(Text));
            Assert.That(oldWord.EditedBy.Contains(Text));
            Assert.That(oldWord.History.Contains(Text));
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
            Assert.That(new Note { Text = "  " }.IsBlank());
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
        private const string Text2 = "Different Text";

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
            Assert.IsFalse(flag.Equals(new Flag { Active = true, Text = Text2 }));
        }

        [Test]
        public void TestHashCode()
        {
            Assert.AreNotEqual(
                new Flag { Text = Text }.GetHashCode(),
                new Flag { Text = Text2 }.GetHashCode());
            Assert.AreNotEqual(
                new Flag { Active = true }.GetHashCode(),
                new Flag { Active = false }.GetHashCode());
        }

        [Test]
        public void TestAppendBlank()
        {
            var flag = new Flag(Text);
            var blankFlag = new Flag(" ");

            var oldFlag = flag.Clone();
            var newFlag = blankFlag.Clone();
            oldFlag.Append(newFlag);
            Assert.That(oldFlag.Equals(flag));

            oldFlag = blankFlag.Clone();
            newFlag = flag.Clone();
            oldFlag.Append(newFlag);
            Assert.That(oldFlag.Equals(flag));
        }

        [Test]
        public void TestAppendNotActive()
        {
            var activeFlag = new Flag(Text);
            var inactiveFlag = new Flag { Text = Text2 };

            var oldFlag = activeFlag.Clone();
            var newFlag = inactiveFlag.Clone();
            oldFlag.Append(newFlag);
            Assert.That(oldFlag.Equals(activeFlag));

            oldFlag = inactiveFlag.Clone();
            newFlag = activeFlag.Clone();
            oldFlag.Append(newFlag);
            Assert.That(oldFlag.Equals(activeFlag));
        }

        [Test]
        public void TestAppendIdentical()
        {
            var flag = new Flag(Text);
            var oldFlag = flag.Clone();
            var newFlag = flag.Clone();
            oldFlag.Append(newFlag);
            Assert.That(oldFlag.Equals(flag));
        }

        [Test]
        public void TestAppendNewText()
        {
            var flag = new Flag(Text);
            var oldFlag = flag.Clone();
            var newFlag = new Flag(Text2);
            oldFlag.Append(newFlag);
            var expectedFlag = flag.Clone();
            expectedFlag.Text += $"; {Text2}";
            Assert.That(oldFlag.Equals(expectedFlag));
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
}
