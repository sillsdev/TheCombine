using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;

namespace Backend.Tests
{
    public class WordRepositoryMock : IWordRepository
    {
        private readonly List<Word> _words;
        private readonly List<Word> _frontier;

        public WordRepositoryMock()
        {
            _words = new List<Word>();
            _frontier = new List<Word>();
        }

        public Task<List<Word>> GetAllWords(string projectId)
        {
            return Task.FromResult(_words.Select(word => word.Clone()).ToList());
        }

        public Task<Word> GetWord(string projectId, string wordId)
        {
            Word foundWord = _words.Where(word => word.Id == wordId).Single();
            return Task.FromResult(foundWord.Clone());
        }

        public Task<Word> Create(Word word)
        {
            word.Id = Guid.NewGuid().ToString();
            _words.Add(word.Clone());
            AddFrontier(word.Clone());
            return Task.FromResult(word.Clone());
        }

        public Task<bool> DeleteAllWords(string projectId)
        {
            _words.Clear();
            _frontier.Clear();
            return Task.FromResult(true);
        }

        public Task<List<Word>> GetFrontier(string projectId)
        {
            return Task.FromResult(_frontier.Select(word => word.Clone()).ToList());
        }

        public Task<Word> AddFrontier(Word word)
        {
            _frontier.Add(word.Clone());
            return Task.FromResult(word.Clone());
        }

        public Task<bool> DeleteFrontier(string projectId, string wordId)
        {
            int origLength = _frontier.Count;
            _frontier.RemoveAll(word => word.Id == wordId);
            return Task.FromResult(origLength != _frontier.Count);

        }

        public Task<Word> Add(Word word)
        {
            word.Id = Guid.NewGuid().ToString();
            _words.Add(word.Clone());
            return Task.FromResult(word.Clone());
        }
    }
}
