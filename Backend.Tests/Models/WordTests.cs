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
            Assert.That(word.Equals(new Word { Guid = _commonGuid, Vernacular = Vernacular }), Is.True);
        }

        [Test]
        public void TestEqualsNull()
        {
            var word = new Word { Vernacular = Vernacular };
            Assert.That(word.Equals(null), Is.False);
        }

        [Test]
        public void TestEqualsNote()
        {
            var word = new Word { Guid = _commonGuid, Note = new Note { Language = Vernacular, Text = Text } };
            Assert.That(word.Equals(
                new Word { Guid = _commonGuid, Note = new Note { Language = Vernacular, Text = Text } }), Is.True);
        }

        [Test]
        public void TestNotEqualsNote()
        {
            var word = new Word { Guid = _commonGuid, Note = new Note { Language = Vernacular, Text = "Bad Text" } };
            Assert.That(word.Equals(
                new Word { Guid = _commonGuid, Note = new Note { Language = Vernacular, Text = Text } }), Is.False);
        }

        [Test]
        public void TestHashCode()
        {
            var hashCode = new Word { Guid = _commonGuid, Vernacular = "1" }.GetHashCode();
            Assert.That(hashCode, Is.Not.EqualTo(new Word { Guid = _commonGuid, Vernacular = "2" }.GetHashCode()));
            Assert.That(hashCode, Is.Not.EqualTo(
                new Word { Guid = _commonGuid, Vernacular = "1", UsingCitationForm = true }.GetHashCode()));
        }

        [Test]
        public void TestContains()
        {
            var word = Util.RandomWord();
            var diffWord = word.Clone();
            diffWord.Senses.RemoveAt(1);
            Assert.That(word.Contains(diffWord), Is.True);
            diffWord.Vernacular = "different";
            Assert.That(word.Contains(diffWord), Is.False);
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
            newWord.Audio.Add(new Pronunciation(Text));
            newWord.EditedBy.Add(Text);
            newWord.History.Add(Text);

            // Append new content.
            Assert.That(oldWord.AppendContainedWordContents(newWord, "user-id"), Is.True);

            // Confirm content is appended.
            var updatedSense = oldWord.Senses.Find(s => s.Guid == newSense.Guid);
            Assert.That(updatedSense, Is.Not.Null);
            var updatedDom = updatedSense!.SemanticDomains.Find(dom => dom.Id == newSemDom.Id);
            Assert.That(updatedDom, Is.Not.Null);
            Assert.That(oldWord.Flag.Equals(newFlag), Is.True);
            Assert.That(oldWord.Note.Equals(newNote), Is.True);
            Assert.That(oldWord.Audio.Contains(new Pronunciation(Text)), Is.True);
            Assert.That(oldWord.EditedBy.Contains(Text), Is.True);
            Assert.That(oldWord.History.Contains(Text), Is.True);
        }
    }

    public class PronunciationTest
    {
        private const string FileName = "file-name.mp3";
        private const string SpeakerId = "1234567890";

        [Test]
        public void TestNotEquals()
        {
            var pronunciation = new Pronunciation { Protected = false, FileName = FileName, SpeakerId = SpeakerId };
            Assert.That(pronunciation.Equals(
                new Pronunciation { Protected = true, FileName = FileName, SpeakerId = SpeakerId }), Is.False);
            Assert.That(pronunciation.Equals(
                new Pronunciation { Protected = false, FileName = "other-name", SpeakerId = SpeakerId }), Is.False);
            Assert.That(pronunciation.Equals(
                new Pronunciation { Protected = false, FileName = FileName, SpeakerId = "other-id" }), Is.False);
            Assert.That(pronunciation.Equals(null), Is.False);
        }

        [Test]
        public void TestHashCode()
        {
            Assert.That(
                new Pronunciation { FileName = FileName }.GetHashCode(),
                Is.Not.EqualTo(new Pronunciation { FileName = "other-name" }.GetHashCode()));
            Assert.That(
                new Pronunciation { SpeakerId = SpeakerId }.GetHashCode(),
                Is.Not.EqualTo(new Pronunciation { SpeakerId = "other-id" }.GetHashCode()));
            Assert.That(
                new Pronunciation { Protected = true }.GetHashCode(),
                Is.Not.EqualTo(new Pronunciation { Protected = false }.GetHashCode()));
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
            Assert.That(note.Equals(new Note { Language = Language }), Is.True);
        }

        [Test]
        public void TestEqualsNull()
        {
            var note = new Note { Language = Language };
            Assert.That(note.Equals(null), Is.False);
        }

        [Test]
        public void TestNotEquals()
        {
            var note = new Note { Language = Language, Text = Text };
            Assert.That(note.Equals(new Note { Language = "Different language", Text = Text }), Is.False);
        }

        [Test]
        public void TestHashCode()
        {
            Assert.That(
                new Note { Text = "1" }.GetHashCode(),
                Is.Not.EqualTo(new Note { Text = "2" }.GetHashCode()));
        }

        [Test]
        public void TestIsBlank()
        {
            Assert.That(new Note { Text = "  " }.IsBlank(), Is.True);
            Assert.That(new Note { Language = Language }.IsBlank(), Is.True);
            Assert.That(new Note { Text = Text }.IsBlank(), Is.False);
        }

        [Test]
        public void TestAppendBlank()
        {
            var note = new Note(Language, Text);

            var blankNote = new Note();
            var newNote = note.Clone();
            blankNote.Append(newNote);
            Assert.That(blankNote.Equals(note), Is.True);

            blankNote = new Note();
            var oldNote = note.Clone();
            oldNote.Append(blankNote);
            Assert.That(oldNote.Equals(note), Is.True);
        }

        [Test]
        public void TestAppendIdentical()
        {
            var note = new Note(Language, Text);
            var oldNote = note.Clone();
            var newNote = note.Clone();
            oldNote.Append(newNote);
            Assert.That(oldNote.Equals(note), Is.True);
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
            Assert.That(oldNote.Equals(expectedNote), Is.True);
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
            Assert.That(oldNote.Equals(expectedNote), Is.True);
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
            Assert.That(flag.Equals(new Flag { Active = true, Text = Text }), Is.True);
        }

        [Test]
        public void TestEqualsNull()
        {
            var flag = new Flag { Active = true };
            Assert.That(flag.Equals(null), Is.False);
        }

        [Test]
        public void TestNotEquals()
        {
            var flag = new Flag { Active = true, Text = Text };
            Assert.That(flag.Equals(new Flag { Active = false, Text = Text }), Is.False);
            Assert.That(flag.Equals(new Flag { Active = true, Text = Text2 }), Is.False);
        }

        [Test]
        public void TestHashCode()
        {
            Assert.That(
                new Flag { Text = Text }.GetHashCode(),
                Is.Not.EqualTo(new Flag { Text = Text2 }.GetHashCode()));
            Assert.That(
                new Flag { Active = true }.GetHashCode(),
                Is.Not.EqualTo(new Flag { Active = false }.GetHashCode()));
        }

        [Test]
        public void TestAppendBlank()
        {
            var flag = new Flag(Text);
            var blankFlag = new Flag(" ");

            var oldFlag = flag.Clone();
            var newFlag = blankFlag.Clone();
            oldFlag.Append(newFlag);
            Assert.That(oldFlag.Equals(flag), Is.True);

            oldFlag = blankFlag.Clone();
            newFlag = flag.Clone();
            oldFlag.Append(newFlag);
            Assert.That(oldFlag.Equals(flag), Is.True);
        }

        [Test]
        public void TestAppendNotActive()
        {
            var activeFlag = new Flag(Text);
            var inactiveFlag = new Flag { Text = Text2 };

            var oldFlag = activeFlag.Clone();
            var newFlag = inactiveFlag.Clone();
            oldFlag.Append(newFlag);
            Assert.That(oldFlag.Equals(activeFlag), Is.True);

            oldFlag = inactiveFlag.Clone();
            newFlag = activeFlag.Clone();
            oldFlag.Append(newFlag);
            Assert.That(oldFlag.Equals(activeFlag), Is.True);
        }

        [Test]
        public void TestAppendIdentical()
        {
            var flag = new Flag(Text);
            var oldFlag = flag.Clone();
            var newFlag = flag.Clone();
            oldFlag.Append(newFlag);
            Assert.That(oldFlag.Equals(flag), Is.True);
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
            Assert.That(oldFlag.Equals(expectedFlag), Is.True);
        }
    }
}
