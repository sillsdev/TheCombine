using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BackendFramework.Services
{
    public class WordService : IWordService
    {
        private readonly IWordRepository _repo;
        private readonly IWordContext _wordDatabase;

        public WordService(IWordRepository repo, IWordContext collectionSettings)
        {
            _repo = repo;
            _wordDatabase = collectionSettings;
        }

        public async Task<bool> Delete(string projectId, string wordId)
        {
            var wordIsInFrontier = _repo.DeleteFrontier(projectId, wordId).Result;

            if (wordIsInFrontier)
            {
                Word wordToDelete = _repo.GetWord(projectId, wordId).Result;
                wordToDelete.Id = null;
                wordToDelete.History.Add(wordId);

                foreach (var senseAcc in wordToDelete.Senses)
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
            foreach (var newChildWordState in mergeWords.ChildrenWords)
            {
                //get child word
                var currentChildWord = await _repo.GetWord(projectId, newChildWordState.SrcWordID);
                //remove child from frontier
                await _repo.DeleteFrontier(projectId, currentChildWord.Id);

                //iterate through senses of that word and change to corresponding state in mergewords
                for (int i = 0; i < currentChildWord.Senses.Count; i++)
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

        public async Task<bool> searchInDuplicates(Word word)
        {
            //get all words from database
            var allWords = await _repo.GetAllWords(word.ProjectId);

            //search through all words for the correct vernacular
            var allVernaculars = allWords.FindAll(x => x.Vernacular == word.Vernacular);

            //for each matching vern check its glosses 

            //this is terrible
            //  -cant use .contains because no guarantee of strict subset
            //  -cant use .equals because some fields should not be included in evaluation of equality
            Word differences = new Word();
            bool duplicate = false;

            foreach (var matchingVern in allVernaculars)
            {
                foreach (var oldSense in matchingVern.Senses)
                {
                    int senseIndex = 0;
                    foreach (var newSense in word.Senses)
                    {
                        ++senseIndex;
                        //if the new sense isnt a strict subset then dont bother adding anything 
                        if (newSense.Glosses.All(s => oldSense.Glosses.Contains(s)))
                        {
                            foreach (var newGloss in newSense.Glosses)
                            {
                                //add semdom and edited by
                                matchingVern.EditedBy.AddRange(word.EditedBy);
                                matchingVern.Senses[senseIndex].SemanticDomains.AddRange(word.Senses[senseIndex].SemanticDomains);
                                //remove dups
                                matchingVern.EditedBy = matchingVern.EditedBy.Distinct().ToList();
                                matchingVern.Senses[senseIndex].SemanticDomains = matchingVern.Senses[senseIndex].SemanticDomains.Distinct().ToList();

                                duplicate = true;
                            }
                        }
                    }
                    //update the database
                    await Update(matchingVern.ProjectId, matchingVern.Id, matchingVern);
                }
            }
            return duplicate;
        }
    }
}
