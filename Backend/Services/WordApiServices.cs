using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BackendFramework.Services
{
    public class WordService : IWordService
    {
        private readonly IWordRepository _repo;

        public WordService(IWordRepository repo)
        {
            _repo = repo;
        }

        public async Task<bool> Delete(string Id)
        {
            var wordIsInFrontier = _repo.DeleteFrontier(Id).Result;

            if (wordIsInFrontier)
            {
                Word wordToDelete = _repo.GetWord(Id).Result;
                wordToDelete.Id = null;
                wordToDelete.History.Add(Id);

                await _repo.Create(wordToDelete);
            }
            return wordIsInFrontier;
        }

        public async Task<bool> Update(string Id, Word word)
        {
            var wordIsInFrontier = _repo.DeleteFrontier(Id).Result;
            if (wordIsInFrontier)
            {
                word.Id = null;
                word.History = new List<string> { Id };

                await _repo.Create(word);
            }
            return wordIsInFrontier;
        }

        public async Task<Word> Merge(MergeWords mergeWords)
        {
            List<string> parentHistory = new List<string>();
            foreach (string childId in mergeWords.Children)
            {
                await _repo.DeleteFrontier(childId);

                Word childWord = _repo.GetWord(childId).Result;
                childWord.History = new List<string> { childId };
                childWord.Id = null;

                await _repo.Add(childWord);
                parentHistory.Add(childWord.Id);
            }

            string parentId = mergeWords.Parent;

            await _repo.DeleteFrontier(parentId);

            parentHistory.Add(parentId);

            Word parentWord = _repo.GetWord(parentId).Result;
            parentWord.History = parentHistory;
            parentWord.Id = null;

            await _repo.Create(parentWord);
            return parentWord;
        }
    }
}