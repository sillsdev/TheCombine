using System;
using System.Linq;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Services;
using NUnit.Framework;
using SIL.DictionaryServices.Model;

namespace Backend.Tests.Services
{
    internal sealed class LiftServiceTests : IDisposable
    {
        private ILiftService _liftService = null!;

        private const string FileName = "file.lift-ranges";
        private const string ExportId = "LiftServiceTestsExportId";
        private const string UserId = "LiftServiceTestsUserId";

        public void Dispose()
        {
            _liftService?.Dispose();
            GC.SuppressFinalize(this);
        }

        [SetUp]
        public void Setup()
        {
            _liftService = new LiftService();
        }

        [Test]
        public void TestExportInProgress()
        {
            Assert.That(_liftService.IsExportInProgress(UserId), Is.False);
            _liftService.SetExportInProgress(UserId, ExportId);
            Assert.That(_liftService.IsExportInProgress(UserId), Is.True);
            _liftService.CancelRecentExport(UserId);
            Assert.That(_liftService.IsExportInProgress(UserId), Is.False);
        }

        [Test]
        public void TestStoreRetrieveDeleteExport()
        {
            Assert.That(_liftService.RetrieveExport(UserId), Is.Null);
            Assert.That(_liftService.DeleteExport(UserId), Is.False);

            _liftService.SetExportInProgress(UserId, ExportId);
            Assert.That(_liftService.RetrieveExport(UserId), Is.Null);
            Assert.That(_liftService.DeleteExport(UserId), Is.True);
            Assert.That(_liftService.DeleteExport(UserId), Is.False);

            _liftService.SetExportInProgress(UserId, ExportId);
            _liftService.StoreExport(UserId, FileName, ExportId);
            Assert.That(_liftService.RetrieveExport(UserId), Is.EqualTo(FileName));
            Assert.That(_liftService.DeleteExport(UserId), Is.True);
            Assert.That(_liftService.RetrieveExport(UserId), Is.Null);
        }

        [Test]
        public void TestStoreOnlyValidExports()
        {
            _liftService.SetExportInProgress(UserId, ExportId);
            _liftService.StoreExport(UserId, FileName, "expiredExportId");
            Assert.That(_liftService.RetrieveExport(UserId), Is.Null);
            _liftService.StoreExport(UserId, FileName, ExportId);
            Assert.That(_liftService.RetrieveExport(UserId), Is.EqualTo(FileName));
        }

        [Test]
        public void TestStoreRetrieveDeleteImport()
        {
            Assert.That(_liftService.RetrieveImport(UserId), Is.Null);
            Assert.That(_liftService.DeleteImport(UserId), Is.False);

            _liftService.StoreImport(UserId, FileName);
            Assert.That(_liftService.RetrieveImport(UserId), Is.EqualTo(FileName));
            Assert.That(_liftService.DeleteImport(UserId), Is.True);
            Assert.That(_liftService.RetrieveImport(UserId), Is.Null);
        }

        [Test]
        public void TestCreateLexEntryWithoutAudio()
        {
            var project = Util.RandomProject();
            var word = Util.RandomWord(project.Id);
            word.Vernacular = "test'vern-with.punct&which;will\tbe\"escaped/later<by*lift writer";
            word.Created = "2020-01-01T00:00:00.000Z";
            word.Modified = "2021-02-03T04:05:06.789Z";
            word.Flag = new("flag text");
            word.Note = new("en", "note text");

            var entry = LiftService.CreateLexEntryWithoutAudio(project, word, []);

            Assert.That(entry.Id, Does.StartWith(word.Vernacular));
            Assert.That(entry.Id, Does.EndWith(word.Guid.ToString()));
            Assert.That(entry.Guid, Is.EqualTo(word.Guid));
            Assert.That(entry.CreationTime, Is.Not.EqualTo(default(DateTime)));
            Assert.That(entry.ModificationTime, Is.Not.EqualTo(default(DateTime)));
            Assert.That(entry.ModifiedTimeIsLocked, Is.True);

            // Check vernacular
            var vernBcp47 = project.VernacularWritingSystem.Bcp47;
            var vernForm = entry.LexicalForm.Find(vernBcp47);
            Assert.That(vernForm, Is.Not.Null);
            Assert.That(vernForm.Form, Is.EqualTo(word.Vernacular));

            // Check note
            Assert.That(entry.Notes, Has.Count.EqualTo(1));
            var noteForms = entry.Notes.First().Forms;
            Assert.That(noteForms, Has.Length.EqualTo(1));
            Assert.That(noteForms.First().Form, Is.EqualTo(word.Note.Text));

            // Check flag
            var flagField = entry.Fields.FirstOrDefault(f => f.Type == LiftHelper.FlagFieldTag);
            Assert.That(flagField, Is.Not.Null);
            Assert.That(flagField.Forms, Has.Length.EqualTo(1));
            Assert.That(flagField.Forms.First().Form, Is.EqualTo(word.Flag.Text));

            // Check senses
            Assert.That(entry.Senses, Has.Count.EqualTo(word.Senses.Count));

            Assert.That(entry.Pronunciations, Is.Empty);
        }

        [Test]
        public void TestCreateLexEntryWithoutAudioCitationForm()
        {
            var project = Util.RandomProject();
            var word = Util.RandomWord(project.Id);
            word.Vernacular = "citation-form-of-entry";
            word.UsingCitationForm = true;

            var entry = LiftService.CreateLexEntryWithoutAudio(project, word, []);

            var vernBcp47 = project.VernacularWritingSystem.Bcp47;
            var citationForm = entry.CitationForm.Find(vernBcp47);
            Assert.That(citationForm, Is.Not.Null);
            Assert.That(citationForm.Form, Is.EqualTo("citation-form-of-entry"));
            Assert.That(entry.LexicalForm.Find(vernBcp47), Is.Null);
        }

        [Test]
        public void TestCreateLexEntryWithoutAudioFlagInactive()
        {
            var project = Util.RandomProject();
            var word = Util.RandomWord(project.Id);
            word.Flag = new() { Active = false, Text = "should not appear" };

            var entry = LiftService.CreateLexEntryWithoutAudio(project, word, []);

            var flagField = entry.Fields.FirstOrDefault(f => f.Type == LiftHelper.FlagFieldTag);
            Assert.That(flagField, Is.Null);
        }

        [Test]
        public void TestCreateLexEntryWithoutAudioFlagTextEmptyFiller()
        {
            var project = Util.RandomProject();
            var word = Util.RandomWord(project.Id);
            word.Flag = new() { Active = true, Text = "   " };

            var entry = LiftService.CreateLexEntryWithoutAudio(project, word, []);

            var flagField = entry.Fields.FirstOrDefault(f => f.Type == LiftHelper.FlagFieldTag);
            Assert.That(flagField, Is.Not.Null);
            Assert.That(flagField.Forms, Has.Length.EqualTo(1));
            Assert.That(flagField.Forms.First().Form, Is.EqualTo("***"));
        }

        [Test]
        public void TestCreateLexEntryWithoutAudioBlankNote()
        {
            var project = Util.RandomProject();
            var word = Util.RandomWord(project.Id);
            word.Note = new();

            var entry = LiftService.CreateLexEntryWithoutAudio(project, word, []);

            Assert.That(entry.Notes, Is.Empty);
        }

        [Test]
        public void TestCreateLexSense()
        {
            var sense = Util.RandomSense();
            sense.Definitions.Add(new() { Language = "fr", Text = "defr" });
            sense.Glosses.AddRange([new() { Language = "en", Def = "gen" }, new() { Language = "es", Def = "ges" }]);
            sense.GrammaticalInfo = new() { CatGroup = GramCatGroup.Noun, GrammaticalCategory = "n" };
            sense.SemanticDomains = [new() { Id = "1", Name = "Universe" }];

            var lexSense = LiftService.CreateLexSense(sense, []);

            Assert.That(lexSense.Id, Is.EqualTo(sense.Guid.ToString()));

            // Check definition
            var frDef = lexSense.Definition.Find("fr");
            Assert.That(frDef, Is.Not.Null);
            Assert.That(frDef.Form, Is.EqualTo("defr"));

            // Check glosses
            var enGloss = lexSense.Gloss.Find("en");
            Assert.That(enGloss, Is.Not.Null);
            Assert.That(enGloss.Form, Is.EqualTo("gen"));
            var esGloss = lexSense.Gloss.Find("es");
            Assert.That(esGloss, Is.Not.Null);
            Assert.That(esGloss.Form, Is.EqualTo("ges"));

            // Check grammatical info
            var hasPos = lexSense.Properties.Any(p => p.Key == LexSense.WellKnownProperties.PartOfSpeech);
            Assert.That(hasPos, Is.True);

            // Check semantic domains
            var semDomProps = lexSense.Properties
                .Where(p => p.Key == LexSense.WellKnownProperties.SemanticDomainDdp4).ToList();
            Assert.That(semDomProps, Has.Count.EqualTo(1));
            Assert.That(semDomProps.First().Value.ToString(), Is.EqualTo("1 Universe"));
        }

        [Test]
        public void TestCreateLexSenseDuplicatesInALanguage()
        {
            var sense = new Sense
            {
                Definitions = [new() { Language = "en", Text = "1st" }, new() { Language = "en", Text = "2nd" }],
                Glosses = [new() { Language = "es", Def = "1o" }, new() { Language = "es", Def = "2o" }]
            };

            var lexSense = LiftService.CreateLexSense(sense, []);

            // Both definitions should be merged with default separator
            var enDef = lexSense.Definition.Find("en");
            Assert.That(enDef, Is.Not.Null);
            Assert.That(enDef.Form, Is.EqualTo("1st;2nd"));
            var esGloss = lexSense.Gloss.Find("es");
            Assert.That(esGloss, Is.Not.Null);
            Assert.That(esGloss.Form, Is.EqualTo("1o;2o"));
        }

        [Test]
        public void TestCreateLexSenseCustomSeparator()
        {
            var sense = new Sense
            {
                Definitions = [new() { Language = "en", Text = "1st" }, new() { Language = "en", Text = "2nd" }]
            };

            var lexSense = LiftService.CreateLexSense(sense, [], separator: " | ");

            var enDef = lexSense.Definition.Find("en");
            Assert.That(enDef, Is.Not.Null);
            Assert.That(enDef.Form, Is.EqualTo("1st | 2nd"));
        }

        [Test]
        public void TestCreateLexSenseNoGrammaticalInfo()
        {
            var sense = new Sense { GrammaticalInfo = new() { CatGroup = GramCatGroup.Unspecified } };

            var lexSense = LiftService.CreateLexSense(sense, []);

            var hasPos = lexSense.Properties.Any(p => p.Key == LexSense.WellKnownProperties.PartOfSpeech);
            Assert.That(hasPos, Is.False);
        }

        [Test]
        public void TestCreateLexSenseSemanticDomainWithoutName()
        {
            var sense = new Sense { SemanticDomains = [new() { Id = "9.9" }] };

            // Semantic domain not in dictionary
            var lexSense = LiftService.CreateLexSense(sense, []);

            var semDomProps = lexSense.Properties
                .Where(p => p.Key == LexSense.WellKnownProperties.SemanticDomainDdp4).ToList();
            Assert.That(semDomProps, Has.Count.EqualTo(1));
            Assert.That(semDomProps.First().Value.ToString(), Is.EqualTo("9.9"));
        }

        [Test]
        public void TestCreateLexSenseSemanticDomainPrefersNameFromDictionary()
        {
            var sense = new Sense { SemanticDomains = [new() { Id = "9.9", Name = "no!" }] };

            // Semantic domain not in dictionary
            var lexSense = LiftService.CreateLexSense(sense, new() { ["9.9"] = "yes!" });

            var semDomProps = lexSense.Properties
                .Where(p => p.Key == LexSense.WellKnownProperties.SemanticDomainDdp4).ToList();
            Assert.That(semDomProps, Has.Count.EqualTo(1));
            Assert.That(semDomProps.First().Value.ToString(), Does.EndWith("yes!"));
        }

        [Test]
        public void TestCreateLexPhoneticNoSpeaker()
        {
            const string audioPath = "path/to/audio.wav";

            var lexPhonetic = LiftService.CreateLexPhonetic(audioPath);

            Assert.That(lexPhonetic.Forms, Has.Length.EqualTo(1));
            var hrefForm = lexPhonetic.Find("href");
            Assert.That(hrefForm, Is.Not.Null);
            Assert.That(hrefForm.Form, Is.EqualTo(audioPath));
        }

        [Test]
        public void TestCreateLexPhoneticWithSpeaker()
        {
            const string audioPath = "path/to/audio.mp3";
            var speaker = new Speaker { Id = "speaker1", Name = "Mr. E", ProjectId = "proj1" };

            var lexPhonetic = LiftService.CreateLexPhonetic(audioPath, speaker);

            Assert.That(lexPhonetic.Forms, Has.Length.EqualTo(2));
            var hrefForm = lexPhonetic.Find("href");
            Assert.That(hrefForm, Is.Not.Null);
            Assert.That(hrefForm.Form, Is.EqualTo(audioPath));
            var speakerForm = lexPhonetic.Find("en");
            Assert.That(speakerForm, Is.Not.Null);
            Assert.That(speakerForm.Form, Is.EqualTo("Speaker: Mr. E"));
        }
    }
}
