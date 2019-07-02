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
                
                foreach(var senseAcc in wordToDelete.Senses)
                {
                    senseAcc.Accessability = (int)state.deleted;
                }

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

                //If the word already has a history you dont want to overwrite it
                if (word.History == null)
                {
                    word.History = new List<string> { Id };
                }
                else
                {
                    word.History.Add(Id);
                }

                await _repo.Create(word);
            }
            return wordIsInFrontier;
        }

        public async Task<Word> Merge(MergeWords mergeWords)
        {
            
            //generate new child words form child word field
            foreach(var newChildWordState in mergeWords.ChildrenWords)
            {
                //get child word
                var currentChildWord = await _repo.GetWord(newChildWordState.Item1);
                //remove child from frontier
                _repo.DeleteFrontier(currentChildWord.Id);

                //iterate through senses of that word and change to corresponding state in mergewords
                for(int i = 0; i < currentChildWord.Senses.Count; i++)
                {
                    currentChildWord.Senses[i].Accessability = (int)newChildWordState.Item2[i];
                }

                //change the child words history to its previous self
                currentChildWord.History.Add(currentChildWord.Id);

                //add child word to the database
                currentChildWord.Id = null;
                var newChildWord = await _repo.Add(currentChildWord);

                //add new child word to the parents history
                mergeWords.Parent.History.Add(newChildWord.Id);
            }

            //add parent with child history to the datbase
            var newParent = await _repo.Add(mergeWords.Parent);
            _repo.AddFrontier(newParent);

            return newParent;
        }
    }
}