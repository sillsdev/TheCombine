using System.Linq;
using static BackendFramework.Helper.LiftHelper;
using BackendFramework.Models;
using NUnit.Framework;
using SIL.Lift.Parsing;
using BackendFramework.Helper;

namespace Backend.Tests.Helper
{
    public class LiftHelperTests
    {
        [Test]
        public void EntryUnprotected()
        {
            var entry = new LiftEntry
            {
                CitationForm = new("key", "content"),
                DateCreated = new(),
                DateDeleted = new(),
                DateModified = new(),
                Guid = new(),
                Id = "id",
                LexicalForm = new("key", "content"),
                Order = 1,
            };
            // A single note with empty type is allowed.
            entry.Notes.Add(new("", new("note-key", "note-text")));
            // Another note that's actually a flag is allowed.
            entry.Notes.Add(new("", new("flag-key", $"{FlagNotePrefix}flag-text")));
            entry.Pronunciations.Add(new());
            entry.Pronunciations.Add(new());
            foreach (var pronunciation in entry.Pronunciations)
            {
                pronunciation.Media.Add(new() { Url = "file://path" });
            }
            entry.Senses.Add(new());
            entry.Senses.Add(new());
            // The only entry trait not protected is morph type "stem".
            entry.Traits.Add(new() { Name = TraitNames.MorphType, Value = "stem" });
            entry.Traits.Add(new() { Name = TraitNames.MorphType, Value = "stem" });
            entry.Traits.First().Annotations.Add(new() { Name = "name", Value = "value" });

            Assert.That(IsProtected(entry), Is.False);
            Assert.That(GetProtectedReasons(entry), Is.Empty);
        }

        [Test]
        public void EntryAnnotationsProtected()
        {
            var entry = new LiftEntry();
            entry.Annotations.Add(new());
            entry.Annotations.Add(new());
            Assert.That(IsProtected(entry), Is.True);
            var reasons = GetProtectedReasons(entry);
            Assert.That(reasons, Has.Count.EqualTo(1));
            Assert.That(reasons.First().Type, Is.EqualTo(ReasonType.Annotations));
        }

        [Test]
        public void EntryEtymologiesProtected()
        {
            var entry = new LiftEntry();
            entry.Etymologies.Add(new());
            entry.Etymologies.Add(new());
            Assert.That(IsProtected(entry), Is.True);
            var reasons = GetProtectedReasons(entry);
            Assert.That(reasons, Has.Count.EqualTo(1));
            Assert.That(reasons.First().Type, Is.EqualTo(ReasonType.Etymologies));
        }

        [Test]
        public void EntryFieldProtected()
        {
            var entry = new LiftEntry();
            entry.Fields.Add(new());
            entry.Fields.Add(new());
            Assert.That(IsProtected(entry), Is.True);
            var reasons = GetProtectedReasons(entry);
            Assert.That(reasons, Has.Count.EqualTo(2));
            Assert.That(reasons.First().Type, Is.EqualTo(ReasonType.Field));
            Assert.That(reasons.Last().Type, Is.EqualTo(ReasonType.Field));
        }

        [Test]
        public void EntryNoteTypeProtected()
        {
            var entry = new LiftEntry();
            entry.Notes.Add(new("non-empty-type", new("key", "val")));
            Assert.That(IsProtected(entry), Is.True);
            var reasons = GetProtectedReasons(entry);
            Assert.That(reasons, Has.Count.EqualTo(1));
            Assert.That(reasons.Last().Type, Is.EqualTo(ReasonType.NoteWithType));
        }

        [Test]
        public void EntryNotesProtected()
        {
            var entry = new LiftEntry();
            entry.Notes.Add(new("", new("key1", "val1")));
            entry.Notes.Add(new("", new("key2", "val2")));
            Assert.That(IsProtected(entry), Is.True);
            var reasons = GetProtectedReasons(entry);
            Assert.That(reasons, Has.Count.EqualTo(1));
            Assert.That(reasons.Last().Type, Is.EqualTo(ReasonType.Notes));
        }

        [Test]
        public void EntryPronunciationWithoutUrlProtected()
        {
            var entry = new LiftEntry();
            entry.Pronunciations.Add(new());
            entry.Pronunciations.Add(new());
            Assert.That(IsProtected(entry), Is.True);
            var reasons = GetProtectedReasons(entry);
            Assert.That(reasons, Has.Count.EqualTo(1));
            Assert.That(reasons.Last().Type, Is.EqualTo(ReasonType.PronunciationWithoutUrl));
        }

        [Test]
        public void EntryRelationsProtected()
        {
            var entry = new LiftEntry();
            entry.Relations.Add(new());
            entry.Relations.Add(new());
            Assert.That(IsProtected(entry), Is.True);
            var reasons = GetProtectedReasons(entry);
            Assert.That(reasons, Has.Count.EqualTo(1));
            Assert.That(reasons.Last().Type, Is.EqualTo(ReasonType.Relations));
        }

        [Test]
        public void EntryVariantsProtected()
        {
            var entry = new LiftEntry();
            entry.Variants.Add(new());
            entry.Variants.Add(new());
            Assert.That(IsProtected(entry), Is.True);
            var reasons = GetProtectedReasons(entry);
            Assert.That(reasons, Has.Count.EqualTo(1));
            Assert.That(reasons.Last().Type, Is.EqualTo(ReasonType.Variants));
        }

        [Test]
        public void SenseUnprotected()
        {
            var sense = new LiftSense
            {
                DateCreated = new(),
                DateModified = new(),
                Definition = new("key1", "contentA"),
                Gloss = new("key1", "contentB"),
                GramInfo = new() { Value = "value" },
                Guid = new(),
                Id = "id",
                Order = 1,
            };
            sense.Definition.Add("key2", "contentA");
            sense.Gloss.Add("key3", "contentC");
            // The only sense trait not protected is semantic domain.
            sense.Traits.Add(new() { Name = TraitNames.SemanticDomain, Value = "1" });
            sense.Traits.Add(new() { Name = TraitNames.SemanticDomainDdp4, Value = "1.1" });
            sense.Traits.First().Annotations.Add(new() { Name = "name", Value = "value" });

            Assert.That(IsProtected(sense), Is.False);
            Assert.That(GetProtectedReasons(sense), Is.Empty);
        }

        [Test]
        public void SenseAnnotationsProtected()
        {
            var sense = new LiftSense();
            sense.Annotations.Add(new());
            sense.Annotations.Add(new());
            Assert.That(IsProtected(sense), Is.True);
            var reasons = GetProtectedReasons(sense);
            Assert.That(reasons, Has.Count.EqualTo(1));
            Assert.That(reasons.First().Type, Is.EqualTo(ReasonType.Annotations));
        }

        [Test]
        public void SenseExamplesProtected()
        {
            var sense = new LiftSense();
            sense.Examples.Add(new());
            sense.Examples.Add(new());
            Assert.That(IsProtected(sense), Is.True);
            var reasons = GetProtectedReasons(sense);
            Assert.That(reasons, Has.Count.EqualTo(1));
            Assert.That(reasons.First().Type, Is.EqualTo(ReasonType.Examples));
        }

        [Test]
        public void SenseFieldsProtected()
        {
            var sense = new LiftSense();
            sense.Fields.Add(new());
            sense.Fields.Add(new());
            Assert.That(IsProtected(sense), Is.True);
            var reasons = GetProtectedReasons(sense);
            Assert.That(reasons, Has.Count.EqualTo(2));
            Assert.That(reasons.First().Type, Is.EqualTo(ReasonType.Field));
            Assert.That(reasons.Last().Type, Is.EqualTo(ReasonType.Field));
        }

        [Test]
        public void SenseGramInfoTraitProtected()
        {
            var sense = new LiftSense()
            {
                GramInfo = new()
            };
            sense.GramInfo.Traits.Add(new());
            sense.GramInfo.Traits.Add(new());
            Assert.That(IsProtected(sense), Is.True);
            var reasons = GetProtectedReasons(sense);
            Assert.That(reasons, Has.Count.EqualTo(2));
            Assert.That(reasons.First().Type, Is.EqualTo(ReasonType.GramInfoTrait));
            Assert.That(reasons.Last().Type, Is.EqualTo(ReasonType.GramInfoTrait));
        }

        [Test]
        public void SenseIllustrationsProtected()
        {
            var sense = new LiftSense();
            sense.Illustrations.Add(new());
            sense.Illustrations.Add(new());
            Assert.That(IsProtected(sense), Is.True);
            var reasons = GetProtectedReasons(sense);
            Assert.That(reasons, Has.Count.EqualTo(1));
            Assert.That(reasons.First().Type, Is.EqualTo(ReasonType.Illustrations));
        }

        [Test]
        public void SenseNotesProtected()
        {
            var sense = new LiftSense();
            sense.Notes.Add(new());
            sense.Notes.Add(new());
            Assert.That(IsProtected(sense), Is.True);
            var reasons = GetProtectedReasons(sense);
            Assert.That(reasons, Has.Count.EqualTo(1));
            Assert.That(reasons.First().Type, Is.EqualTo(ReasonType.Notes));
        }

        [Test]
        public void SenseRelationsProtected()
        {
            var sense = new LiftSense();
            sense.Relations.Add(new());
            sense.Relations.Add(new());
            Assert.That(IsProtected(sense), Is.True);
            var reasons = GetProtectedReasons(sense);
            Assert.That(reasons, Has.Count.EqualTo(1));
            Assert.That(reasons.First().Type, Is.EqualTo(ReasonType.Relations));
        }

        [Test]
        public void SenseReversalsProtected()
        {
            var sense = new LiftSense();
            sense.Reversals.Add(new());
            sense.Reversals.Add(new());
            Assert.That(IsProtected(sense), Is.True);
            var reasons = GetProtectedReasons(sense);
            Assert.That(reasons, Has.Count.EqualTo(2));
            Assert.That(reasons.First().Type, Is.EqualTo(ReasonType.Reversals));
            Assert.That(reasons.Last().Type, Is.EqualTo(ReasonType.Reversals));
        }

        [Test]
        public void SenseSubsensesProtected()
        {
            var sense = new LiftSense();
            sense.Subsenses.Add(new());
            sense.Subsenses.Add(new());
            Assert.That(IsProtected(sense), Is.True);
            var reasons = GetProtectedReasons(sense);
            Assert.That(reasons, Has.Count.EqualTo(1));
            Assert.That(reasons.First().Type, Is.EqualTo(ReasonType.Subsenses));
        }
    }
}
