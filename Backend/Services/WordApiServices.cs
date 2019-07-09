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

        public async Task<bool> Delete(string projectId, string wordId)
        {
            var wordIsInFrontier = _repo.DeleteFrontier(projectId, wordId).Result;

            if (wordIsInFrontier)
            {
                Word wordToDelete = _repo.GetWord(projectId, wordId).Result;
                wordToDelete.Id = null;
                wordToDelete.History.Add(wordId);

                foreach(var senseAcc in wordToDelete.Senses)
                {
                    senseAcc.Accessibility = (int)state.deleted;
                }

                await _repo.Create(wordToDelete);
            }
            return wordIsInFrontier;
        }

        public async Task<bool> Update(string projectId, string wordId, Word word)
        {
            var wordIsInFrontier = _repo.DeleteFrontier(projectId, wordId).Result;
            if (wordIsInFrontier)
            {
                word.Id = null;
                word.ProjectId = projectId;

                //If the word already has a history you dont want to overwrite it
                if (word.History == null)
                {
                    word.History = new List<string> { wordId };
                }
                else
                {
                    word.History.Add(wordId);
                }

                await _repo.Create(word);
            }
            return wordIsInFrontier;
        }

        public async Task<Word> Merge(string projectId, MergeWords mergeWords)
        {

            //generate new child words form child word field
            foreach(var newChildWordState in mergeWords.ChildrenWords)
            {
                //get child word
                var currentChildWord = await _repo.GetWord(projectId, newChildWordState.SrcWordID);
                //remove child from frontier
                await _repo.DeleteFrontier(projectId, currentChildWord.Id);

                //iterate through senses of that word and change to corresponding state in mergewords
                for(int i = 0; i < currentChildWord.Senses.Count; i++)
                {
                    currentChildWord.Senses[i].Accessibility = (int)newChildWordState.SenseStates[i];
                }

                //change the child words history to its previous self
                currentChildWord.History = new List<string>() { newChildWordState.SrcWordID };

                //add child word to the database
                currentChildWord.Id = null;
                var newChildWord = await _repo.Add(currentChildWord);

                //add new child word to the parents history
                mergeWords.Parent.History.Add(newChildWord.Id);
            }

            //add parent with child history to the datbase
            mergeWords.Parent.ProjectId = projectId;
            var newParent = await _repo.Add(mergeWords.Parent);
            await _repo.AddFrontier(newParent);

            return newParent;
        }
    }
}
