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
    public class WordService : IWordService
    {
        IWordRepository _repo;

        public WordService(IWordRepository repo)
        {
            _repo = repo;
        }

        public async Task<bool> Delete(string Id)
        {
            var wordIsInFrontier = _repo.DeleteFrontier(Id).Result;
            if (wordIsInFrontier)
            {
                List<string> ids = new List<string>();
                ids.Add(Id);
                Project wordToDelete = _repo.GetWords(ids).Result.First();
                wordToDelete.Id = null;
                wordToDelete.Accessability = (int)state.deleted;
                wordToDelete.History = ids;
                await _repo.Create(wordToDelete);
            }
            return wordIsInFrontier;
        }

        public async Task<bool> Update(string Id, Project word)
        {
            var wordIsInFrontier = _repo.DeleteFrontier(Id).Result;
            if (wordIsInFrontier)
            {
                word.Id = null;
                word.Accessability = (int)state.active;
                word.History = new List<string> { Id };
                await _repo.Create(word);
            }
            return wordIsInFrontier;
        }

        public async Task<Project> Merge(MergeWords mergeWords)
        {
            List<string> parentHistory = new List<string>();
            foreach (string childId in mergeWords.children)
            {
                await _repo.DeleteFrontier(childId);
                Project childWord = _repo.GetWords(new List<string>() { childId }).Result.First();
                childWord.History = new List<string> { childId };
                childWord.Accessability = (int)mergeWords.mergeType; // 2: sense or 3: duplicate
                childWord.Id = null;
                await _repo.Add(childWord);
                parentHistory.Add(childWord.Id);
            }
            string parentId = mergeWords.parent;
            await _repo.DeleteFrontier(parentId);
            parentHistory.Add(parentId);
            Project parentWord = _repo.GetWords(new List<string>() { parentId }).Result.First();
            parentWord.History = parentHistory;
            parentWord.Accessability = (int)state.active;
            parentWord.Id = null;
            await _repo.Create(parentWord);
            return parentWord;
        }
    }
}