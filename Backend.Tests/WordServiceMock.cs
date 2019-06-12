using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using BackendFramework.ValueModels;
using BackendFramework.Interfaces;

namespace Tests
{
    public class WordServiceMock : IWordService
    {

        List<Word> words;
        List<Word> frontier;
        public WordServiceMock()
        {
            words = new List<Word>();
            frontier = new List<Word>();
        }

        public Task<List<Word>> GetAllWords()
        {
            return Task.FromResult(words.Select(word => word.Copy()).ToList());
        }

        bool IDInList(string Id, List<string> Ids)
        {
            foreach (string cur_id in Ids)
            {
                if (cur_id.Equals(Id))
                {
                    return true;
                }
            }
            return false;
        }

        public Task<List<Word>> GetWords(List<string> ids)
        {
            var foundWords = words.Where(word => IDInList(word.Id, ids)).ToList();
            var copiedWords = foundWords.Select(word => word.Copy()).ToList();
            return Task.FromResult(copiedWords);
        }

        public Task<Word> Create(Word word)
        {
            word.Id = Guid.NewGuid().ToString("N");
            words.Add(word.Copy());
            if (word.Accessability == (int)state.active || word.Accessability == (int)state.deleted)
            {
                AddFrontier(word.Copy());
            }
            return Task.FromResult(word.Copy());
        }

        public Task<bool> DeleteAllWords()
        {
            words.Clear();
            return Task.FromResult(true);
        }

        public Task<List<Word>> GetFrontier()
        {
            return Task.FromResult(frontier.Select(word => word.Copy()).ToList());
        }

        public Task<Word> AddFrontier(Word word)
        {
            frontier.Add(word.Copy());
            return Task.FromResult(word.Copy());
        }

        public Task<bool> DeleteFrontier(string id)
        {
            var origLength = frontier.Count;
            frontier.RemoveAll(word => word.Id == id);
            return Task.FromResult(origLength != frontier.Count);

        }

    }
}