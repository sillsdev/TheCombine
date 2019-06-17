using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Backend.Tests
{
    public class WordRepositoryMock : IWordRepository
    {

        List<Word> words;
        List<Word> frontier;

        public WordRepositoryMock()
        {
            words = new List<Word>();
            frontier = new List<Word>();
        }

        public Task<List<Word>> GetAllWords()
        {
            return Task.FromResult(words.Select(word => word.Clone()).ToList());
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
            var copiedWords = foundWords.Select(word => word.Clone()).ToList();
            return Task.FromResult(copiedWords);
        }

        public Task<Word> Create(Word word)
        {
            word.Id = Guid.NewGuid().ToString();
            words.Add(word.Clone());
            AddFrontier(word.Clone());
            return Task.FromResult(word.Clone());
        }

        public Task<bool> DeleteAllWords()
        {
            words.Clear();
            return Task.FromResult(true);
        }

        public Task<List<Word>> GetFrontier()
        {
            return Task.FromResult(frontier.Select(word => word.Clone()).ToList());
        }

        public Task<Word> AddFrontier(Word word)
        {
            frontier.Add(word.Clone());
            return Task.FromResult(word.Clone());
        }

        public Task<bool> DeleteFrontier(string id)
        {
            var origLength = frontier.Count;
            frontier.RemoveAll(word => word.Id == id);
            return Task.FromResult(origLength != frontier.Count);

        }

        public Task<Word> Add(Word word)
        {
            word.Id = Guid.NewGuid().ToString();
            words.Add(word.Clone());
            return Task.FromResult(word.Clone());
        }
    }
}
