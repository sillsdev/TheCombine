using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using MongoDB.Driver;
using SIL.DictionaryServices.Lift;
using SIL.DictionaryServices.Model;
using SIL.Lift;
using SIL.Lift.Options;
using SIL.Lift.Parsing;
using SIL.Text;
using SIL.WritingSystems;
using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using static SIL.DictionaryServices.Lift.LiftWriter;

namespace BackendFramework.Services
{
    public class CombineLiftWriter : LiftWriter
    {
        public CombineLiftWriter(string path, ByteOrderStyle byteOrderStyle) : base(path, byteOrderStyle)
        {
        }

        public CombineLiftWriter(StringBuilder builder, bool produceFragmentOnly) : base(builder, produceFragmentOnly)
        {
        }

        protected override void InsertPronunciationIfNeeded(LexEntry entry, List<string> propertiesAlreadyOutput)
        {
            if (entry.Pronunciations.FirstOrDefault() != null && entry.Pronunciations.First().Forms.Count() > 0)
            {
                Writer.WriteStartElement("pronunciation");
                Writer.WriteStartElement("media");

                foreach (var pro in entry.Pronunciations)
                {
                    Writer.WriteAttributeString("href", entry.Pronunciations.First().Forms.First().Form);
                }

                //makes sure the writer does not write it again
                entry.Pronunciations.Clear();

                Writer.WriteEndElement();
                Writer.WriteEndElement();
            }
        }
    }

    public class LiftService : ILexiconMerger<LiftObject, LiftEntry, LiftSense, LiftExample>
    {


        private readonly IWordRepository _repo;
        private readonly IProjectService _projService;
        private string projectId;
        private List<SemanticDomain> sdList;

        public LiftService(IWordRepository repo, IProjectService projserv)
        {
            _repo = repo;
            _projService = projserv;
            sdList = new List<SemanticDomain>();
        }
        public void SetProject(string id)
        {
            projectId = id;
        }

        public void LdmlImport(string filePath, string langTag)
        {
            // SLDR is the SIL Locale Data repository, it is necessary for reading/writing ldml and 
            // It is being initialized in offline mode here to only pull local data
            Sldr.Initialize(true);
            try
            {
                var wsr = LdmlInFolderWritingSystemRepository.Initialize(filePath);
                var wsf = new LdmlInFolderWritingSystemFactory(wsr);
                wsf.Create(langTag, out WritingSystemDefinition wsDef);

                try
                {
                    if (wsDef.CharacterSets["main"] != null)
                    {
                        var newProj = _projService.GetProject(projectId).Result;
                        newProj.ValidCharacters = wsDef.CharacterSets["main"].Characters.ToList();
                        _projService.Update(projectId, newProj);
                    }
                }
                catch
                {
                    //do nothing, there is no main character set
                }
            }
            finally
            {
                Sldr.Cleanup();
            }
        }

        private void LdmlExport(string filePath, string langTag)
        {
            Sldr.Initialize(true);
            var wsr = LdmlInFolderWritingSystemRepository.Initialize(filePath);
            var wsf = new LdmlInFolderWritingSystemFactory(wsr);

            //There are no existing writing systems in this folder
            wsf.Create(langTag, out WritingSystemDefinition wsDef);

            var proj = _projService.GetProject(projectId).Result;
            if (!wsDef.CharacterSets.TryGet("main", out CharacterSetDefinition chars))
            {
                chars = new CharacterSetDefinition("main");
                wsDef.CharacterSets.Add(chars);
            }
            //= wsDef.CharacterSets["main"];

            chars.Characters.Clear();
            foreach (var character in proj.ValidCharacters)
            {
                chars.Characters.Add(character);
            }
            wsr.Set(wsDef);
            wsr.Save();
            Sldr.Cleanup();
        }

        /********************************
        * Lift Export Implementation
        ********************************/

        public void LiftExport(string projectId)
        {
            //the helper tag must be included because there are also SIL.Utilitites
            Helper.Utilities util = new Helper.Utilities();

            //generate the zip dir
            string filename = util.GenerateFilePath(Helper.Utilities.filetype.dir, true, "", Path.Combine(projectId, "Export"));
            string zipdir = Path.Combine(filename, "LiftExport");
            Directory.CreateDirectory(zipdir);

            //generates file to be exported to
            string exportFilePath = Path.Combine(zipdir, "EXPORTED-" + Path.GetRandomFileName());

            //add audio dir inside zip dir
            string audiodir = Path.Combine(zipdir, "Audio");
            Directory.CreateDirectory(audiodir);
            string filepath = Path.Combine(zipdir, "NewLiftFile.lift");

            CombineLiftWriter writer = new CombineLiftWriter(filepath, ByteOrderStyle.BOM);   //noBOM will work with PrinceXML

            string header =
                @"
                    <ranges>
                        <range id = ""semantic-domain-ddp4"" href = ""file://C:/Users/FullerM/Documents/TheCombine/Backend.Tests/bin/testingdata.lift-ranges""/>
                    </ranges>
                    <fields>
                        <field tag = ""Plural"">
                            <form lang = ""en""><text></text></form>
                             <form lang = ""qaa-x-spec""><text> Class = LexEntry; Type = String; WsSelector = kwsVern </text></form>
                        </field>
                    </fields>
                ";

            writer.WriteHeader(header);

            var allWords = _repo.GetAllWords(projectId).Result;

            foreach (Word wordEntry in allWords)
            {
                LexEntry entry = new LexEntry();

                //add vernacular (lexical form)
                AddVern(projectId, wordEntry, entry);

                string audioSrc = Path.Combine(filename, "zips");
                AddAudio(entry, wordEntry, audiodir);

                //add sense
                AddSense(entry, wordEntry);

                writer.Add(entry);
            }
            writer.End();

            //export ldml
            string ldmlDir = Path.Combine(zipdir, "WritingSystems");
            Directory.CreateDirectory(ldmlDir);
            var proj = _projService.GetProject(projectId).Result;
            LdmlExport(ldmlDir, proj.VernacularWritingSystem);

            ZipFile.CreateFromDirectory(zipdir, Path.Combine(zipdir, Path.Combine("..", "LiftExportCompressed-" + Path.GetRandomFileName() + ".zip")));
        }

        public void AddVern(string projectId, Word wordEntry, LexEntry entry)
        {
            LiftMultiText lexMultiText = new LiftMultiText();
            string lang = _projService.GetProject(projectId).Result.VernacularWritingSystem;
            lexMultiText.Add(lang, wordEntry.Vernacular);
            entry.LexicalForm.MergeIn(MultiText.Create(lexMultiText));
        }

        public void AddAudio(LexEntry entry, Word wordEntry, string path)
        {
            try
            {
                if (wordEntry.Audio != "")
                {
                    LexPhonetic lexPhonetic = new LexPhonetic();
                    string dest = Path.Combine(path, wordEntry.Audio);

                    Helper.Utilities util = new Helper.Utilities();
                    string src = Path.Combine(util.GenerateFilePath(Helper.Utilities.filetype.audio, true), wordEntry.Audio);
                    File.Copy(src, dest, true);

                    LiftMultiText proMultiText = new LiftMultiText { { "href", dest } };
                    lexPhonetic.MergeIn(MultiText.Create(proMultiText));
                    entry.Pronunciations.Add(lexPhonetic);
                }
            }
            catch (FileNotFoundException)
            {
                //do nothing, the audio file isnt there so it wont be added
            }
        }

        public void AddSense(LexEntry entry, Word wordEntry)
        {
            for (int i = 0; i < wordEntry.Senses.Count; i++)
            {
                Dictionary<string, string> dict = new Dictionary<string, string>();
                foreach (Gloss gloss in wordEntry.Senses[i].Glosses)
                {
                    //add gloss
                    dict.Add(gloss.Language, gloss.Def);
                }

                LexSense lexSense = new LexSense();
                lexSense.Gloss.MergeIn(MultiTextBase.Create(dict));
                entry.Senses.Add(lexSense);


                foreach (var semdom in wordEntry.Senses[i].SemanticDomains)
                {
                    //add semantic domain
                    var orc = new OptionRefCollection();
                    orc.Add(semdom.Id + " " + semdom.Name);

                    entry.Senses[i].Properties.Add(new KeyValuePair<string, IPalasoDataObjectProperty>("semantic-domain-ddp4", orc));

                }
            }
        }


        /**************************************
         * Import Lift File from Http req
         * ***********************************/

        public async void FinishEntry(LiftEntry entry)
        {
            Word newWord = new Word();
            var proj = _projService.GetProject(projectId).Result;

            //add vernacular
            if (!entry.CitationForm.IsEmpty) //prefer citation form for vernacular
            {
                newWord.Vernacular = entry.CitationForm.FirstValue.Value.Text;
                if (proj.VernacularWritingSystem == "")
                {
                    proj.VernacularWritingSystem = entry.CitationForm.FirstValue.Key;
                    await _projService.Update(projectId, proj);
                }
            }
            else if (!entry.LexicalForm.IsEmpty) //lexeme form for backup
            {
                newWord.Vernacular = entry.LexicalForm.FirstValue.Value.Text;
                if (proj.VernacularWritingSystem == "")
                {
                    proj.VernacularWritingSystem = entry.LexicalForm.FirstValue.Key;
                    await _projService.Update(projectId, proj);
                }
            }
            else //this is not a word
            {
                return;
            }

            if (proj.SemanticDomains.Count == 0)
            {
                proj.SemanticDomains = sdList;
                await _projService.Update(projectId, proj);
            }

            //add plural
            foreach (var field in entry.Fields)
            {
                foreach (var plural in field.Content)
                {
                    string PluralForm = entry.Fields.First().Content.First().Value.Text;
                    newWord.Plural = PluralForm;
                }
            }

            //setup file path for audio files
            Helper.Utilities util = new Helper.Utilities();

            //path to Import file ~/AmbigProjName/Import
            var extractedPathToImport = util.GenerateFilePath(Helper.Utilities.filetype.dir, false, "", Path.Combine(projectId, "Import"));

            //get path to ~/AmbigProjName/Import/ExtractedLiftDir/audio
            var importListArr = Directory.GetDirectories(extractedPathToImport);
            var extractedAudioDir = Path.Combine(importListArr.Single(), "audio");

            if (Directory.Exists(extractedAudioDir))
            {
                //try to read audio b/c it's prob there
                //add audio
                foreach (var pro in entry.Pronunciations)
                {
                    newWord.Audio = pro.Media.FirstOrDefault().Url;

                    //get path to ~/AmbigProjName/Import/ExtractedLiftDir/Audio/word mp3
                    var extractedAudioMp3 = Path.Combine(extractedAudioDir, newWord.Audio);

                    //move mp3 to audio folder at ~/AmbigProjName/Import/ExtractedLiftDir/Audio/word.mp3
                    var audioFolder = Path.Combine(extractedPathToImport, "Audio");
                    Directory.CreateDirectory(audioFolder);
                    var audioDest = Path.Combine(audioFolder, newWord.Audio);

                    //if there are duplicate filenames then add a (number) like windows does to the end of it
                    int filecount = 1;
                    var filename = Path.GetFileNameWithoutExtension(audioDest);

                    while (File.Exists(audioDest))
                    {
                        audioDest = Path.Combine(audioFolder, filename + "(" + filecount++ + ")" + ".mp3");
                    }
                    File.Copy(extractedAudioMp3, audioDest);
                }
            }

            //add senses
            newWord.Senses = new List<Sense>();
            foreach (var sense in entry.Senses)
            {
                Sense newSense = new Sense();
                newSense.SemanticDomains = new List<SemanticDomain>();
                newSense.Glosses = new List<Gloss>();

                //add semantic domains
                List<string> SemanticDomainStrings = new List<string>();
                foreach (var trait in sense.Traits)
                {
                    Regex rgx = new Regex(@"semantic-domain");
                    if (rgx.IsMatch(trait.Name))
                    {
                        SemanticDomainStrings.Add(trait.Value);
                    }
                }
                foreach (var SemanticDomainString in SemanticDomainStrings)
                {
                    string[] words = SemanticDomainString.Split(" ");

                    SemanticDomain newSemanticDomain = new SemanticDomain();
                    newSemanticDomain.Id = words[0];

                    for (int i = 1; i < words.Length - 1; i++)
                    {
                        newSemanticDomain.Name += words[i] + " ";
                    }
                    newSemanticDomain.Name += words.Last();

                    newSense.SemanticDomains.Add(newSemanticDomain);
                }

                //add glosses
                foreach (var gloss in sense.Gloss)
                {
                    Gloss newGloss = new Gloss();
                    newGloss.Language = gloss.Key;
                    newGloss.Def = gloss.Value.Text;

                    newSense.Glosses.Add(newGloss);
                }

                newWord.Senses.Add(newSense);
            }

            newWord.ProjectId = projectId;
            await _repo.Create(newWord);
        }

        public LiftEntry GetOrMakeEntry(Extensible info, int order)
        {
            return new EmptyLiftEntry(info, new Guid(), order);
        }

        public LiftSense GetOrMakeSense(LiftEntry entry, Extensible info, string rawXml)
        {
            EmptyLiftSense sense = new EmptyLiftSense(info, new Guid(), entry);
            entry.Senses.Add(sense);
            return sense;
        }

        public void MergeInCitationForm(LiftEntry entry, LiftMultiText contents)
        {
            foreach (var value in contents)
            {
                entry.CitationForm.Add(value.Key, value.Value.Text);
            }
        }

        public void MergeInField(LiftObject extensible, string typeAttribute, DateTime dateCreated, DateTime dateModified, LiftMultiText contents, List<Trait> traits)
        {
            LiftMultiText textentry = new LiftMultiText(contents.FirstValue.Key.ToString(), contents.FirstValue.Value.Text.ToString());
            LiftField fieldentry = new LiftField(typeAttribute, textentry);
            extensible.Fields.Add(fieldentry);
        }

        public void MergeInGloss(LiftSense sense, LiftMultiText multiText)
        {
            foreach (var value in multiText)
            {
                sense.Gloss.Add(value.Key, value.Value.Text);
            }
        }

        public void MergeInLexemeForm(LiftEntry entry, LiftMultiText contents)
        {
            foreach (var key in contents)
            {
                entry.LexicalForm.Add(key.Key, key.Value);
            }
        }

        public void MergeInTrait(LiftObject extensible, Trait trait)
        {
            LiftTrait newTrait = new LiftTrait();
            newTrait.Name = trait.Name;
            newTrait.Value = trait.Value;
            extensible.Traits.Add(newTrait);
        }

        public LiftObject MergeInPronunciation(LiftEntry entry, LiftMultiText contents, string rawXml)
        {
            var audioFile = Regex.Split(rawXml, "\"")[1];
            LiftPhonetic phonetic = new LiftPhonetic();
            LiftUrlRef url = new LiftUrlRef { Url = audioFile };
            phonetic.Media.Add(url);
            entry.Pronunciations.Add(phonetic);
            return entry;
        }

        // The following are unused and are not implemented, but must stay to satisfy the needs of the ILexiconMerger 
        public LiftExample GetOrMakeExample(LiftSense sense, Extensible info)
        {
            return new EmptyLiftExample();
        }

        public LiftObject GetOrMakeParentReversal(LiftObject parent, LiftMultiText contents, string type)
        {
            return new EmptyLiftObject();
        }

        public LiftSense GetOrMakeSubsense(LiftSense sense, Extensible info, string rawXml)
        {
            return new EmptyLiftSense(info, new Guid(), sense);
        }

        public LiftObject MergeInEtymology(LiftEntry entry, string source, string type, LiftMultiText form, LiftMultiText gloss, string rawXml)
        {
            return new EmptyLiftObject();
        }

        public LiftObject MergeInReversal(LiftSense sense, LiftObject parent, LiftMultiText contents, string type, string rawXml)
        {
            return new EmptyLiftObject();
        }

        public LiftObject MergeInVariant(LiftEntry entry, LiftMultiText contents, string rawXml)
        {
            return new EmptyLiftObject();
        }

        public void EntryWasDeleted(Extensible info, DateTime dateDeleted) { }

        public void MergeInDefinition(LiftSense sense, LiftMultiText liftMultiText) { }

        public void MergeInExampleForm(LiftExample example, LiftMultiText multiText) { }

        public void MergeInGrammaticalInfo(LiftObject senseOrReversal, string val, List<Trait> traits) { }

        public void MergeInMedia(LiftObject pronunciation, string href, LiftMultiText caption) { }

        public void MergeInNote(LiftObject extensible, string type, LiftMultiText contents, string rawXml) { }

        public void MergeInPicture(LiftSense sense, string href, LiftMultiText caption) { }

        public void MergeInRelation(LiftObject extensible, string relationTypeName, string targetId, string rawXml) { }

        public void MergeInSource(LiftExample example, string source) { }

        public void MergeInTranslationForm(LiftExample example, string type, LiftMultiText multiText, string rawXml) { }

        public void ProcessFieldDefinition(string tag, LiftMultiText description) { }

        public void ProcessRangeElement(string range, string id, string guid, string parent, LiftMultiText description, LiftMultiText label, LiftMultiText abbrev, string rawXml)
        {
            if (range == "semantic-domain-ddp4")
            {
                sdList.Add(new SemanticDomain() { Name = label.First().Value.Text, Id = abbrev.First().Value.Text });
            }
        }
    }

    public class EmptyLiftObject : LiftObject
    {
        public EmptyLiftObject() : base()
        {

        }

        public override string XmlTag => throw new NotImplementedException();
    }

    public class EmptyLiftEntry : LiftEntry
    {
        public EmptyLiftEntry(Extensible info, Guid guid, int order) : base(info, guid, order)
        {
            LexicalForm = new LiftMultiText();
            CitationForm = new LiftMultiText();
        }

        public override string XmlTag => throw new NotImplementedException();
    }

    public class EmptyLiftSense : LiftSense
    {
        public EmptyLiftSense(Extensible info, Guid guid, LiftObject owner) : base(info, guid, owner)
        {
            Gloss = new LiftMultiText();
        }

        public override string XmlTag => throw new NotImplementedException();
    }

    public class EmptyLiftExample : LiftExample
    {
        public EmptyLiftExample() : base()
        {
            Content = new LiftMultiText();
        }

        public override string XmlTag => throw new NotImplementedException();
    }
}