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
using System.Text.RegularExpressions;

namespace BackendFramework.Services
{

    public class WordService : IWordService
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

        public async Task<List<Word>> GetRegexSearch(Regex reg)
        {
            var regex = new BsonRegularExpression(reg);
            var query = Query<Word>.Matches(p => p.Item, regex);
            MongoCursor<Product> cursor = collection.Find(query);
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
            if (wordIsInFrontier) {
                List<string> ids = new List<string>();
                ids.Add(Id);
                Word wordToDelete = GetWords(ids).Result.First();
                wordToDelete.Id = null;
                wordToDelete.Accessability = (int) state.deleted;
                wordToDelete.History = ids;
                await Create(wordToDelete);
            }
            return wordIsInFrontier;
        }

        public async Task<bool> Update(string Id, Word word)
        {
            var wordIsInFrontier = DeleteFrontier(Id).Result;
            if (wordIsInFrontier) {
                word.Id = null;
                word.Accessability = (int) state.active;
                word.History = new List<string>{Id};
                await Create(word);
            }
            return wordIsInFrontier;
        }

        public async Task<Word> Merge(MergeWords mergeWords)
        {
            List<string> parentHistory = new List<string>();
            foreach(string childId in mergeWords.children)
            {
                await DeleteFrontier(childId);
                Word childWord = GetWords(new List<string>(){childId}).Result.First();
                childWord.History = new List<string>{childId};
                childWord.Accessability = (int) mergeWords.mergeType; // 2: sense or 3: duplicate
                childWord.Id = null;
                await _wordDatabase.Words.InsertOneAsync(childWord);
                parentHistory.Add(childWord.Id);
            }
            string parentId = mergeWords.parent;
            await DeleteFrontier(parentId);
            parentHistory.Add(parentId);
            Word parentWord = GetWords(new List<string>(){parentId}).Result.First();
            parentWord.History = parentHistory;
            parentWord.Accessability = (int) state.active;
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
    }


}