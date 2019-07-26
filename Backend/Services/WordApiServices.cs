using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using System;
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

                foreach (var senseAcc in wordToDelete.Senses)
                {
                    senseAcc.Accessibility = (int)State.deleted;
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

        public async Task<List<Word>> Merge(string projectId, MergeWords mergeWords)
        {
            var newWordsList = new List<Word>();

            var addParent = mergeWords.Parent.Clone();
            addParent.History = new List<string>();
            //generate new child words form child word field
            foreach (var newChildWordState in mergeWords.ChildrenWords)
            {
                //get child word
                var currentChildWord = await _repo.GetWord(projectId, newChildWordState.SrcWordID);
                //remove child from frontier
                await _repo.DeleteFrontier(projectId, currentChildWord.Id);

                //iterate through senses of that word and change to corresponding state in mergewords
                if (currentChildWord.Senses.Count != newChildWordState.SenseStates.Count)
                {
                    throw new FormatException("Sense counts don't match");
                }
                for (int i = 0; i < currentChildWord.Senses.Count; i++)
                {
                    currentChildWord.Senses[i].Accessibility = (int)newChildWordState.SenseStates[i];
                }

                //change the child words history to its previous self
                currentChildWord.History = new List<string>() { newChildWordState.SrcWordID };

                //add child word to the database
                currentChildWord.Id = null;
                var newChildWord = await _repo.Add(currentChildWord);

                //handle different states

                var separateWord = currentChildWord.Clone();
                separateWord.Senses = new List<Sense>();
                separateWord.Id = "";
                for (int i = 0; i < currentChildWord.Senses.Count; i++)
                {
                    switch (newChildWordState.SenseStates[i])
                    {
                        case State.sense:
                            goto case State.duplicate; //fall through
                        //add the word to the parent's history
                        case State.duplicate:
                            if (!addParent.History.Contains(currentChildWord.Id))
                            {
                                addParent.History.Add(currentChildWord.Id);
                            }
                            break;
                        //add the sense to a separate word and the word to its history
                        case State.separate:
                            separateWord.Senses.Add(currentChildWord.Senses[i]);
                            if (!separateWord.History.Contains(currentChildWord.Id))
                            {
                                separateWord.History.Add(currentChildWord.Id);
                            }
                            break;
                        default:
                            throw new NotSupportedException();
                    }
                }

                //add a new word to the database with all of the senses with separate tags from this word
                if (separateWord.Senses.Count != 0)
                {
                    separateWord.ProjectId = projectId;
                    var newSeparate = await _repo.Create(separateWord);
                    newWordsList.Add(newSeparate);
                }
            }

            //add parent with child history to the datbase
            addParent.ProjectId = projectId;
            var newParent = await _repo.Create(addParent);
            newWordsList.Insert(0, newParent);

            return newWordsList;
        }

        public async Task<bool> SearchInDuplicates(Word word)
        {
            //get all words from database
            var allWords = await _repo.GetFrontier(word.ProjectId);

            //search through all words for the correct vernacular
            var allVernaculars = allWords.FindAll(x => x.Vernacular == word.Vernacular);

            //for each matching vern check its glosses 

            /*this is terrible
                -this code block checks if a word is a "duplicate" of an already existing word

                -A duplicate is defined by:
                    -having the same vern as another word as well as...
                    -having a strict subset of the senses of the already existing word
                        -having more than a subset will immidately indicate the word is not mergeable
                    -all senses must have an strict subset of the matching sense's glosses
                        -having more than a subset will immidately indicate the word is not mergeable

                -If a word is mergeable then its semantic domains and editor 
                    will be copied into the duplicate word.
            */
            Word differences = new Word();
            bool duplicate = true;
            bool same = false;

            foreach (var matchingVern in allVernaculars)
            {
                foreach (var oldSense in matchingVern.Senses)
                {
                    int senseIndex = 0;
                    foreach (var newSense in word.Senses)
                    {
                        //if the new sense isnt a strict subset then dont bother adding anything 
                        if (newSense.Glosses.All(s => oldSense.Glosses.Contains(s)))
                        {
                            same = true;
                            foreach (var newGloss in newSense.Glosses)
                            {
                                //add semdom and edited by
                                matchingVern.EditedBy.AddRange(word.EditedBy);
                                matchingVern.Senses[senseIndex].SemanticDomains.AddRange(word.Senses[senseIndex].SemanticDomains);
                                //remove dups
                                matchingVern.EditedBy = matchingVern.EditedBy.Distinct().ToList();
                                matchingVern.Senses[senseIndex].SemanticDomains = matchingVern.Senses[senseIndex].SemanticDomains.Distinct().ToList();

                                duplicate = false;
                            }
                        }
                        else
                        {
                            //duplicate = false;
                        }
                        ++senseIndex;
                    }
                    //update the database
                    if (!duplicate && !same)
                    {
                        await Update(matchingVern.ProjectId, matchingVern.Id, matchingVern);
                    }
                    same = false;
                }
            }
            return duplicate;
        }
    }
}
