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

        [Test]
        public void TestClone()
        {
            var word = new Word
            {
                Id = "id",
                Guid = Guid.NewGuid(),
                Vernacular = "vern",
                Plural = "verns",
                Created = "then",
                Modified = "recently",
                OtherField = "huh?",
                ProjectId = "proj-id",
                Accessibility = Status.Duplicate,
                Audio = [new("sound.wav")],
                EditedBy = ["me"],
                History = ["prev-id"],
                ProtectReasons = [new() { Count = 2 }],
                Senses = [new() { GrammaticalInfo = new() { CatGroup = GramCatGroup.Noun } }],
                Note = new() { Text = "noted" },
                Flag = new() { Text = "flagged" },
            };
            Assert.That(word.Clone(), Is.EqualTo(word).UsingPropertiesComparer());
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
            Assert.That(oldWord.Flag, Is.EqualTo(newFlag).UsingPropertiesComparer());
            Assert.That(oldWord.Note, Is.EqualTo(newNote).UsingPropertiesComparer());
            Assert.That(oldWord.Audio.Any(p => p.FileName.Equals(Text, System.StringComparison.Ordinal)), Is.True);
            Assert.That(oldWord.EditedBy.Contains(Text), Is.True);
            Assert.That(oldWord.History.Contains(Text), Is.True);
        }
    }

    public class PronunciationTests
    {
        [Test]
        public void TestConstructorProtectedIsFalse()
        {
            var pronunciation = new Pronunciation();
            Assert.That(pronunciation.Protected, Is.False);
        }

        [Test]
        public void TestClone()
        {
            var pro = new Pronunciation { FileName = "file.name", Protected = true, SpeakerId = "speaker-id" };
            Assert.That(pro.Clone(), Is.EqualTo(pro).UsingPropertiesComparer());
        }

    }

    public class NoteTests
    {
        private const string Language = "fr";
        private const string Text = "Text";

        [Test]
        public void TestClone()
        {
            var note = new Note { Language = Language, Text = Text };
            Assert.That(note.Clone(), Is.EqualTo(note).UsingPropertiesComparer());
        }

        [Test]
        public void TestContentEquals()
        {
            var note = new Note { Language = Language, Text = Text };
            Assert.That(note.ContentEquals(new() { Language = Language, Text = Text }), Is.True);
            Assert.That(note.ContentEquals(new() { Language = "di-FF", Text = Text }), Is.False);
            Assert.That(note.ContentEquals(new() { Language = Language, Text = "Changed" }), Is.False);
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
            Assert.That(blankNote, Is.EqualTo(note).UsingPropertiesComparer());

            blankNote = new Note();
            var oldNote = note.Clone();
            oldNote.Append(blankNote);
            Assert.That(oldNote, Is.EqualTo(note).UsingPropertiesComparer());
        }

        [Test]
        public void TestAppendIdentical()
        {
            var note = new Note(Language, Text);
            var oldNote = note.Clone();
            var newNote = note.Clone();
            oldNote.Append(newNote);
            Assert.That(oldNote, Is.EqualTo(note).UsingPropertiesComparer());
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
            Assert.That(oldNote, Is.EqualTo(expectedNote).UsingPropertiesComparer());
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
            Assert.That(oldNote, Is.EqualTo(expectedNote).UsingPropertiesComparer());
        }
    }

    public class FlagTests
    {
        private const string Text = "Text";
        private const string Text2 = "Different Text";

        [Test]
        public void TestClone()
        {
            var flag = new Flag { Active = true, Text = Text };
            Assert.That(flag.Clone(), Is.EqualTo(flag).UsingPropertiesComparer());
        }

        [Test]
        public void TestContentEquals()
        {
            var flag = new Flag { Active = true, Text = Text };
            Assert.That(flag.ContentEquals(new() { Active = true, Text = Text }), Is.True);
            Assert.That(flag.ContentEquals(new() { Active = false, Text = Text }), Is.False);
            Assert.That(flag.ContentEquals(new() { Active = true, Text = Text2 }), Is.False);
        }

        [Test]
        public void TestAppendBlank()
        {
            var flag = new Flag(Text);
            var blankFlag = new Flag(" ");

            var oldFlag = flag.Clone();
            var newFlag = blankFlag.Clone();
            oldFlag.Append(newFlag);
            Assert.That(oldFlag, Is.EqualTo(flag).UsingPropertiesComparer());

            oldFlag = blankFlag.Clone();
            newFlag = flag.Clone();
            oldFlag.Append(newFlag);
            Assert.That(oldFlag, Is.EqualTo(flag).UsingPropertiesComparer());
        }

        [Test]
        public void TestAppendNotActive()
        {
            var activeFlag = new Flag(Text);
            var inactiveFlag = new Flag { Text = Text2 };

            var oldFlag = activeFlag.Clone();
            var newFlag = inactiveFlag.Clone();
            oldFlag.Append(newFlag);
            Assert.That(oldFlag, Is.EqualTo(activeFlag).UsingPropertiesComparer());

            oldFlag = inactiveFlag.Clone();
            newFlag = activeFlag.Clone();
            oldFlag.Append(newFlag);
            Assert.That(oldFlag, Is.EqualTo(activeFlag).UsingPropertiesComparer());
        }

        [Test]
        public void TestAppendIdentical()
        {
            var flag = new Flag(Text);
            var oldFlag = flag.Clone();
            var newFlag = flag.Clone();
            oldFlag.Append(newFlag);
            Assert.That(oldFlag, Is.EqualTo(flag).UsingPropertiesComparer());
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
            Assert.That(oldFlag, Is.EqualTo(expectedFlag).UsingPropertiesComparer());
        }
    }
}
