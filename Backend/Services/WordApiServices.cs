using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace BackendFramework.Services
{
    /// <summary> More complex functions and application logic for <see cref="Word"/>s </summary>
    public class WordService : IWordService
    {
        private readonly IWordRepository _repo;

        public WordService(IWordRepository repo)
        {
            _repo = repo;
        }

        /// <summary> Makes a new word in Frontier that has deleted tag on each sense </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> Delete(string projectId, string wordId)
        {
            var wordIsInFrontier = _repo.DeleteFrontier(projectId, wordId).Result;

            //we only want to add the deleted word if the word started in the frontier
            if (wordIsInFrontier)
            {
                Word wordToDelete = _repo.GetWord(projectId, wordId).Result;
                wordToDelete.Id = "";
                wordToDelete.History = new List<string>() { wordId };

                foreach (var senseAcc in wordToDelete.Senses)
                {
                    senseAcc.Accessibility = (int)State.deleted;
                }

                await _repo.Create(wordToDelete);
            }

            return wordIsInFrontier;
        }

        /// <summary> Makes a new word in the Frontier with changes made </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> Update(string projectId, string wordId, Word word)
        {
            var wordIsInFrontier = _repo.DeleteFrontier(projectId, wordId).Result;

            //we only want to update words that are in the frontier
            if (wordIsInFrontier)
            {
                word.Id = "";
                word.ProjectId = projectId;

                if (word.History == null) //keep track of the old word
                {
                    word.History = new List<string> { wordId };
                }
                else //if we are updating the history, don't overwrite it, just add to the history
                {
                    word.History.Add(wordId);
                }

                await _repo.Create(word);
            }

            return wordIsInFrontier;
        }

        /// <summary> Makes a parent from merging other words and some number of separate words </summary>
        /// <returns> List of words added: Parent first, followed by separate words in order added </returns>
        public async Task<List<Word>> Merge(string projectId, MergeWords mergeWords)
        {
            var newWordsList = new List<Word>();

            var addParent = mergeWords.Parent.Clone();
            addParent.History = new List<string>();

            //generate new child words form child word field
            foreach (var newChildWordState in mergeWords.ChildrenWords)
            {
                //get child word
                var currentChildWord = await _repo.GetWord(projectId, newChildWordState.SrcWordId);
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

                //change the child word's history to its previous self
                currentChildWord.History = new List<string>() { newChildWordState.SrcWordId };

                //add child word to the database
                currentChildWord.Id = "";
                var newChildWord = await _repo.Add(currentChildWord);

                //handle different states
                var separateWord = currentChildWord.Clone();
                separateWord.Senses = new List<Sense>();
                separateWord.Id = "";
                for (int i = 0; i < currentChildWord.Senses.Count; i++)
                {
                    switch (newChildWordState.SenseStates[i])
                    {
                        //add the word to the parent's history
                        case State.sense:
                        case State.duplicate:
                            if (!addParent.History.Contains(currentChildWord.Id))
                            {
                                addParent.History.Add(currentChildWord.Id);
                            }
                            break;
                        //add the sense to a separate word and the word to its history
                        case State.separate:
                            currentChildWord.Senses[i].Accessibility = (int)State.active;
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

        /// <summary> Checks if a word being added is an exact duplicate of a preexisting word </summary>
        public async Task<bool> WordIsUnique(Word word)
        {
            //get all words from frontier
            var allWords = await _repo.GetFrontier(word.ProjectId);

            //find all words with matching vernacular
            var allVernaculars = allWords.FindAll(x => x.Vernacular == word.Vernacular);

            var foundDuplicateSense = false;
            var isUniqueWord = true;

            //iterate over words with the same vernacular
            foreach (var matchingVern in allVernaculars)
            {
                //iterate over senses of those words
                foreach (var newSense in word.Senses)
                {
                    int newSenseIndex = 0;
                    foundDuplicateSense = false;

                    //iterate over the senses of the new word
                    foreach (var oldSense in matchingVern.Senses)
                    {
                        int oldSenseIndex = 0;

                        //if the new sense is a strict subset of the old one, then merge it in
                        if (newSense.Glosses.All(s => oldSense.Glosses.Contains(s)))
                        {
                            foundDuplicateSense = true;

                            //add edited by and remove duplicates
                            matchingVern.EditedBy.AddRange(word.EditedBy);
                            matchingVern.EditedBy = matchingVern.EditedBy.Distinct().ToList();

                            //add semantic domains and remove duplicates
                            matchingVern.Senses[oldSenseIndex].SemanticDomains.AddRange(word.Senses[newSenseIndex].SemanticDomains);
                            matchingVern.Senses[oldSenseIndex].SemanticDomains = matchingVern.Senses[newSenseIndex].SemanticDomains.Distinct().ToList();
                        }

                        oldSenseIndex++;
                    }

                    //if we never found a matching sense in the old word, the words are different
                    if (!foundDuplicateSense)
                    {
                        break;
                    }

                    newSenseIndex++;
                }

                //update the word only if all the senses were duplicates
                if (foundDuplicateSense)
                {
                    isUniqueWord = false;
                    await Update(matchingVern.ProjectId, matchingVern.Id, matchingVern);
                }
            }
            return isUniqueWord;
        }

        public string GetAudioFilePath(string projectId, string wordId, string fileName)
        {
            //generate path to home on linux
            var pathToHome = Environment.GetEnvironmentVariable("HOME");

            //generate home on windows
            if (pathToHome == null)
            {
                pathToHome = Environment.GetEnvironmentVariable("UserProfile");
            }

            var filepath = Path.Combine(pathToHome, ".CombineFiles", projectId, "Import", "ExtractedFiles");
            var listOfDirs = Directory.GetDirectories(filepath);

            if (listOfDirs.Count() != 1)
            {
               return null;
            }
            //add the relative path to the audio field
            filepath = Path.Combine(filepath, listOfDirs.Single(), filepath, ".mp3"); //there should only be one dir in that file
            Console.WriteLine($"filePath: {filepath}");
            return filepath;
        }
    }
}
