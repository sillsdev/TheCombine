using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Reflection;
using System.Security;
using System.Text;
using System.Threading.Tasks;
using System.Xml;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using SIL.DictionaryServices.Lift;
using SIL.DictionaryServices.Model;
using SIL.Extensions;
using SIL.Lift;
using SIL.Lift.Options;
using SIL.Lift.Parsing;
using SIL.Text;
using SIL.WritingSystems;
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
            if (entry.Pronunciations.FirstOrDefault() != null && entry.Pronunciations.First().Forms.Any())
            {
                foreach (var phonetic in entry.Pronunciations)
                {
                    Writer.WriteStartElement("pronunciation");
                    Writer.WriteStartElement("media");
                    Writer.WriteAttributeString("href", Path.GetFileName(phonetic.Forms.First().Form));
                    Writer.WriteEndElement();
                    Writer.WriteEndElement();
                }

                // Make sure the writer does not write it again in the wrong format.
                entry.Pronunciations.Clear();
            }
        }

        public override void Dispose()
        {
            // TODO: When updating the LiftWriter dependency, check to see if its Dispose() implementation
            //    has been fixed properly to avoid needing to override its Dispose method.
            //    https://github.com/sillsdev/libpalaso/blob/master/SIL.DictionaryServices/Lift/LiftWriter.cs
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

            // Generally, the base class Dispose method would be called here, but it accesses _writer,
            // and we are disposing of that ourselves in the child class to fix a memory leak.
        }
    }

    [Serializable]
    public class MissingProjectException : Exception
    {
        public MissingProjectException(string message) : base(message) { }

    }

    public class LiftService : ILiftService
    {
        /// A dictionary shared by all Projects for storing and retrieving paths to exported projects.
        private readonly Dictionary<string, string> _liftExports;
        private const string InProgress = "IN_PROGRESS";

        public LiftService()
        {
            if (!Sldr.IsInitialized)
            {
                Sldr.Initialize(true);
            }

            _liftExports = new Dictionary<string, string>();
        }

        /// <summary> Store status that a user's export is in-progress. </summary>
        public void SetExportInProgress(string userId, bool isInProgress = true)
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
            if (!_liftExports.ContainsKey(userId))
            {
                return false;
            }
            return _liftExports[userId] == InProgress;
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
            if (!_liftExports.ContainsKey(userId) || _liftExports[userId] == InProgress)
            {
                return null;
            }

            return _liftExports[userId];
        }

        /// <summary> Delete a stored Lift export path and its file on disk. </summary>
        /// <returns> If the element is successfully found and removed, true; otherwise, false. </returns>
        public bool DeleteExport(string userId)
        {
            var removeSuccessful = _liftExports.Remove(userId, out var filePath);
            if (removeSuccessful)
            {
                File.Delete(filePath);
            }
            return removeSuccessful;
        }

        /// <summary> Imports main character set for a project from an ldml file </summary>
        public void LdmlImport(string filePath, string langTag, IProjectRepository projRepo, Project project)
        {
            var wsr = LdmlInFolderWritingSystemRepository.Initialize(filePath);
            var wsf = new LdmlInFolderWritingSystemFactory(wsr);
            wsf.Create(langTag, out var wsDef);

            // If there is a main character set, import it to the project
            if (wsDef.CharacterSets.Contains("main"))
            {
                project.ValidCharacters = wsDef.CharacterSets["main"].Characters.ToList();
                projRepo.Update(project.Id, project);
            }
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
            var vernacularBcp47 = proj.VernacularWritingSystem.Bcp47;

            // Generate the zip dir.
            var exportDir = FileStorage.GenerateLiftExportDirPath(projectId);
            var liftExportDir = Path.Combine(exportDir, "LiftExport");
            if (Directory.Exists(liftExportDir))
            {
                Directory.Delete(liftExportDir, true);
            }

            var projNameAsPath = Sanitization.MakeFriendlyForPath(proj.Name, "Lift");
            var zipDir = Path.Combine(liftExportDir, projNameAsPath);
            Directory.CreateDirectory(zipDir);

            // Add audio dir inside zip dir.
            var audioDir = Path.Combine(zipDir, "audio");
            Directory.CreateDirectory(audioDir);
            var liftPath = Path.Combine(zipDir, projNameAsPath + ".lift");

            // noBOM will work with PrinceXML
            using var liftWriter = new CombineLiftWriter(liftPath, ByteOrderStyle.BOM);
            var rangesDest = Path.Combine(zipDir, projNameAsPath + ".lift-ranges");

            // Write header of lift document.
            var header =
                $@"
                    <ranges>
                        <range id = ""semantic-domain-ddp4"" href = ""{rangesDest}""/>
                    </ranges>
                    <fields>
                        <field tag = ""Plural"">
                            <form lang = ""en""><text></text></form>
                            <form lang = ""qaa-x-spec""><text> Class = LexEntry; Type = String; WsSelector = kwsVern </text></form>
                        </field>
                    </fields>
                ";
            liftWriter.WriteHeader(header);

            // Write out every word with all of its information
            var allWords = await wordRepo.GetAllWords(projectId);
            var frontier = await wordRepo.GetFrontier(projectId);
            var activeWords = frontier.Where(
                x => x.Senses.Any(s => s.Accessibility == State.Active)).ToList();

            // All words in the frontier with any senses are considered current.
            // The Combine does not import senseless entries and the interface is supposed to prevent creating them.
            // So the the words found in allWords with no matching guid in activeWords are exported as 'deleted'.
            var deletedWords = allWords.Where(
                x => activeWords.All(w => w.Guid != x.Guid)).DistinctBy(w => w.Guid).ToList();
            foreach (var wordEntry in activeWords)
            {
                var entry = new LexEntry(MakeSafeXmlAttribute(wordEntry.Vernacular), wordEntry.Guid);
                if (DateTime.TryParse(wordEntry.Created, out var createdTime))
                {
                    entry.CreationTime = createdTime;
                }

                if (DateTime.TryParse(wordEntry.Modified, out var modifiedTime))
                {
                    entry.ModificationTime = modifiedTime;
                }

                AddNote(entry, wordEntry);
                AddVern(entry, wordEntry, vernacularBcp47);
                AddSenses(entry, wordEntry);
                AddAudio(entry, wordEntry, audioDir, projectId);

                liftWriter.Add(entry);
            }

            foreach (var wordEntry in deletedWords)
            {
                var entry = new LexEntry(MakeSafeXmlAttribute(wordEntry.Vernacular), wordEntry.Guid);

                AddNote(entry, wordEntry);
                AddVern(entry, wordEntry, vernacularBcp47);
                AddSenses(entry, wordEntry);
                AddAudio(entry, wordEntry, audioDir, projectId);

                liftWriter.AddDeletedEntry(entry);
            }

            liftWriter.End();

            // Export semantic domains to lift-ranges
            var extractedPathToImport = FileStorage.GenerateImportExtractedLocationDirPath(projectId, false);
            string? firstImportDir = null;
            if (Directory.Exists(extractedPathToImport))
            {
                // TODO: Should an error be raised if this returns null?
                firstImportDir = Directory.GetDirectories(extractedPathToImport).Select(
                    Path.GetFileName).ToList().Single();
            }

            var importLiftDir = firstImportDir ?? "";
            var rangesSrc = Path.Combine(extractedPathToImport, importLiftDir, $"{importLiftDir}.lift-ranges");

            // If there are no new semantic domains, and the old lift-ranges file is still around, just copy it
            if (proj.SemanticDomains.Count == 0 && File.Exists(rangesSrc))
            {
                File.Copy(rangesSrc, rangesDest, true);
            }
            else // Make a new lift-ranges file
            {
                using var liftRangesWriter = XmlWriter.Create(rangesDest, new XmlWriterSettings
                {
                    Indent = true,
                    NewLineOnAttributes = true,
                    Async = true
                });
                await liftRangesWriter.WriteStartDocumentAsync();
                liftRangesWriter.WriteStartElement("lift-ranges");
                liftRangesWriter.WriteStartElement("range");
                liftRangesWriter.WriteAttributeString("id", "semantic-domain-ddp4");

                // Pull from resources file with all English semantic domains
                var assembly = typeof(LiftService).GetTypeInfo().Assembly;
                const string semDomListFile = "BackendFramework.Data.sdList.txt";
                var resource = assembly.GetManifestResourceStream(semDomListFile);
                if (resource is null)
                {
                    throw new Exception($"Unable to load semantic domain list: {semDomListFile}");
                }

                string sdList;
                using (var reader = new StreamReader(resource, Encoding.UTF8))
                {
                    sdList = await reader.ReadToEndAsync();
                }

                var sdLines = sdList.Split(Environment.NewLine);
                foreach (var line in sdLines)
                {
                    if (line != "")
                    {
                        var items = line.Split("`");
                        WriteRangeElement(liftRangesWriter, items[0], items[1], items[2], items[3]);
                    }
                }

                // Pull from new semantic domains in project
                foreach (var sd in proj.SemanticDomains)
                {
                    WriteRangeElement(liftRangesWriter, sd.Id, Guid.NewGuid().ToString(), sd.Name, sd.Description);
                }

                await liftRangesWriter.WriteEndElementAsync(); //end semantic-domain-ddp4 range
                await liftRangesWriter.WriteEndElementAsync(); //end lift-ranges
                await liftRangesWriter.WriteEndDocumentAsync();

                await liftRangesWriter.FlushAsync();
                liftRangesWriter.Close();
            }

            // Export character set to ldml.
            var ldmlDir = Path.Combine(zipDir, "WritingSystems");
            Directory.CreateDirectory(ldmlDir);
            if (vernacularBcp47 != "")
            {
                var validChars = proj.ValidCharacters;
                LdmlExport(ldmlDir, vernacularBcp47, validChars);
            }

            // Compress everything.
            var destinationFileName = Path.Combine(exportDir,
                Path.Combine($"LiftExportCompressed-{proj.Id}_{DateTime.Now:yyyy-MM-dd_hh-mm-ss}.zip"));
            ZipFile.CreateFromDirectory(Path.GetDirectoryName(zipDir), destinationFileName);

            // Clean up the temporary folder structure that was compressed.
            Directory.Delete(liftExportDir, true);

            return destinationFileName;
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
            entry.LexicalForm.MergeIn(MultiText.Create(
                new LiftMultiText { { vernacularBcp47, wordEntry.Vernacular } }));
        }

        /// <summary> Adds each <see cref="Sense"/> of a word to be written out to lift </summary>
        private static void AddSenses(LexEntry entry, Word wordEntry)
        {
            var activeSenses = wordEntry.Senses.Where(s => s.Accessibility == State.Active).ToList();
            foreach (var currentSense in activeSenses)
            {
                // Merge in senses
                var dict = new Dictionary<string, string>();
                foreach (var gloss in currentSense.Glosses)
                {
                    if (dict.ContainsKey(gloss.Language))
                    {
                        // This is an unexpected situation but rather than crashing or losing data we
                        // will just append extra definitions for the language with a semicolon separator
                        dict[gloss.Language] = $"{dict[gloss.Language]};{gloss.Def}";
                    }
                    else
                    {
                        dict.Add(gloss.Language, gloss.Def);
                    }
                }

                var lexSense = new LexSense();
                lexSense.Gloss.MergeIn(MultiTextBase.Create(dict));
                lexSense.Id = currentSense.Guid.ToString();
                entry.Senses.Add(lexSense);

                // Merge in semantic domains
                foreach (var semDom in currentSense.SemanticDomains)
                {
                    var orc = new OptionRefCollection();
                    orc.Add(semDom.Id + " " + semDom.Name);

                    lexSense.Properties.Add(
                        new KeyValuePair<string, IPalasoDataObjectProperty>("semantic-domain-ddp4", orc));
                }
            }
        }

        /// <summary> Adds pronunciation audio of a word to be written out to lift </summary>
        private static void AddAudio(LexEntry entry, Word wordEntry, string path, string projectId)
        {
            foreach (var audioFile in wordEntry.Audio)
            {
                var lexPhonetic = new LexPhonetic();
                var src = FileStorage.GenerateAudioFilePath(projectId, audioFile);
                var dest = Path.Combine(path, audioFile);

                if (File.Exists(src))
                {
                    File.Copy(src, dest, true);

                    var proMultiText = new LiftMultiText { { "href", dest } };
                    lexPhonetic.MergeIn(MultiText.Create(proMultiText));
                    entry.Pronunciations.Add(lexPhonetic);
                }
            }
        }

        /// <summary> Exports vernacular language character set to an ldml file </summary>
        private static void LdmlExport(string filePath, string vernacularBcp47, List<string> validChars)
        {
            var wsr = LdmlInFolderWritingSystemRepository.Initialize(filePath);
            var wsf = new LdmlInFolderWritingSystemFactory(wsr);
            wsf.Create(vernacularBcp47, out var wsDef);

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
        public static string? MakeSafeXmlAttribute(string sInput)
        {
            return SecurityElement.Escape(sInput);
        }

        public ILiftMerger GetLiftImporterExporter(string projectId, IWordRepository wordRepo)
        {
            return new LiftMerger(projectId, wordRepo);
        }

        private static void WriteRangeElement(
            XmlWriter liftRangesWriter, string id, string guid, string name, string description)
        {
            liftRangesWriter.WriteStartElement("range-element");
            liftRangesWriter.WriteAttributeString("id", $"{id} {name}");
            liftRangesWriter.WriteAttributeString("guid", guid);

            liftRangesWriter.WriteStartElement("label");
            liftRangesWriter.WriteAttributeString("lang", "en");
            liftRangesWriter.WriteStartElement("text");
            liftRangesWriter.WriteString(name);
            liftRangesWriter.WriteEndElement(); //end text
            liftRangesWriter.WriteEndElement(); //end label

            liftRangesWriter.WriteStartElement("abbrev");
            liftRangesWriter.WriteAttributeString("lang", "en");
            liftRangesWriter.WriteStartElement("text");
            liftRangesWriter.WriteString(id);
            liftRangesWriter.WriteEndElement(); //end text
            liftRangesWriter.WriteEndElement(); //end label

            liftRangesWriter.WriteStartElement("description");
            liftRangesWriter.WriteAttributeString("lang", "en");
            liftRangesWriter.WriteStartElement("text");
            liftRangesWriter.WriteString(description);
            liftRangesWriter.WriteEndElement(); //end text
            liftRangesWriter.WriteEndElement(); //end label

            liftRangesWriter.WriteEndElement(); //end range element
        }

        private sealed class LiftMerger : ILiftMerger
        {
            private readonly string _projectId;
            private readonly IWordRepository _wordRepo;
            private readonly List<Word> _importEntries = new List<Word>();

            public LiftMerger(string projectId, IWordRepository wordRepo)
            {
                _projectId = projectId;
                _wordRepo = wordRepo;
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

                // Add Note if one exists.
                // Note: Currently only support for a single note is included.
                if (entry.Notes.Count > 0)
                {
                    var (language, liftString) = entry.Notes[0].Content.FirstValue;
                    newWord.Note = new Note(language, liftString.Text);
                }

                // Add vernacular
                // TODO: currently we just add the first listed option, we may want to choose eventually
                if (!entry.CitationForm.IsEmpty) // Prefer citation form for vernacular
                {
                    newWord.Vernacular = entry.CitationForm.FirstValue.Value.Text;
                }
                else if (!entry.LexicalForm.IsEmpty) // lexeme form for backup
                {
                    newWord.Vernacular = entry.LexicalForm.FirstValue.Value.Text;
                }
                else // this is not a word if there is no vernacular
                {
                    return;
                }

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

                    // Add glosses
                    foreach (var (key, value) in sense.Gloss)
                    {
                        newSense.Glosses.Add(new Gloss { Language = key, Def = value.Text });
                    }

                    // Find semantic domains
                    var semanticDomainStrings = new List<string>();
                    foreach (var trait in sense.Traits)
                    {
                        if (trait.Name.StartsWith("semantic-domain"))
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
                            new SemanticDomain { Id = splitSemDom[0], Name = splitSemDom[1] });
                    }

                    newWord.Senses.Add(newSense);
                }

                // Add plural
                foreach (var field in entry.Fields)
                {
                    if (field.Type == "Plural")
                    {
                        foreach (var _ in field.Content)
                        {
                            var pluralForm = entry.Fields.First().Content.First().Value.Text;
                            newWord.Plural = pluralForm;
                        }
                    }
                }

                // Get path to directory with audio files ~/{projectId}/Import/ExtractedLocation/Lift/audio
                var extractedAudioDir = FileStorage.GenerateAudioFileDirPath(_projectId);

                // Only add audio if the files exist
                if (Directory.Exists(extractedAudioDir))
                {
                    // Add audio
                    foreach (var pro in entry.Pronunciations)
                    {
                        // get path to audio file in lift package at
                        // ~/{projectId}/Import/ExtractedLocation/Lift/audio/{audioFile}.mp3
                        var audioFile = pro.Media.First().Url;
                        newWord.Audio.Add(audioFile);
                    }
                }

                newWord.ProjectId = _projectId;
                _importEntries.Add(newWord);
            }

            /// <summary> Creates the object to transfer all the data from a word </summary>
            public LiftEntry GetOrMakeEntry(Extensible info, int order)
            {
                return new LiftEntry(info, info.Guid, order)
                {
                    LexicalForm = new LiftMultiText(),
                    CitationForm = new LiftMultiText()
                };
            }

            /// <summary> Creates an empty sense object and adds it to the entry </summary>
            public LiftSense GetOrMakeSense(LiftEntry entry, Extensible info, string rawXml)
            {
                var sense = new LiftSense(info, info.Guid, entry) { Gloss = new LiftMultiText() };
                entry.Senses.Add(sense);
                return sense;
            }

            /// <summary> Adds each citation form to the entry for the vernacular </summary>
            public void MergeInCitationForm(LiftEntry entry, LiftMultiText contents)
            {
                foreach (var (key, value) in contents)
                {
                    entry.CitationForm.Add(key, value.Text);
                }
            }

            /// <summary> Adds field to the entry for plural forms </summary>
            public void MergeInField(LiftObject extensible, string typeAttribute, DateTime dateCreated,
                DateTime dateModified, LiftMultiText contents, List<Trait> traits)
            {
                var textEntry = new LiftMultiText(contents.FirstValue.Key,
                    contents.FirstValue.Value.Text);
                var fieldEntry = new LiftField(typeAttribute, textEntry);
                extensible.Fields.Add(fieldEntry);
            }

            /// <summary> Adds senses to the entry </summary>
            public void MergeInGloss(LiftSense sense, LiftMultiText multiText)
            {
                foreach (var (key, value) in multiText)
                {
                    sense.Gloss.Add(key, value.Text);
                }
            }

            /// <summary> Adds each lexeme form to the entry for the vernacular </summary>
            public void MergeInLexemeForm(LiftEntry entry, LiftMultiText contents)
            {
                foreach (var (key, value) in contents)
                {
                    entry.LexicalForm.Add(key, value);
                }
            }

            /// <summary> Adds field to the entry for semantic domains </summary>
            public void MergeInTrait(LiftObject extensible, Trait trait)
            {
                extensible.Traits.Add(new LiftTrait { Name = trait.Name, Value = trait.Value });
            }

            /// <summary> Needs to be called before MergeInMedia </summary>
            public LiftObject MergeInPronunciation(LiftEntry entry, LiftMultiText contents, string rawXml)
            {
                return entry;
            }

            /// <summary> Adds in media for audio pronunciation </summary>
            public void MergeInMedia(LiftObject pronunciation, string href, LiftMultiText caption)
            {
                var entry = (LiftEntry)pronunciation;
                var phonetic = new LiftPhonetic();
                var url = new LiftUrlRef { Url = href };
                phonetic.Media.Add(url);
                entry.Pronunciations.Add(phonetic);
            }

            /// <summary> Adds in note, if there is one to add </summary>
            public void MergeInNote(LiftObject extensible, string type, LiftMultiText contents, string rawXml)
            {
                if (extensible is LiftEntry entry)
                {
                    var note = new LiftNote(
                        // This application only uses "basic" notes, which have no type
                        null,
                        new LiftMultiText(contents.FirstValue.Key, contents.FirstValue.Value.Text));
                    entry.Notes.Add(note);
                }
            }
            /// <summary> Adds in each semantic domain to a list </summary>
            public void ProcessRangeElement(string range, string id, string guid, string parent,
                LiftMultiText description, LiftMultiText label, LiftMultiText abbrev, string rawXml)
            {
                /*uncomment this if you want to import semantic domains from a lift-ranges file*/
                //if (range == "semantic-domain-ddp4")
                //{
                //    _sdList.Add(new SemanticDomain {
                //        Name = label.ElementAt(0).Value.Text, Id = abbrev.First().Value.Text });
                //}
            }

            // The following are unused and are not implemented, but may still be called by the Lexicon Merger
            // They may be useful later if we need to add more complex attributes to words in The Combine
            public LiftExample GetOrMakeExample(LiftSense sense, Extensible info)
            {
                return new LiftExample { Content = new LiftMultiText() };
            }

            public LiftObject GetOrMakeParentReversal(LiftObject parent, LiftMultiText contents, string type)
            {
                return new LiftReversal();
            }

            public LiftSense GetOrMakeSubsense(LiftSense sense, Extensible info, string rawXml)
            {
                return new LiftSense(info, new Guid(), sense) { Gloss = new LiftMultiText() };
            }

            public LiftObject MergeInEtymology(LiftEntry entry, string source, string type, LiftMultiText form,
                LiftMultiText gloss, string rawXml)
            {
                return new LiftEtymology();
            }

            public LiftObject MergeInReversal(
                LiftSense sense, LiftObject parent, LiftMultiText contents, string type, string rawXml)
            {
                return new LiftReversal();
            }

            public LiftObject MergeInVariant(LiftEntry entry, LiftMultiText contents, string rawXml)
            {
                return new LiftVariant();
            }

            public void EntryWasDeleted(Extensible info, DateTime dateDeleted) { }
            public void MergeInDefinition(LiftSense sense, LiftMultiText liftMultiText) { }
            public void MergeInExampleForm(LiftExample example, LiftMultiText multiText) { }
            public void MergeInGrammaticalInfo(LiftObject senseOrReversal, string val, List<Trait> traits) { }

            public void MergeInPicture(LiftSense sense, string href, LiftMultiText caption) { }
            public void MergeInRelation(
                LiftObject extensible, string relationTypeName, string targetId, string rawXml)
            { }
            public void MergeInSource(LiftExample example, string source) { }
            public void MergeInTranslationForm(
                LiftExample example, string type, LiftMultiText multiText, string rawXml)
            { }
            public void ProcessFieldDefinition(string tag, LiftMultiText description) { }
        }
    }
}
