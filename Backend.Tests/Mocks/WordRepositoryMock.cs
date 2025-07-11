﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;

namespace Backend.Tests.Mocks
{
    internal sealed class WordRepositoryMock : IWordRepository
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
            return Task.FromResult(_words.Where(w => w.ProjectId == projectId).Select(w => w.Clone()).ToList());
        }

        public Task<Word?> GetWord(string projectId, string wordId)
        {
            try
            {
                var foundWord = _words.Single(word => word.Id == wordId);
                return Task.FromResult<Word?>(foundWord.Clone());
            }
            catch (InvalidOperationException)
            {
                return Task.FromResult<Word?>(null);
            }
        }

        public Task<Word> Create(Word word)
        {
            word.Id = Guid.NewGuid().ToString();
            _words.Add(word.Clone());
            AddFrontier(word.Clone());
            return Task.FromResult(word.Clone());
        }

        public Task<List<Word>> Create(List<Word> words)
        {
            foreach (var w in words)
            {
                Create(w);
            }
            return Task.FromResult(words);
        }

        public Task<bool> DeleteAllWords(string projectId)
        {
            _words.RemoveAll(word => word.ProjectId == projectId);
            _frontier.RemoveAll(word => word.ProjectId == projectId);
            return Task.FromResult(true);
        }

        public Task<bool> HasWords(string projectId)
        {
            return Task.FromResult(_words.Any(w => w.ProjectId == projectId));
        }

        public Task<bool> HasFrontierWords(string projectId)
        {
            return Task.FromResult(_frontier.Any(w => w.ProjectId == projectId));
        }

        public Task<bool> IsInFrontier(string projectId, string wordId)
        {
            return Task.FromResult(_frontier.Any(w => w.ProjectId == projectId && w.Id == wordId));
        }

        public Task<bool> AreInFrontier(string projectId, List<string> wordIds, int count)
        {
            return Task.FromResult(
                _frontier.Where(w => w.ProjectId == projectId && wordIds.Contains(w.Id)).Count() >= count);
        }

        public Task<List<Word>> GetFrontier(string projectId)
        {
            return Task.FromResult(_frontier.Where(w => w.ProjectId == projectId).Select(w => w.Clone()).ToList());
        }

        public Task<List<Word>> GetFrontierWithVernacular(string projectId, string vernacular)
        {
            return Task.FromResult(_frontier.Where(
                w => w.ProjectId == projectId && w.Vernacular == vernacular).Select(w => w.Clone()).ToList());
        }

        public Task<Word> AddFrontier(Word word)
        {
            _frontier.Add(word.Clone());
            return Task.FromResult(word);
        }

        public Task<List<Word>> AddFrontier(List<Word> words)
        {
            words.ForEach(w => _frontier.Add(w.Clone()));
            return Task.FromResult(words);
        }

        public Task<bool> DeleteFrontier(string projectId, string wordId)
        {
            var origLength = _frontier.Count;
            _frontier.RemoveAll(word => word.ProjectId == projectId && word.Id == wordId);
            return Task.FromResult(origLength != _frontier.Count);
        }

        public Task<long> DeleteFrontier(string projectId, List<string> wordIds)
        {
            long deletedCount = 0;
            wordIds.ForEach(id => deletedCount += _frontier.RemoveAll(
                word => word.ProjectId == projectId && word.Id == id));
            return Task.FromResult(deletedCount);
        }

        public Task<Word> Add(Word word)
        {
            word.Id = Guid.NewGuid().ToString();
            _words.Add(word.Clone());
            return Task.FromResult(word);
        }
    }
}
