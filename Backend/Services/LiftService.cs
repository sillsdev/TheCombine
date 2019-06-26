using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using MongoDB.Driver;
using SIL.DictionaryServices.Lift;
using SIL.DictionaryServices.Model;
using SIL.Lift;
using SIL.Lift.Options;
using SIL.Lift.Parsing;
using SIL.Text;
using System;
using System.Collections.Generic;
using System.IO;
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
            if (entry.Pronunciations.First().Forms.Count() > 0)
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

        public LiftService(IWordRepository repo, IProjectService projserv)
        {
            _repo = repo;
            _projService = projserv;
        }

        /********************************
        * LIft Export Implementation
        ********************************/
        public void LiftExport(string Id)
        {
            string wanted_path = Path.GetDirectoryName(Path.GetDirectoryName(System.IO.Directory.GetCurrentDirectory()));
            string filepath = wanted_path + "/EXAMPLE.lift";
            CombineLiftWriter writer = new CombineLiftWriter(filepath, ByteOrderStyle.BOM);   //noBOM will work with PrinceXML

            //no longer uses @ for sake of indentation
            //very messy
            string header =
                "\n\t\t<ranges>\n" +
                "\t\t\t<range id = \"semantic-domain-ddp4\" href = \"file://C:/Users/FullerM/Documents/TheCombine/Backend.Tests/bin/testingdata.lift-ranges\"/>\n" +
                "\t\t</ranges>\n" +
                "\t\t<fields>\n" +
                "\t\t\t<field tag = \"Plural\">\n" +
                "\t\t\t\t<form lang = \"en\"><text></text></form>\n" +
                "\t\t\t\t<form lang = \"qaa-x-spec\"><text> Class = LexEntry; Type = String; WsSelector = kwsVern </text></form>\n" +
                "\t\t\t</field>\n" +
                "\t\t</fields>\n\t";
            //@"
            //        <ranges>
            //            <range id = ""semantic-domain-ddp4"" href = ""file://C:/Users/FullerM/Documents/TheCombine/Backend.Tests/bin/testingdata.lift-ranges""/>
            //        </ranges>
            //        <fields>
            //            <field tag = ""Plural"">
            //                <form lang = ""en""><text></text></form>
            //                <form lang = ""qaa-x-spec""><text> Class = LexEntry; Type = String; WsSelector = kwsVern </text></form>
            //            </field>
            //        </fields>
            //";

            writer.WriteHeader(header);

            var allWords = _repo.GetAllWords().Result;

            foreach (Word wordEntry in allWords )
            {
                LexEntry entry = new LexEntry();

                //add vernacular (lexical form)
                LiftMultiText lexMultiText = new LiftMultiText();
                string lang = _projService.GetProject(Id).Result.VernacularWritingSystem;
                lexMultiText.Add(lang, wordEntry.Vernacular);
                entry.LexicalForm.MergeIn(MultiText.Create(lexMultiText));

                //add audio (pronunciation media)
                LexPhonetic lexPhonetic = new LexPhonetic();
                LiftMultiText proMultiText = new LiftMultiText{ { "href", wordEntry.Audio } };
                lexPhonetic.MergeIn(MultiText.Create(proMultiText));
                entry.Pronunciations.Add(lexPhonetic);

                //add sense
                foreach (Sense sense in wordEntry.Senses)
                {
                    foreach(var semdom in sense.SemanticDomains)
                    {
                        //add semantic domain
                        var orc = new OptionRefCollection();
                        orc.Add(semdom.Number + " " + semdom.Name);
                        entry.Properties.Add(new KeyValuePair<string, IPalasoDataObjectProperty>("semantic-domain-ddp4", orc));
                    }

                    foreach (Gloss gloss in sense.Glosses)
                    {
                        //add gloss/def
                        LiftMultiText senseMultiText = new LiftMultiText{ { gloss.Language, gloss.Def } };
                        entry.GetOrCreateSenseWithMeaning(MultiText.Create(senseMultiText));
                    }
                }
                writer.Add(entry);
            }
            writer.End();
        }

        /**************************************
         * Import Lift File from Http req
         * ***********************************/

        public async void FinishEntry(LiftEntry entry)
        {
            Word newWord = new Word();

            //add vernacular
            string LexicalForm = entry.LexicalForm.FirstValue.Value.Text;
            newWord.Vernacular = LexicalForm;

            //add plural
            foreach (var field in entry.Fields)
            {
                foreach (var plural in field.Content)
                {
                    string PluralForm = entry.Fields.First().Content.First().Value.Text;
                    newWord.Plural = PluralForm;
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
                    newSemanticDomain.Number = words[0];

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

        public LiftObject MergeInPronunciation(LiftEntry entry, LiftMultiText contents, string rawXml)
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

        public void ProcessRangeElement(string range, string id, string guid, string parent, LiftMultiText description, LiftMultiText label, LiftMultiText abbrev, string rawXml) { }
        
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