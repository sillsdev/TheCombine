using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Security;
using System.Threading.Tasks;
using System.Xml;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using MongoDB.Bson;
using SIL.DictionaryServices.Lift;
using SIL.DictionaryServices.Model;
using SIL.Lift;
using SIL.Lift.Options;
using SIL.Lift.Parsing;
using SIL.Text;
using SIL.WritingSystems;
using Xabe.FFmpeg;
using static System.Text.NormalizationForm;
using static SIL.DictionaryServices.Lift.LiftWriter;

namespace BackendFramework.Services
{
    /// <summary> Extension of <see cref="LiftWriter"/> to add audio pronunciation </summary>
    public class CombineLiftWriter : LiftWriter
    {
        public CombineLiftWriter(string path, ByteOrderStyle byteOrderStyle) : base(path, byteOrderStyle) { }

        /// <summary> Overrides empty function from the base SIL LiftWriter to properly add pronunciation </summary>
        protected override void InsertPronunciationIfNeeded(
            LexEntry entry, List<string> propertiesAlreadyOutput)
        {
            if (entry.Pronunciations.Count != 0 && entry.Pronunciations.First().Forms.Length != 0)
            {
                foreach (var phonetic in entry.Pronunciations)
                {
                    Writer.WriteStartElement("pronunciation");
                    Writer.WriteStartElement("media");
                    var forms = new List<LanguageForm>(phonetic.Forms);
                    var href = forms.Find(f => f.WritingSystemId == "href");
                    if (href is null)
                    {
                        continue;
                    }
                    Writer.WriteAttributeString("href", Path.GetFileName(href.Form));
                    // If there is speaker info, it was added as an "en" MultiText
                    var label = forms.Find(f => f.WritingSystemId == "en");
                    if (label is not null)
                    {
                        Writer.WriteStartElement("label");
                        Writer.WriteStartElement("form");
                        Writer.WriteAttributeString("lang", label.WritingSystemId);
                        Writer.WriteElementString("text", label.Form);
                        Writer.WriteEndElement();
                        Writer.WriteEndElement();
                    }

                    Writer.WriteEndElement();
                    Writer.WriteEndElement();
                }

                // Make sure the writer does not write it again in the wrong format.
                entry.Pronunciations.Clear();
            }
        }

#pragma warning disable CA1816, CA2215
        public override void Dispose()
        {
            // TODO: When updating the LiftWriter dependency, check to see if its Dispose() implementation
            //    has been fixed properly to avoid needing to override its Dispose method.
            //    https://github.com/sillsdev/libpalaso/blob/master/SIL.DictionaryServices/Lift/LiftWriter.cs
            //    Also, re-evaluate our CA1816 violation.
            Dispose(true);
        }

        protected override void Dispose(bool disposing)
        {
            if (Disposed)
            {
                return;
            }

            if (disposing)
            {
                Writer?.Close();
                Writer?.Dispose();
            }

            Disposed = true;

            // Generally, the base class Dispose method would be called here (CA2215), but it accesses _writer,
            // and we are disposing of that ourselves in the child class to fix a memory leak.
        }
#pragma warning restore CA1816, CA2215
    }

    public sealed class MissingProjectException : Exception
    {
        public MissingProjectException(string message) : base(message) { }
    }

    public class LiftService : ILiftService
    {
        private readonly ISemanticDomainRepository _semDomRepo;
        private readonly ISpeakerRepository _speakerRepo;

        /// A dictionary shared by all Projects for storing and retrieving paths to exported projects.
        private readonly Dictionary<string, string> _liftExports;
        /// A dictionary shared by all Projects for storing and retrieving paths to in-process imports.
        private readonly Dictionary<string, string> _liftImports;
        internal const string FlagTextEmpty = "***";
        private const string InProgress = "IN_PROGRESS";

        public LiftService(ISemanticDomainRepository semDomRepo, ISpeakerRepository speakerRepo)
        {
            _semDomRepo = semDomRepo;
            _speakerRepo = speakerRepo;

            if (!Sldr.IsInitialized)
            {
                Sldr.Initialize(true);
            }

            _liftExports = new Dictionary<string, string>();
            _liftImports = new Dictionary<string, string>();
        }

        /// <summary> Store status that a user's export is in-progress. </summary>
        public void SetExportInProgress(string userId, bool isInProgress)
        {
            _liftExports.Remove(userId);
            if (isInProgress)
            {
                _liftExports.Add(userId, InProgress);
            }
        }

        /// <summary> Query whether user has an in-progress export. </summary>
        public bool IsExportInProgress(string userId)
        {
            _liftExports.TryGetValue(userId, out var exportPath);
            return exportPath == InProgress;
        }

        /// <summary> Store filePath for a user's Lift export. </summary>
        public void StoreExport(string userId, string filePath)
        {
            _liftExports.Remove(userId);
            _liftExports.Add(userId, filePath);
        }

        /// <summary> Retrieve a stored filePath for the user's Lift export. </summary>
        /// <returns> Path to the Lift file on disk. </returns>
        public string? RetrieveExport(string userId)
        {
            _liftExports.TryGetValue(userId, out var exportPath);
            return exportPath == InProgress ? null : exportPath;
        }

        /// <summary> Delete a stored Lift export path and its file on disk. </summary>
        /// <returns> If the element is successfully found and removed, true; otherwise, false. </returns>
        public bool DeleteExport(string userId)
        {
            var removeSuccessful = _liftExports.Remove(userId, out var filePath);
            if (removeSuccessful && filePath != InProgress && File.Exists(filePath))
            {
                File.Delete(filePath);
            }
            return removeSuccessful;
        }

        /// <summary> Store filePath for a user's Lift import. </summary>
        public void StoreImport(string userId, string filePath)
        {
            _liftImports.Remove(userId);
            _liftImports.Add(userId, filePath);
        }

        /// <summary> Retrieve a stored filePath for the user's Lift import. </summary>
        /// <returns> Path to the Lift file on disk. </returns>
        public string? RetrieveImport(string userId)
        {
            _liftImports.TryGetValue(userId, out var importPath);
            return importPath;
        }

        /// <summary> Delete a stored Lift import path and its file on disk. </summary>
        /// <returns> If the element is successfully found and removed, true; otherwise, false. </returns>
        public bool DeleteImport(string userId)
        {
            var removeSuccessful = _liftImports.Remove(userId, out var dirPath);
            if (removeSuccessful && Directory.Exists(dirPath))
            {
                Directory.Delete(dirPath, true);
            }
            return removeSuccessful;
        }

        /// <summary> Imports main character set for a project from an ldml file. </summary>
        /// <returns> A bool indicating whether a character set was added to the project. </returns>
        public async Task<bool> LdmlImport(string dirPath, IProjectRepository projRepo, Project project)
        {
            if (Directory.GetFiles(dirPath, "*.ldml").Length == 0)
            {
                dirPath = FileStorage.GenerateWritingsSystemsSubdirPath(dirPath);
            }
            var wsr = LdmlInFolderWritingSystemRepository.Initialize(dirPath);

            var wsf = new LdmlInFolderWritingSystemFactory(wsr);
            wsf.Create(project.VernacularWritingSystem.Bcp47, out var wsDef);

            // If there is a main character set, add it to the project
            if (wsDef.CharacterSets.Contains("main"))
            {
                project.ValidCharacters.AddRange(wsDef.CharacterSets["main"].Characters
                    .Where(c => !project.ValidCharacters.Contains(c)));
                project.RejectedCharacters = project.RejectedCharacters
                    .Where(c => !project.ValidCharacters.Contains(c)).ToList();
                await projRepo.Update(project.Id, project);
                return true;
            }
            return false;
        }

        /// <summary> Exports information from a project to a lift package zip </summary>
        /// <exception cref="MissingProjectException"> If Project does not exist. </exception>
        /// <returns> Path to compressed zip file containing export. </returns>
        public async Task<string> LiftExport(
            string projectId, IWordRepository wordRepo, IProjectRepository projRepo)
        {
            // Validate project exists.
            var proj = await projRepo.GetProject(projectId);
            if (proj is null)
            {
                throw new MissingProjectException($"Project does not exist: {projectId}");
            }

            // Generate the zip dir.
            var tempExportDir = FileOperations.GetRandomTempDir();

            var projNameAsPath = Sanitization.MakeFriendlyForPath(proj.Name, "Lift");
            var zipDir = Path.Combine(tempExportDir, projNameAsPath);
            Directory.CreateDirectory(zipDir);

            // Add audio dir, consent dir inside zip dir.
            var audioDir = Path.Combine(zipDir, "audio");
            Directory.CreateDirectory(audioDir);
            var consentDir = Path.Combine(zipDir, "consent");
            Directory.CreateDirectory(consentDir);
            var liftPath = Path.Combine(zipDir, projNameAsPath + ".lift");

            // noBOM will work with PrinceXML.
            using var liftWriter = new CombineLiftWriter(liftPath, ByteOrderStyle.BOM);
            var rangesDest = Path.Combine(zipDir, projNameAsPath + ".lift-ranges");

            // Get every word with all of its information.
            var allWords = await wordRepo.GetAllWords(projectId);
            var frontier = await wordRepo.GetFrontier(projectId);
            var activeWords = frontier.Where(
                x => x.Senses.Any(s => s.Accessibility == Status.Active || s.Accessibility == Status.Protected)).ToList();
            var hasFlags = activeWords.Any(w => w.Flag.Active);

            // Write header of LIFT document.
            var conditionalFlagField = hasFlags
                ? $@"
            <field tag = ""{LiftHelper.FlagFieldTag}"">
                <form lang = ""en""><text></text></form>
                <form lang = ""qaa-x-spec""><text> Class = LexEntry; Type = MultiUnicode; WsSelector = kwsAnals </text></form>
            </field>"
                : "";
            var headerContents =
                $@"
        <ranges>
            <range id = ""semantic-domain-ddp4"" href = ""{rangesDest}""/>
        </ranges>
        <fields>
            <field tag = ""Plural"">
                <form lang = ""en""><text></text></form>
                <form lang = ""qaa-x-spec""><text> Class = LexEntry; Type = String; WsSelector = kwsVern </text></form>
            </field>{conditionalFlagField}
        </fields>
    ";
            liftWriter.WriteHeader(headerContents);

            // Get all project speakers for exporting audio and consents.
            var projSpeakers = await _speakerRepo.GetAllSpeakers(projectId);

            // All words in the frontier with any senses are considered current.
            // The Combine does not import senseless entries and the interface is supposed to prevent creating them.
            // So the words found in allWords with no matching guid in activeWords are exported as 'deleted'.
            var deletedWords = allWords.Where(
                x => activeWords.All(w => w.Guid != x.Guid)).DistinctBy(w => w.Guid).ToList();
            var semDomNames = (await _semDomRepo.GetAllSemanticDomainTreeNodes("en") ?? new())
                .ToDictionary(x => x.Id, x => x.Name);
            foreach (var wordEntry in activeWords)
            {
                var id = MakeSafeXmlAttribute(wordEntry.Vernacular) + "_" + wordEntry.Guid;
                var entry = new LexEntry(id, wordEntry.Guid);
                if (DateTime.TryParse(wordEntry.Created, out var createdTime))
                {
                    entry.CreationTime = createdTime;
                }

                if (DateTime.TryParse(wordEntry.Modified, out var modifiedTime))
                {
                    entry.ModificationTime = modifiedTime;
                }

                // It is VERY IMPORTANT that the LexEntry's ModificationTime be locked, otherwise anytime the entry
                // is modified later (e.g. adding Senses) the ModificationTime of the object will be overwritten with
                // the current time, rather than the modified time stored in the database.
                entry.ModifiedTimeIsLocked = true;

                AddFlag(entry, wordEntry, proj.AnalysisWritingSystems.FirstOrDefault()?.Bcp47 ?? "en");
                AddNote(entry, wordEntry);
                AddVern(entry, wordEntry, proj.VernacularWritingSystem.Bcp47);
                AddSenses(entry, wordEntry, semDomNames);
                await AddAudio(entry, wordEntry.Audio, audioDir, projectId, projSpeakers);

                liftWriter.Add(entry);
            }

            foreach (var wordEntry in deletedWords)
            {
                var id = MakeSafeXmlAttribute(wordEntry.Vernacular) + "_" + wordEntry.Guid;
                var entry = new LexEntry(id, wordEntry.Guid);

                AddNote(entry, wordEntry);
                AddVern(entry, wordEntry, proj.VernacularWritingSystem.Bcp47);
                AddSenses(entry, wordEntry, semDomNames);
                await AddAudio(entry, wordEntry.Audio, audioDir, projectId, projSpeakers);

                liftWriter.AddDeletedEntry(entry);
            }

            liftWriter.End();

            // Add consent files to export directory
            foreach (var speaker in projSpeakers)
            {
                if (speaker.Consent == ConsentType.None)
                {
                    continue;
                }

                var src = FileStorage.GetConsentFilePath(speaker.Id);
                if (src is null || !File.Exists(src))
                {
                    continue;
                }

                var safeName = Sanitization.MakeFriendlyForPath(speaker.Name);
                var fileName = safeName == "" ? Path.GetFileNameWithoutExtension(src) : safeName;
                var fileExt = Path.GetExtension(src);
                var convertToWav = fileExt.Equals(".webm", StringComparison.OrdinalIgnoreCase);
                fileExt = convertToWav ? ".wav" : fileExt;
                var dest = FileOperations.ChangeExtension(Path.Combine(consentDir, fileName), fileExt);

                // Prevent collisions resulting from name sanitization
                var duplicate = 0;
                while (File.Exists(dest))
                {
                    duplicate++;
                    dest = FileOperations.ChangeExtension(Path.Combine(consentDir, $"{fileName}{duplicate}"), fileExt);
                }

                if (convertToWav)
                {
                    await FFmpeg.Conversions.New().Start($"-y -i \"{src}\" \"{dest}\"");
                }
                else
                {
                    File.Copy(src, dest);
                }
            }

            // Export custom semantic domains to lift-ranges
            if (proj.SemanticDomains.Count != 0 || CopyLiftRanges(proj.Id, rangesDest) is null)
            {
                await CreateLiftRanges(proj.SemanticDomains, rangesDest);
            }

            // Export character set to ldml.
            var ldmlDir = FileStorage.GenerateWritingsSystemsSubdirPath(zipDir);
            Directory.CreateDirectory(ldmlDir);
            if (!string.IsNullOrWhiteSpace(proj.VernacularWritingSystem.Bcp47))
            {
                var validChars = proj.ValidCharacters;
                LdmlExport(ldmlDir, proj.VernacularWritingSystem, validChars);
            }

            // Compress everything.
            var destinationFileName = Path.Combine(FileOperations.GetRandomTempDir(),
                $"LiftExportCompressed-{proj.Id}_{DateTime.Now:yyyy-MM-dd_hh-mm-ss}.zip");
            ZipFile.CreateFromDirectory(tempExportDir, destinationFileName);

            // Clean up the temporary folder structure that was compressed.
            Directory.Delete(tempExportDir, true);

            return destinationFileName;
        }

        /// <summary> Copy imported lift-ranges file, if available </summary>
        /// <returns> Path of lift-ranges file copied, or null if none </returns>
        private static string? CopyLiftRanges(string projectId, string rangesDest)
        {
            string? rangesSrc = null;
            var extractedPathToImport = FileStorage.GenerateImportExtractedLocationDirPath(projectId, false);
            if (Directory.Exists(extractedPathToImport))
            {
                rangesSrc = Directory.GetFiles(
                    extractedPathToImport, "*.lift-ranges", SearchOption.AllDirectories).FirstOrDefault();
            }
            if (rangesSrc is not null)
            {
                File.Copy(rangesSrc, rangesDest, true);
            }
            return rangesSrc;
        }

        /// <summary> Export English semantic domains (along with any custom domains) to lift-ranges. </summary>
        public async Task CreateLiftRanges(List<SemanticDomainFull> projDoms, string rangesDest)
        {
            await using var liftRangesWriter = XmlWriter.Create(rangesDest, new XmlWriterSettings
            {
                Indent = true,
                NewLineOnAttributes = true,
                Async = true
            });
            await liftRangesWriter.WriteStartDocumentAsync();
            liftRangesWriter.WriteStartElement("lift-ranges");
            liftRangesWriter.WriteStartElement("range");
            liftRangesWriter.WriteAttributeString("id", "semantic-domain-ddp4");

            var englishDomains = await _semDomRepo.GetAllSemanticDomainTreeNodes("en") ?? new();

            englishDomains.ForEach(sd => { WriteRangeElement(liftRangesWriter, sd.Id, sd.Guid, sd.Name, sd.Lang); });

            // Pull from new semantic domains in project
            foreach (var sd in projDoms)
            {
                var guid = string.IsNullOrEmpty(sd.Guid) || sd.Guid == Guid.Empty.ToString()
                       ? Guid.NewGuid().ToString()
                       : sd.Guid;

                var parent = $"{sd.ParentId} {englishDomains.Find(d => d.Id == sd.ParentId)?.Name}".Trim();
                WriteRangeElement(liftRangesWriter, sd.Id, guid, sd.Name, sd.Lang, sd.Description, parent);
            }

            await liftRangesWriter.WriteEndElementAsync(); //end semantic-domain-ddp4 range
            await liftRangesWriter.WriteEndElementAsync(); //end lift-ranges
            await liftRangesWriter.WriteEndDocumentAsync();

            await liftRangesWriter.FlushAsync();
            liftRangesWriter.Close();
        }

        /// <summary> Adds <see cref="Flag"/> of a word (if it is active) to be written out to lift </summary>
        private static void AddFlag(LexEntry entry, Word wordEntry, string analysisLanguage)
        {
            if (wordEntry.Flag.Active)
            {
                var field = new LexField(LiftHelper.FlagFieldTag);
                var text = wordEntry.Flag.Text.Trim();
                text = string.IsNullOrEmpty(text) ? FlagTextEmpty : text;
                field.Forms = [new LanguageForm(analysisLanguage, text, field)];
                entry.Fields.Add(field);
            }
        }

        /// <summary> Adds <see cref="Note"/> of a word to be written out to lift </summary>
        private static void AddNote(LexEntry entry, Word wordEntry)
        {
            if (!wordEntry.Note.IsBlank())
            {
                // This application only uses "basic" notes, which have no type.
                // To see the implementation of how notes are written to Lift XML:
                //    https://github.com/sillsdev/libpalaso/blob/
                //        cd94d55185bbb65adaac0e2f1b0f1afc30cc8d13/SIL.DictionaryServices/Lift/LiftWriter.cs#L218
                var note = new LexNote();
                var forms = new[]
                {
                    new LanguageForm(wordEntry.Note.Language, wordEntry.Note.Text, note)
                };
                note.Forms = forms;
                entry.Notes.Add(note);
            }
        }

        /// <summary> Adds vernacular of a word to be written out to lift </summary>
        private static void AddVern(LexEntry entry, Word wordEntry, string vernacularBcp47)
        {
            var multiText = MultiTextBase.Create(new() { { vernacularBcp47, wordEntry.Vernacular } });
            if (wordEntry.UsingCitationForm)
            {
                entry.CitationForm.MergeIn(multiText);
            }
            else
            {
                entry.LexicalForm.MergeIn(multiText);
            }
        }

        /// <summary> Adds each <see cref="Sense"/> of a word to be written out to lift </summary>
        private static void AddSenses(LexEntry entry, Word wordEntry, Dictionary<string, string> semDomNames)
        {
            var activeSenses = wordEntry.Senses.Where(
                s => s.Accessibility == Status.Active || s.Accessibility == Status.Protected).ToList();
            foreach (var currentSense in activeSenses)
            {
                // Merge in senses
                const string sep = ";";
                var defDict = new Dictionary<string, string>();
                foreach (var def in currentSense.Definitions)
                {
                    if (defDict.TryGetValue(def.Language, out var defText))
                    {
                        // This is an unexpected situation but rather than crashing or losing data we
                        // will just append extra definitions for the language with a separator.
                        defDict[def.Language] = $"{defText}{sep}{def.Text}";
                    }
                    else
                    {
                        defDict.Add(def.Language, def.Text);
                    }
                }
                var glossDict = new Dictionary<string, string>();
                foreach (var gloss in currentSense.Glosses)
                {
                    if (glossDict.TryGetValue(gloss.Language, out var glossDef))
                    {
                        // This is an unexpected situation but rather than crashing or losing data we
                        // will just append extra definitions for the language with a separator.
                        glossDict[gloss.Language] = $"{glossDef}{sep}{gloss.Def}";
                    }
                    else
                    {
                        glossDict.Add(gloss.Language, gloss.Def);
                    }
                }

                var lexSense = new LexSense();
                lexSense.Definition.MergeIn(MultiTextBase.Create(defDict));
                lexSense.Gloss.MergeIn(MultiTextBase.Create(glossDict));
                lexSense.Id = currentSense.Guid.ToString();

                // Add grammatical info
                if (currentSense.GrammaticalInfo.CatGroup != GramCatGroup.Unspecified)
                {
                    var optionRef = new OptionRef(currentSense.GrammaticalInfo.GrammaticalCategory);
                    lexSense.Properties.Add(new KeyValuePair<string, IPalasoDataObjectProperty>(
                        LexSense.WellKnownProperties.PartOfSpeech, optionRef));
                }

                // Merge in semantic domains
                foreach (var semDom in currentSense.SemanticDomains)
                {
                    var orc = new OptionRefCollection();
                    semDomNames.TryGetValue(semDom.Id, out string? name);
                    orc.Add(semDom.Id + " " + (name ?? semDom.Name));
                    lexSense.Properties.Add(new KeyValuePair<string, IPalasoDataObjectProperty>(
                        LexSense.WellKnownProperties.SemanticDomainDdp4, orc));
                }

                entry.Senses.Add(lexSense);
            }
        }

        /// <summary> Adds pronunciation audio of a word to be written out to lift </summary>
        private static async Task AddAudio(LexEntry entry, List<Pronunciation> pronunciations, string path,
            string projectId, List<Speaker> projectSpeakers)
        {
            foreach (var audio in pronunciations)
            {
                var src = FileStorage.GenerateAudioFilePath(projectId, audio.FileName);
                if (!File.Exists(src))
                {
                    continue;
                }

                var dest = Path.Combine(path, audio.FileName);
                if (Path.GetExtension(dest).Equals(".webm", StringComparison.OrdinalIgnoreCase))
                {
                    dest = Path.ChangeExtension(dest, ".wav");
                    await FFmpeg.Conversions.New().Start($"-y -i \"{src}\" \"{dest}\"");
                }
                else
                {
                    File.Copy(src, dest, true);
                }

                var lexPhonetic = new LexPhonetic();
                lexPhonetic.MergeIn(MultiTextBase.Create(new() { { "href", dest } }));
                // If audio has speaker, include speaker name as a pronunciation label
                var speaker = projectSpeakers.Find(s => s.Id == audio.SpeakerId);
                if (speaker is not null)
                {
                    lexPhonetic.MergeIn(
                        MultiTextBase.Create(new() { { "en", $"Speaker: {speaker.Name}" } }));
                }
                entry.Pronunciations.Add(lexPhonetic);
            }
        }

        /// <summary> Exports vernacular language character set to an ldml file </summary>
        private static void LdmlExport(string filePath, WritingSystem vernacularWS, List<string> validChars)
        {
            var wsr = LdmlInFolderWritingSystemRepository.Initialize(filePath);
            var wsf = new LdmlInFolderWritingSystemFactory(wsr);
            wsf.Create(vernacularWS.Bcp47, out var wsDef);

            // If the vernacular writing system font isn't present, add it.
            if (!string.IsNullOrWhiteSpace(vernacularWS.Font)
                && !wsDef.Fonts.Any(f => f.Name == vernacularWS.Font))
            {
                wsDef.Fonts.Add(new FontDefinition(vernacularWS.Font));
            }

            // If there isn't already a main character set defined,
            // make one and add it to the writing system definition.
            if (!wsDef.CharacterSets.TryGet("main", out var chars))
            {
                chars = new CharacterSetDefinition("main");
                wsDef.CharacterSets.Add(chars);
            }

            // Replace all the characters found with our copy of the character set
            chars.Characters.Clear();
            foreach (var character in validChars)
            {
                chars.Characters.Add(character);
            }

            // Write out the new definition
            wsr.Set(wsDef);
            wsr.Save();
        }

        /// <summary>
        /// Fix the string to be safe in an attribute value of XML.
        /// </summary>
        /// <param name="sInput"></param>
        /// <returns></returns>
        public static string MakeSafeXmlAttribute(string sInput)
        {
            return SecurityElement.Escape(sInput);
        }

        public ILiftMerger GetLiftImporterExporter(string projectId, string vernLang, IWordRepository wordRepo)
        {
            return new LiftMerger(projectId, vernLang, wordRepo);
        }

        private static void WriteRangeElement(XmlWriter liftRangesWriter,
            string id, string guid, string name, string lang, string description = "", string parent = "")
        {
            liftRangesWriter.WriteStartElement("range-element"); // start range element
            liftRangesWriter.WriteAttributeString("id", $"{id} {name}"); // add id to element
            liftRangesWriter.WriteAttributeString("guid", guid); // add guid to element
            if (!string.IsNullOrEmpty(parent))
            {
                liftRangesWriter.WriteAttributeString("parent", $"{parent}"); // add parent to element
            }

            WriteFormElement(liftRangesWriter, "label", lang, name); // write label
            WriteFormElement(liftRangesWriter, "abbrev", lang, id); // write abbrev/id
            if (!string.IsNullOrEmpty(description))
            {
                WriteFormElement(liftRangesWriter, "description", lang, description); // write description
            }

            liftRangesWriter.WriteEndElement(); // end range element
        }

        private static void WriteFormElement(XmlWriter liftRangesWriter, string element, string language, string text)
        {
            liftRangesWriter.WriteStartElement(element); // start element
            liftRangesWriter.WriteStartElement("form"); // start form
            liftRangesWriter.WriteAttributeString("lang", language); // add language to form
            liftRangesWriter.WriteElementString("text", text); // write text
            liftRangesWriter.WriteEndElement(); // end form
            liftRangesWriter.WriteEndElement(); // end element
        }

        private sealed class LiftMerger : ILiftMerger
        {
            private readonly string _projectId;
            private readonly List<SemanticDomainFull> _customSemDoms = new();
            private readonly string _vernLang;
            private readonly IWordRepository _wordRepo;
            private readonly List<Word> _importEntries = new();

            public LiftMerger(string projectId, string vernLang, IWordRepository wordRepo)
            {
                _projectId = projectId;
                _vernLang = vernLang;
                _wordRepo = wordRepo;
            }

            /// <summary>
            /// Check for any Definitions in the private field <see cref="_importEntries"/>
            /// </summary>
            /// <returns> A boolean: true if at least one word has a definition. </returns>
            public bool DoesImportHaveDefinitions()
            {
                return _importEntries.Any(w => w.Senses.Any(s => s.Definitions.Count > 0));
            }

            /// <summary>
            /// Check for any GrammaticalInfo in the private field <see cref="_importEntries"/>
            /// </summary>
            /// <returns> A boolean: true if at least one word has a GramCatGroup other than Unspecified. </returns>
            public bool DoesImportHaveGrammaticalInfo()
            {
                return _importEntries.Any(w => w.Senses.Any(
                    s => s.GrammaticalInfo is not null &&
                    s.GrammaticalInfo.CatGroup != GramCatGroup.Unspecified));
            }

            /// <summary> Get custom semantic domains found in the lift ranges. </summary>
            public List<SemanticDomainFull> GetCustomSemanticDomains()
            {
                return _customSemDoms;
            }

            /// <summary>
            /// Get all analysis languages found in senses in the private field <see cref="_importEntries"/>
            /// </summary>
            /// <returns> A List of all distinct analysis writing systems in the import. </returns>
            public List<WritingSystem> GetImportAnalysisWritingSystems()
            {
                var langTags = _importEntries.SelectMany(
                    w => w.Senses.SelectMany(s => Language.GetSenseAnalysisLangTags(s))
                ).Distinct();

                return Language.ConvertLangTagsToWritingSystems(langTags);
            }

            /// <summary>
            /// <see cref="Word"/>s are added to the private field <see cref="_importEntries"/>
            /// during lift import. This saves the contents of _importEntries to the database.
            /// </summary>
            /// <returns> The words saved. </returns>
            public async Task<List<Word>> SaveImportEntries()
            {
                var savedWords = new List<Word>(await _wordRepo.Create(_importEntries));
                _importEntries.Clear();
                return savedWords;
            }

            /// <summary>
            /// A significant portion of lift import is done here. This reads in all necessary
            /// attributes to create a word from <paramref name="entry"/>, adding the result
            /// to <see cref="_importEntries"/> to be saved to the database.
            /// </summary>
            /// <remarks>
            /// This method cannot safely be marked async because Parent classes are not async aware and do not await
            /// it.
            /// </remarks>
            /// <param name="entry"></param>
            public void FinishEntry(LiftEntry entry)
            {
                var newWord = new Word
                {
                    Guid = entry.Guid,
                    Created = Time.ToUtcIso8601(entry.DateCreated),
                    Modified = Time.ToUtcIso8601(entry.DateModified)
                };

                if (LiftHelper.IsProtected(entry))
                {
                    newWord.Accessibility = Status.Protected;
                    newWord.ProtectReasons = LiftHelper.GetProtectedReasons(entry);
                }

                // Add Note if one exists.
                // Note: Currently only support for a single note is included.
                if (entry.Notes.Count > 0)
                {
                    var (language, liftString) = entry.Notes[0].Content.FirstValue;
                    newWord.Note = new Note(language, liftString.Text.Normalize(FormC));
                }

                // Add vernacular, prioritizing citation form over vernacular form.
                var vern = entry.CitationForm.FirstOrDefault(x => x.Key == _vernLang).Value?.Text;
                newWord.UsingCitationForm = !string.IsNullOrWhiteSpace(vern);
                if (string.IsNullOrWhiteSpace(vern))
                {
                    vern = entry.LexicalForm.FirstOrDefault(x => x.Key == _vernLang).Value?.Text;
                }
                // This is not a word if there is no vernacular.
                if (string.IsNullOrWhiteSpace(vern))
                {
                    return;
                }
                newWord.Vernacular = vern.Normalize(FormC);

                // This is not a word if there are no senses
                if (entry.Senses.Count == 0)
                {
                    return;
                }

                // Add senses
                newWord.Senses = new List<Sense>();
                foreach (var sense in entry.Senses)
                {
                    var newSense = new Sense
                    {
                        SemanticDomains = new List<SemanticDomain>(),
                        Glosses = new List<Gloss>(),
                        // FieldWorks uses LiftSense.Id for the GUID field, rather than LiftSense.Guid,
                        // so follow this convention.
                        Guid = new Guid(sense.Id)
                    };

                    if (LiftHelper.IsProtected(sense))
                    {
                        newSense.Accessibility = Status.Protected;
                        newSense.ProtectReasons = LiftHelper.GetProtectedReasons(sense);
                    }

                    // Add definitions
                    foreach (var (key, value) in sense.Definition)
                    {
                        newSense.Definitions.Add(
                            new Definition { Language = key, Text = value.Text.Normalize(FormC) });
                    }

                    // Add glosses
                    foreach (var (key, value) in sense.Gloss)
                    {
                        newSense.Glosses.Add(new Gloss { Language = key, Def = value.Text.Normalize(FormC) });
                    }

                    // Find semantic domains
                    var semanticDomainStrings = new List<string>();
                    foreach (var trait in sense.Traits)
                    {
                        if (trait.Name.StartsWith("semantic-domain", StringComparison.OrdinalIgnoreCase))
                        {
                            semanticDomainStrings.Add(trait.Value);
                        }
                    }

                    // Add semantic domains
                    foreach (var semanticDomainString in semanticDomainStrings)
                    {
                        // Splits on the space between the number and name of the semantic domain
                        var splitSemDom = semanticDomainString.Split(" ", 2);
                        newSense.SemanticDomains.Add(
                            new SemanticDomain
                            {
                                Id = splitSemDom[0],
                                MongoId = ObjectId.GenerateNewId().ToString(),
                                Name = splitSemDom[1].Normalize(FormC)
                            });
                    }

                    // Add grammatical info
                    if (!string.IsNullOrWhiteSpace(sense.GramInfo?.Value))
                    {
                        newSense.GrammaticalInfo = new GrammaticalInfo(sense.GramInfo.Value.Normalize(FormC));
                    }

                    newWord.Senses.Add(newSense);
                }

                // Add plural
                foreach (var field in entry.Fields)
                {
                    if (field.Type == "Plural")
                    {
                        var plural = field.Content.First().Value.Text;
                        if (!string.IsNullOrWhiteSpace(plural))
                        {
                            newWord.Plural = plural.Normalize(FormC);
                        }
                    }
                    else if (field.Type == LiftHelper.FlagFieldTag)
                    {
                        var flags = field.Content.Values.Where(v => !string.IsNullOrWhiteSpace(v.Text));
                        if (flags.Any())
                        {
                            var texts = flags.Select(v => v.Text.Trim())
                                .Select(t => t.Equals(FlagTextEmpty, StringComparison.Ordinal) ? "" : t)
                                .Where(t => !string.IsNullOrEmpty(t));
                            newWord.Flag = new() { Active = true, Text = string.Join("; ", texts).Normalize(FormC) };
                        }
                    }
                }

                // Get path to directory with audio files ~/{projectId}/Import/ExtractedLocation/Lift/audio
                var extractedAudioDir = FileStorage.GenerateAudioFileDirPath(_projectId);

                // Only add audio if the files exist
                if (Directory.Exists(extractedAudioDir))
                {
                    foreach (var pronunciation in entry.Pronunciations)
                    {
                        foreach (var media in pronunciation.Media)
                        {
                            if (!string.IsNullOrEmpty(media.Url))
                            {
                                // Add audio with Protected = true to prevent modifying or deleting imported audio
                                newWord.Audio.Add(new(media.Url) { Protected = true });
                            }
                        }
                    }
                }

                newWord.ProjectId = _projectId;
                _importEntries.Add(newWord);
            }

            /// <summary> Creates the object to transfer all the data from a word </summary>
            public LiftEntry GetOrMakeEntry(Extensible info, int order)
            {
                return new LiftEntry(info, info.Guid, order) { CitationForm = [], LexicalForm = [] };
            }

            /// <summary> Creates an empty sense object and adds it to the entry </summary>
            public LiftSense GetOrMakeSense(LiftEntry entry, Extensible info, string rawXml)
            {
                var sense = new LiftSense(info, info.Guid, entry) { Definition = [], Gloss = [] };
                entry.Senses.Add(sense);
                return sense;
            }

            /// <summary> Adds each citation form to the entry for the vernacular </summary>
            public void MergeInCitationForm(LiftEntry entry, LiftMultiText contents)
            {
                entry.CitationForm ??= [];
                foreach (var (key, value) in contents)
                {
                    entry.CitationForm.Add(key, value.Text);
                }
            }

            /// <summary> Adds field to the entry </summary>
            public void MergeInField(LiftObject extensible, string tagAttribute, DateTime dateCreated,
                DateTime dateModified, LiftMultiText contents, List<Trait> traits)
            {
                var field = new LiftField(tagAttribute, contents)
                {
                    DateCreated = dateCreated,
                    DateModified = dateModified,
                };
                field.Traits.AddRange(traits.Select(t => new LiftTrait() { Name = t.Name, Value = t.Value }));
                extensible.Fields.Add(field);
            }

            /// <summary> Adds sense's definitions to the entry. </summary>
            public void MergeInDefinition(LiftSense sense, LiftMultiText multiText)
            {
                sense.Definition ??= [];
                foreach (var (key, value) in multiText)
                {
                    sense.Definition.Add(key, value.Text);
                }
            }

            /// <summary> Adds sense's glosses to the entry. </summary>
            public void MergeInGloss(LiftSense sense, LiftMultiText multiText)
            {
                sense.Gloss ??= [];
                foreach (var (key, value) in multiText)
                {
                    sense.Gloss.Add(key, value.Text);
                }
            }

            /// <summary> Adds each lexeme form to the entry for the vernacular </summary>
            public void MergeInLexemeForm(LiftEntry entry, LiftMultiText contents)
            {
                entry.LexicalForm ??= [];
                foreach (var (key, value) in contents)
                {
                    entry.LexicalForm.Add(key, value);
                }
            }

            /// <summary> Adds field to the entry for semantic domains </summary>
            public void MergeInTrait(LiftObject extensible, Trait trait)
            {
                extensible.Traits.Add(new() { Name = trait.Name, Value = trait.Value });
            }

            /// <summary> Needs to be called before MergeInMedia </summary>
            public LiftObject MergeInPronunciation(LiftEntry entry, LiftMultiText contents, string rawXml)
            {
                var pronunciation = new LiftPhonetic { Form = contents };
                entry.Pronunciations.Add(pronunciation);
                return pronunciation;
            }

            /// <summary> Adds in media for audio pronunciation </summary>
            public void MergeInMedia(LiftObject pronunciation, string href, LiftMultiText caption)
            {
                (pronunciation as LiftPhonetic)?.Media.Add(new() { Label = caption, Url = href });
            }

            /// <summary> Adds in note, if there is one to add </summary>
            public void MergeInNote(LiftObject extensible, string type, LiftMultiText contents, string rawXml)
            {
                var note = new LiftNote(type, contents);
                if (extensible is LiftEntry entry)
                {
                    entry.Notes.Add(note);
                }
                else if (extensible is LiftSense sense)
                {
                    sense.Notes.Add(note);
                }
                else if (extensible is LiftExample example)
                {
                    example.Notes.Add(note);
                }
            }

            public void MergeInGrammaticalInfo(LiftObject obj, string val, List<Trait> traits)
            {
                var gramInfo = new LiftGrammaticalInfo { Value = val };
                gramInfo.Traits.AddRange(traits.Select(t => new LiftTrait { Name = t.Name, Value = t.Value }));
                if (obj is LiftSense sense)
                {
                    sense.GramInfo = gramInfo;
                }
                else if (obj is LiftReversal reversal)
                {
                    reversal.GramInfo = gramInfo;
                }
            }

            /// <summary> Adds in custom semantic domains </summary>
            public void ProcessRangeElement(string range, string id, string guid, string parent,
                LiftMultiText description, LiftMultiText label, LiftMultiText abbrev, string rawXml)
            {
                if (range == "semantic-domain-ddp4" && abbrev.Count > 0)
                {
                    var domainId = abbrev.First().Value.Text;

                    // If we allow custom subdomains with id not ending in "0",
                    // we'll need to change the `domainId.Last() == '0'` check
                    // to verifying that the id doesn't conflict with the standard domains.
                    if (SemanticDomain.IsValidId(domainId, true) && domainId.Last() == '0')
                    {
                        foreach (var nameLabel in label)
                        {
                            description.TryGetValue(nameLabel.Key, out var descriptionText);
                            _customSemDoms.Add(new()
                            {
                                Guid = guid,
                                Id = domainId,
                                Lang = nameLabel.Key,
                                Name = nameLabel.Value.Text,
                                Description = descriptionText?.Text ?? "",
                                ParentId = string.IsNullOrEmpty(parent) ? "" : parent.Split(" ")[0]
                            });
                        }
                    }
                }
            }

            // The following may be called by the Lexicon Merger.
            // We don't use this info in The Combine except to know when to protect imported data.
            [ExcludeFromCodeCoverage]
            public LiftExample GetOrMakeExample(LiftSense sense, Extensible info)
            {
                var example = new LiftExample
                {
                    DateCreated = info.CreationTime,
                    DateModified = info.ModificationTime,
                    Guid = info.Guid,
                    Id = info.Id
                };
                sense.Examples.Add(example);
                return example;
            }

            [ExcludeFromCodeCoverage]
            public LiftObject GetOrMakeParentReversal(LiftObject parent, LiftMultiText contents, string type)
            {
                return new LiftReversal { Form = contents, Main = parent as LiftReversal, Type = type };
            }

            [ExcludeFromCodeCoverage]
            public LiftSense GetOrMakeSubsense(LiftSense sense, Extensible info, string rawXml)
            {
                var subsense = new LiftSense(info, info.Guid, sense);
                sense.Subsenses.Add(subsense);
                return subsense;
            }

            [ExcludeFromCodeCoverage]
            public LiftObject MergeInEtymology(LiftEntry entry, string source, string type, LiftMultiText form,
                        LiftMultiText gloss, string rawXml)
            {
                var etymology = new LiftEtymology { Form = form, Gloss = gloss, Source = source, Type = type };
                entry.Etymologies.Add(etymology);
                return etymology;
            }

            [ExcludeFromCodeCoverage]
            public LiftObject MergeInReversal(
                        LiftSense sense, LiftObject parent, LiftMultiText contents, string type, string rawXml)
            {
                var reversal = new LiftReversal { Form = contents, Main = parent as LiftReversal, Type = type };
                sense.Reversals.Add(reversal);
                return reversal;
            }

            [ExcludeFromCodeCoverage]
            public LiftObject MergeInVariant(LiftEntry entry, LiftMultiText contents, string rawXml)
            {
                var variant = new LiftVariant { Form = contents, RawXml = rawXml };
                entry.Variants.Add(variant);
                return variant;
            }

            [ExcludeFromCodeCoverage]
            public void MergeInExampleForm(LiftExample example, LiftMultiText multiText)
            {
                example.Content ??= [];
                foreach (var (key, value) in multiText)
                {
                    example.Content.Add(key, value);
                }
            }

            [ExcludeFromCodeCoverage]
            public void MergeInPicture(LiftSense sense, string href, LiftMultiText caption)
            {
                sense.Illustrations.Add(new() { Label = caption, Url = href });
            }

            [ExcludeFromCodeCoverage]
            public void MergeInRelation(
                        LiftObject extensible, string relationTypeName, string targetId, string rawXml)
            {
                var relation = new LiftRelation { Ref = targetId, Type = relationTypeName };
                if (extensible is LiftEntry entry)
                {
                    entry.Relations.Add(relation);
                }
                else if (extensible is LiftSense sense)
                {
                    sense.Relations.Add(relation);
                }
                else if (extensible is LiftVariant variant)
                {
                    variant.Relations.Add(relation);
                }
            }

            [ExcludeFromCodeCoverage]
            public void MergeInSource(LiftExample example, string source)
            {
                example.Source = source;
            }

            [ExcludeFromCodeCoverage]
            public void MergeInTranslationForm(
                        LiftExample example, string type, LiftMultiText contents, string rawXml)
            {
                example.Translations.Add(new() { Content = contents, Type = type });
            }

            // The following are unimplemented, but may still be called by the Lexicon Merger
            [ExcludeFromCodeCoverage]
            public void EntryWasDeleted(Extensible info, DateTime dateDeleted) { }
            [ExcludeFromCodeCoverage]
            public void ProcessFieldDefinition(string tag, LiftMultiText description) { }
        }
    }
}
