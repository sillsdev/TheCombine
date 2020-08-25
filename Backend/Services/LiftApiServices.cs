using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Xml;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using SIL.DictionaryServices.Lift;
using SIL.DictionaryServices.Model;
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
        protected override void InsertPronunciationIfNeeded(LexEntry entry, List<string> propertiesAlreadyOutput)
        {
            if (entry.Pronunciations.FirstOrDefault() != null && entry.Pronunciations.First().Forms.Count() > 0)
            {
                Writer.WriteStartElement("pronunciation");

                foreach (var phonetic in entry.Pronunciations)
                {
                    Writer.WriteStartElement("media");
                    Writer.WriteAttributeString("href", Path.GetFileName(phonetic.Forms.First().Form));
                    Writer.WriteEndElement();
                }

                // Make sure the writer does not write it again in the wrong format.
                entry.Pronunciations.Clear();

                Writer.WriteEndElement();
            }
        }
    }

    public class LiftService : ILexiconMerger<LiftObject, LiftEntry, LiftSense, LiftExample>
    {
        private readonly IWordRepository _repo;
        private readonly IProjectService _projService;
        private string _projectId;
        private readonly List<SemanticDomain> _sdList;

        public LiftService(IWordRepository repo, IProjectService projService)
        {
            _repo = repo;
            _projService = projService;
            _sdList = new List<SemanticDomain>();
        }

        /// <summary> Allows projectId to be added to words being imported </summary>
        public void SetProject(string projectId)
        {
            _projectId = projectId;
        }

        /// <summary> Imports main character set for a project from an ldml file </summary>
        public void LdmlImport(string filePath, string langTag)
        {
            // SLDR is the SIL locale data repository, it is necessary for reading/writing ldml
            // It is being initialized in offline mode here to only pull local data
            Sldr.Initialize(true);
            try
            {
                var wsr = LdmlInFolderWritingSystemRepository.Initialize(filePath);
                var wsf = new LdmlInFolderWritingSystemFactory(wsr);
                wsf.Create(langTag, out var wsDef);

                //if there is a main character set, import it to the project
                if (wsDef.CharacterSets.Contains("main"))
                {
                    var newProj = _projService.GetProject(_projectId).Result;
                    newProj.ValidCharacters = wsDef.CharacterSets["main"].Characters.ToList();
                    _projService.Update(_projectId, newProj);
                }
            }
            finally //if there was somehow an error above, we still want to cleanup to prevent unhelpful errors later
            {
                Sldr.Cleanup();
            }
        }

        private string GetProjectDir(string projectId)
        {
            // Generate path to home on Linux or Windows
            var pathToHome = FileUtilities.GeneratePathToHome();

            return Path.Combine(pathToHome, ".CombineFiles", projectId);
        }

        /// <summary> Exports information from a project to a lift package zip </summary>
        public string LiftExport(string projectId)
        {
            // Generate the zip dir.
            var exportDir = FileUtilities.GenerateFilePath(FileUtilities.FileType.Dir, true, "",
                Path.Combine(projectId, "Export"));
            if (Directory.Exists(Path.Combine(exportDir, "LiftExport")))
            {
                Directory.Delete(Path.Combine(exportDir, "LiftExport"), true);
            }
            var zipDir = Path.Combine(exportDir, "LiftExport", "Lift");
            Directory.CreateDirectory(zipDir);

            // Add audio dir inside zip dir.
            var audioDir = Path.Combine(zipDir, "audio");
            Directory.CreateDirectory(audioDir);
            var liftPath = Path.Combine(zipDir, "NewLiftFile.lift");

            // noBOM will work with PrinceXML
            var liftWriter = new CombineLiftWriter(liftPath, ByteOrderStyle.BOM);
            var rangesDest = Path.Combine(zipDir, "NewLiftFile.lift-ranges");

            // write header of lift document
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
            var allWords = _repo.GetAllWords(projectId).Result;
            var frontier = _repo.GetFrontier(projectId).Result;
            var activeWords = frontier.Where(x => x.Senses.Any(s => s.Accessibility == State.Active)).ToList();

            // TODO: this is wrong, deleted is a subset of active, are not exclusive
            var deletedWords = allWords.Where(x => activeWords.Contains(x)).ToList();
            foreach (var wordEntry in activeWords)
            {
                var entry = new LexEntry();

                AddVern(entry, wordEntry, projectId);
                AddSenses(entry, wordEntry);
                AddAudio(entry, wordEntry, audioDir);

                liftWriter.Add(entry);
            }
            foreach (var wordEntry in deletedWords)
            {
                var entry = new LexEntry();

                AddVern(entry, wordEntry, projectId);
                AddSenses(entry, wordEntry);
                AddAudio(entry, wordEntry, audioDir);

                liftWriter.AddDeletedEntry(entry);
            }

            liftWriter.End();

            // Export semantic domains to lift-ranges
            var proj = _projService.GetProject(projectId).Result;
            var extractedPathToImport = Path.Combine(GetProjectDir(projectId), "Import", "ExtractedLocation");
            var importLiftDir = "";
            if (Directory.Exists(extractedPathToImport))
            {
                importLiftDir = Directory.GetDirectories(extractedPathToImport).Select(Path.GetFileName).ToList().Single();
            }
            var rangesSrc = Path.Combine(extractedPathToImport, importLiftDir, $"{importLiftDir}.lift-ranges");

            // If there are no new semantic domains, and the old lift-ranges file is still around, just copy it
            if (proj.SemanticDomains.Count == 0 && File.Exists(rangesSrc))
            {
                File.Copy(rangesSrc, rangesDest, true);
            }
            else // Make a new lift-ranges file
            {
                var liftRangesWriter = XmlWriter.Create(rangesDest, new XmlWriterSettings
                {
                    Indent = true,
                    NewLineOnAttributes = true
                });
                liftRangesWriter.WriteStartDocument();
                liftRangesWriter.WriteStartElement("lift-ranges");
                liftRangesWriter.WriteStartElement("range");
                liftRangesWriter.WriteAttributeString("id", "semantic-domain-ddp4");

                // Pull from resources file with all English semantic domains
                var assembly = typeof(LiftService).GetTypeInfo().Assembly;
                var resource = assembly.GetManifestResourceStream("BackendFramework.Data.sdList.txt");
                string sdList;
                using (var reader = new StreamReader(resource, Encoding.UTF8))
                {
                    sdList = reader.ReadToEndAsync().Result;
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

                liftRangesWriter.WriteEndElement(); //end semantic-domain-ddp4 range
                liftRangesWriter.WriteEndElement(); //end lift-ranges
                liftRangesWriter.WriteEndDocument();

                liftRangesWriter.Flush();
                liftRangesWriter.Close();
            }


            // Export character set to ldml
            var ldmlDir = Path.Combine(zipDir, "WritingSystems");
            Directory.CreateDirectory(ldmlDir);
            if (proj.VernacularWritingSystem.Bcp47 != "")
            {
                LdmlExport(ldmlDir, proj.VernacularWritingSystem.Bcp47);
            }

            // Compress everything
            var destinationFileName = Path.Combine(exportDir,
                Path.Combine($"LiftExportCompressed-{proj.Id}_{string.Format("{0:yyyy-MM-dd_hh-mm-ss}", DateTime.Now)}.zip"));
            ZipFile.CreateFromDirectory(Path.GetDirectoryName(zipDir), destinationFileName);

            return destinationFileName;
        }

        /// <summary> Adds vernacular of a word to be written out to lift </summary>
        private void AddVern(LexEntry entry, Word wordEntry, string projectId)
        {
            var lang = _projService.GetProject(projectId).Result.VernacularWritingSystem.Bcp47;
            entry.LexicalForm.MergeIn(MultiText.Create(new LiftMultiText { { lang, wordEntry.Vernacular } }));
        }

        /// <summary> Adds each sense of a word to be written out to lift </summary>
        private void AddSenses(LexEntry entry, Word wordEntry)
        {
            for (var i = 0; i < wordEntry.Senses.Count; i++)
            {
                // Merge in senses
                var dict = new Dictionary<string, string>();
                foreach (var gloss in wordEntry.Senses[i].Glosses)
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
                entry.Senses.Add(lexSense);

                // Merge in semantic domains
                foreach (var semdom in wordEntry.Senses[i].SemanticDomains)
                {
                    var orc = new OptionRefCollection();
                    orc.Add(semdom.Id + " " + semdom.Name);

                    entry.Senses[i].Properties.Add(
                        new KeyValuePair<string, IPalasoDataObjectProperty>("semantic-domain-ddp4", orc));
                }
            }
        }

        /// <summary> Adds pronunciation audio of a word to be written out to lift </summary>
        private void AddAudio(LexEntry entry, Word wordEntry, string path)
        {
            foreach (var audioFile in wordEntry.Audio)
            {
                var lexPhonetic = new LexPhonetic();
                var projectPath = Path.Combine(_projectId, "Import", "ExtractedLocation", "Lift", "audio");
                var src = FileUtilities.GenerateFilePath(FileUtilities.FileType.Audio, true, audioFile, projectPath);
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

        /// <summary> Exports main character set from a project to an ldml file </summary>
        private void LdmlExport(string filePath, string langTag)
        {
            // SLDR is the SIL Locale Data repository, it is necessary for reading/writing ldml
            // It is being initialized in offline mode here to only pull local data
            Sldr.Initialize(true);
            try
            {
                var wsr = LdmlInFolderWritingSystemRepository.Initialize(filePath);
                var wsf = new LdmlInFolderWritingSystemFactory(wsr);
                wsf.Create(langTag, out var wsDef);

                var proj = _projService.GetProject(_projectId).Result;

                // If there isn't already a main character set defined, make one and add it to the writing system
                // definition
                if (!wsDef.CharacterSets.TryGet("main", out var chars))
                {
                    chars = new CharacterSetDefinition("main");
                    wsDef.CharacterSets.Add(chars);
                }

                // Replace all the characters found with our copy of the character set
                chars.Characters.Clear();
                foreach (var character in proj.ValidCharacters)
                {
                    chars.Characters.Add(character);
                }

                // Write out the new definition
                wsr.Set(wsDef);
                wsr.Save();
            }
            finally
            {
                // If there was somehow an error above, we still want to cleanup to prevent unhelpful errors later
                Sldr.Cleanup();
            }
        }

        private void WriteRangeElement(XmlWriter liftRangesWriter, string id, string guid, string name, string description)
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

        /// <summary> The meat of lift import is done here. This reads in all necessary attributes of a word and adds it to the database. </summary>
        public async void FinishEntry(LiftEntry entry)
        {
            var newWord = new Word();
            var proj = _projService.GetProject(_projectId).Result;

            // Only used when importing semantic domains from a lift-ranges file
            if (_sdList.Count != 0 && proj.SemanticDomains.Count == 0)
            {
                proj.SemanticDomains = _sdList;
                await _projService.Update(_projectId, proj);
            }

            // Add vernacular
            // TODO: currently we just add the first listed option, we may want to choose eventually
            if (!entry.CitationForm.IsEmpty) // Prefer citation form for vernacular
            {
                newWord.Vernacular = entry.CitationForm.FirstValue.Value.Text;
                if (proj.VernacularWritingSystem.Bcp47 == "")
                {
                    proj.VernacularWritingSystem.Bcp47 = entry.CitationForm.FirstValue.Key;
                    await _projService.Update(_projectId, proj);
                }
            }
            else if (!entry.LexicalForm.IsEmpty) // lexeme form for backup
            {
                newWord.Vernacular = entry.LexicalForm.FirstValue.Value.Text;
                if (proj.VernacularWritingSystem.Bcp47 == "")
                {
                    proj.VernacularWritingSystem.Bcp47 = entry.LexicalForm.FirstValue.Key;
                    await _projService.Update(_projectId, proj);
                }
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
                var newSense = new Sense { SemanticDomains = new List<SemanticDomain>(), Glosses = new List<Gloss>() };

                // Add glosses
                foreach ((var key, var value) in sense.Gloss)
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
                    newSense.SemanticDomains.Add(new SemanticDomain { Id = splitSemDom[0], Name = splitSemDom[1] });
                }

                newWord.Senses.Add(newSense);
            }

            // Add plural
            foreach (var field in entry.Fields)
            {
                if (field.Type == "Plural")
                {
                    foreach (var plural in field.Content)
                    {
                        var PluralForm = entry.Fields.First().Content.First().Value.Text;
                        newWord.Plural = PluralForm;
                    }
                }
            }

            // Get path to dir containing local lift package ~/{projectId}/Import/ExtractedLocation
            var importDir = FileUtilities.GenerateFilePath(
                FileUtilities.FileType.Dir, false, "", Path.Combine(_projectId, "Import"));
            var extractedPathToImport = Path.Combine(importDir, "ExtractedLocation");

            // Get path to directory with audio files ~/{projectId}/Import/ExtractedLocation/{liftName}/audio
            var importListArr = Directory.GetDirectories(extractedPathToImport);
            var extractedAudioDir = Path.Combine(importListArr.Single(), "audio");

            // Only add audio if the files exist
            if (Directory.Exists(extractedAudioDir))
            {
                // Add audio
                foreach (var pro in entry.Pronunciations)
                {
                    // get path to audio file in lift package at
                    // ~/{projectId}/Import/ExtractedLocation/{liftName}/audio/{audioFile}.mp3
                    var audioFile = pro.Media.First().Url;
                    newWord.Audio.Add(audioFile);
                }
            }

            newWord.ProjectId = _projectId;
            await _repo.Create(newWord);
        }

        /// <summary> Creates the object to transfer all the data from a word </summary>
        public LiftEntry GetOrMakeEntry(Extensible info, int order)
        {
            return new LiftEntry(info, new Guid(), order)
            {
                LexicalForm = new LiftMultiText(),
                CitationForm = new LiftMultiText()
            };
        }

        /// <summary> Creates an empty sense object and adds it to the entry </summary>
        public LiftSense GetOrMakeSense(LiftEntry entry, Extensible info, string rawXml)
        {
            var sense = new LiftSense(info, new Guid(), entry) { Gloss = new LiftMultiText() };
            entry.Senses.Add(sense);
            return sense;
        }

        /// <summary> Adds each citation form to the entry for the vernacular </summary>
        public void MergeInCitationForm(LiftEntry entry, LiftMultiText contents)
        {
            foreach ((var key, var value) in contents)
            {
                entry.CitationForm.Add(key, value.Text);
            }
        }

        /// <summary> Adds field to the entry for plural forms </summary>
        public void MergeInField(LiftObject extensible, string typeAttribute, DateTime dateCreated,
            DateTime dateModified, LiftMultiText contents, List<Trait> traits)
        {
            var textEntry = new LiftMultiText(contents.FirstValue.Key.ToString(),
                contents.FirstValue.Value.Text.ToString());
            var fieldEntry = new LiftField(typeAttribute, textEntry);
            extensible.Fields.Add(fieldEntry);
        }

        /// <summary> Adds senses to the entry </summary>
        public void MergeInGloss(LiftSense sense, LiftMultiText multiText)
        {
            foreach ((var key, var value) in multiText)
            {
                sense.Gloss.Add(key, value.Text);
            }
        }

        /// <summary> Adds each lexeme form to the entry for the vernacular </summary>
        public void MergeInLexemeForm(LiftEntry entry, LiftMultiText contents)
        {
            foreach ((var key, var value) in contents)
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

        /// <summary> Adds in each semantic domain to a list </summary>
        public void ProcessRangeElement(string range, string id, string guid, string parent,
            LiftMultiText description, LiftMultiText label, LiftMultiText abbrev, string rawXml)
        {
            /*uncomment this if you want to import semantic domains from a lift-ranges file*/
            //if (range == "semantic-domain-ddp4")
            //{
            //    _sdList.Add(new SemanticDomain() { Name = label.ElementAt(0).Value.Text, Id = abbrev.First().Value.Text });
            //}
        }

        // The following are unused and are not implemented, but may still be called by the Lexicon Merger
        // They may be useful later if we need to add more complex attributes to words in The Combine
        public LiftExample GetOrMakeExample(LiftSense sense, Extensible info)
        {
            return new LiftExample() { Content = new LiftMultiText() };
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
        { return new LiftEtymology(); }
        public LiftObject MergeInReversal(LiftSense sense, LiftObject parent, LiftMultiText contents, string type,
            string rawXml)
        { return new LiftReversal(); }

        public LiftObject MergeInVariant(LiftEntry entry, LiftMultiText contents, string rawXml)
        {
            return new LiftVariant();
        }
        public void EntryWasDeleted(Extensible info, DateTime dateDeleted) { }
        public void MergeInDefinition(LiftSense sense, LiftMultiText liftMultiText) { }
        public void MergeInExampleForm(LiftExample example, LiftMultiText multiText) { }
        public void MergeInGrammaticalInfo(LiftObject senseOrReversal, string val, List<Trait> traits) { }
        public void MergeInNote(LiftObject extensible, string type, LiftMultiText contents, string rawXml) { }
        public void MergeInPicture(LiftSense sense, string href, LiftMultiText caption) { }
        public void MergeInRelation(LiftObject extensible, string relationTypeName, string targetId, string rawXml) { }
        public void MergeInSource(LiftExample example, string source) { }
        public void MergeInTranslationForm(LiftExample example, string type, LiftMultiText multiText, string rawXml) { }
        public void ProcessFieldDefinition(string tag, LiftMultiText description) { }
    }
}
