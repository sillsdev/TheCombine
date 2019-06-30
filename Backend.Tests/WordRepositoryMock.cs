using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Tests
{
    public class WordRepositoryMock : IWordRepository
    {
        readonly List<Word> words;
        readonly List<Word> frontier;

        public WordRepositoryMock()
        {
            words = new List<Word>();
            frontier = new List<Word>();
        }

        public Task<List<Word>> GetAllWords()
        {
            return Task.FromResult(words.Select(word => word.Clone()).ToList());
        }

        public Task<Word> GetWord(string id)
        {
            var foundWord = words.Where(word => word.Id == id).Single();
            return Task.FromResult(foundWord.Clone());
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
            frontier.Clear();
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
