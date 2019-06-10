/* Mark Fuller
 * Mongo to c# api. 
 */

using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using BackendFramework.ValueModels;
using BackendFramework.Interfaces;
using Microsoft.Extensions.Configuration;
using MongoDB.Driver;
using BackendFramework.Context;
using BackendFramework.Services;
using System.Threading.Tasks;
using MongoDB.Bson;
using System;
using SIL.Lift.Parsing;
using System.Text.RegularExpressions;

namespace BackendFramework.Services
{
    public class WordService : IWordService, ILexiconMerger<LiftObject, LiftEntry, LiftSense, LiftExample>
    {
        private readonly IWordContext _wordDatabase;

        public WordService(IWordContext collectionSettings)
        {
            _wordDatabase = collectionSettings;
        }

        public async Task<List<Word>> GetAllWords()
        {
            return await _wordDatabase.Words.Find(_ => true).ToListAsync();
        }

        public async Task<List<Word>> GetWords(List<string> Ids)
        {
            var filterDef = new FilterDefinitionBuilder<Word>();
            var filter = filterDef.In(x => x.Id, Ids);
            var wordList = await _wordDatabase.Words.Find(filter).ToListAsync();
            return wordList;
        }

        public async Task<bool> DeleteAllWords()
        {
            var deleted = await _wordDatabase.Words.DeleteManyAsync(_ => true);
            await _wordDatabase.Frontier.DeleteManyAsync(_ => true);
            if (deleted.DeletedCount != 0)
            {
                return true;
            }
            return false;
        }

        public async Task<Word> Create(Word word)
        {
            await _wordDatabase.Words.InsertOneAsync(word);
            await AddFrontier(word);
            return word;
        }

        public async Task<bool> Delete(string Id)
        {
            var wordIsInFrontier = DeleteFrontier(Id).Result;
            if (wordIsInFrontier)
            {
                List<string> ids = new List<string>();
                ids.Add(Id);
                Word wordToDelete = GetWords(ids).Result.First();
                wordToDelete.Id = null;
                wordToDelete.Accessability = (int)state.deleted;
                wordToDelete.History = ids;
                await Create(wordToDelete);
            }
            return wordIsInFrontier;
        }

        public async Task<bool> Update(string Id, Word word)
        {
            var wordIsInFrontier = DeleteFrontier(Id).Result;
            if (wordIsInFrontier)
            {
                word.Id = null;
                word.Accessability = (int)state.active;
                word.History = new List<string> { Id };
                await Create(word);
            }
            return wordIsInFrontier;
        }

        public async Task<Word> Merge(MergeWords mergeWords)
        {
            List<string> parentHistory = new List<string>();
            foreach (string childId in mergeWords.children)
            {
                await DeleteFrontier(childId);
                Word childWord = GetWords(new List<string>() { childId }).Result.First();
                childWord.History = new List<string> { childId };
                childWord.Accessability = (int)mergeWords.mergeType; // 2: sense or 3: duplicate
                childWord.Id = null;
                await _wordDatabase.Words.InsertOneAsync(childWord);
                parentHistory.Add(childWord.Id);
            }
            string parentId = mergeWords.parent;
            await DeleteFrontier(parentId);
            parentHistory.Add(parentId);
            Word parentWord = GetWords(new List<string>() { parentId }).Result.First();
            parentWord.History = parentHistory;
            parentWord.Accessability = (int)state.active;
            parentWord.Id = null;
            await Create(parentWord);
            return parentWord;
        }

        public async Task<List<Word>> GetFrontier()
        {
            return await _wordDatabase.Frontier.Find(_ => true).ToListAsync();
        }
        public async Task<Word> AddFrontier(Word word)
        {
            await _wordDatabase.Frontier.InsertOneAsync(word);
            return word;
        }
        public async Task<bool> DeleteFrontier(string Id)
        {
            var deleted = await _wordDatabase.Frontier.DeleteManyAsync(x => x.Id == Id);
            return deleted.DeletedCount > 0;
        }

        // Lift Import
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

            await Create(newWord);
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
            //throw new NotImplementedException();
            return new EmptyLiftExample();
        }

        public LiftObject GetOrMakeParentReversal(LiftObject parent, LiftMultiText contents, string type)
        {
            //throw new NotImplementedException();
            return new EmptyLiftObject();
        }

        public LiftSense GetOrMakeSubsense(LiftSense sense, Extensible info, string rawXml)
        {
            //throw new NotImplementedException();
            return new EmptyLiftSense(info, new Guid(), sense);
        }

        public LiftObject MergeInEtymology(LiftEntry entry, string source, string type, LiftMultiText form, LiftMultiText gloss, string rawXml)
        {
            //throw new NotImplementedException();
            return new EmptyLiftObject();
        }

        public LiftObject MergeInPronunciation(LiftEntry entry, LiftMultiText contents, string rawXml)
        {
            //throw new NotImplementedException();
            return new EmptyLiftObject();
        }

        public LiftObject MergeInReversal(LiftSense sense, LiftObject parent, LiftMultiText contents, string type, string rawXml)
        {
            //throw new NotImplementedException();
            return new EmptyLiftObject();
        }

        public LiftObject MergeInVariant(LiftEntry entry, LiftMultiText contents, string rawXml)
        {
            //throw new NotImplementedException();
            return new EmptyLiftObject();
        }

        public void EntryWasDeleted(Extensible info, DateTime dateDeleted)
        {
            //throw new NotImplementedException();
        }

        public void MergeInDefinition(LiftSense sense, LiftMultiText liftMultiText)
        {
            //throw new NotImplementedException();
        }

        public void MergeInExampleForm(LiftExample example, LiftMultiText multiText)
        {
            //throw new NotImplementedException();
        }

        public void MergeInGrammaticalInfo(LiftObject senseOrReversal, string val, List<Trait> traits)
        {
            //throw new NotImplementedException();
        }

        public void MergeInMedia(LiftObject pronunciation, string href, LiftMultiText caption)
        {
            //throw new NotImplementedException();
        }

        public void MergeInNote(LiftObject extensible, string type, LiftMultiText contents, string rawXml)
        {
            //throw new NotImplementedException();
        }

        public void MergeInPicture(LiftSense sense, string href, LiftMultiText caption)
        {
            //throw new NotImplementedException();
        }

        public void MergeInRelation(LiftObject extensible, string relationTypeName, string targetId, string rawXml)
        {
            //throw new NotImplementedException();
        }

        public void MergeInSource(LiftExample example, string source)
        {
            //throw new NotImplementedException();
        }

        public void MergeInTranslationForm(LiftExample example, string type, LiftMultiText multiText, string rawXml)
        {
            //throw new NotImplementedException();
        }

        public void ProcessFieldDefinition(string tag, LiftMultiText description)
        {
            //throw new NotImplementedException();
        }

        public void ProcessRangeElement(string range, string id, string guid, string parent, LiftMultiText description, LiftMultiText label, LiftMultiText abbrev, string rawXml)
        {
            //throw new NotImplementedException();
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