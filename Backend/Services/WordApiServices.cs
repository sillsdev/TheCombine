using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;

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
            var wordIsInFrontier = await _repo.DeleteFrontier(projectId, wordId);

            // We only want to add the deleted word if the word started in the frontier
            if (wordIsInFrontier)
            {
                var wordToDelete = await _repo.GetWord(projectId, wordId);
                if (wordToDelete is null)
                {
                    return false;
                }

                wordToDelete.Id = "";
                wordToDelete.History = new List<string> { wordId };
                wordToDelete.Accessibility = State.Deleted;

                foreach (var senseAcc in wordToDelete.Senses)
                {
                    senseAcc.Accessibility = State.Deleted;
                }

                await _repo.Create(wordToDelete);
            }

            return wordIsInFrontier;
        }

        /// <summary> Removes audio with specified Id from a word </summary>
        /// <returns> New word </returns>
        public async Task<Word?> Delete(string projectId, string wordId, string fileName)
        {
            var wordWithAudioToDelete = await _repo.GetWord(projectId, wordId);
            if (wordWithAudioToDelete is null)
            {
                return null;
            }

            var wordIsInFrontier = await _repo.DeleteFrontier(projectId, wordId);

            // We only want to update words that are in the frontier
            if (wordIsInFrontier)
            {
                wordWithAudioToDelete.Audio.Remove(fileName);
                wordWithAudioToDelete.Id = "";
                wordWithAudioToDelete.ProjectId = projectId;

                // Keep track of the old word, adding it to the history.
                wordWithAudioToDelete.History.Add(wordId);

                wordWithAudioToDelete = await _repo.Create(wordWithAudioToDelete);
            }

            return wordWithAudioToDelete;
        }

        /// <summary> Deletes word in frontier collection and adds word with deleted tag in word collection </summary>
        /// <returns> A string: id of new word </returns>
        public async Task<string?> DeleteFrontierWord(string projectId, string wordId)
        {
            var wordIsInFrontier = await _repo.DeleteFrontier(projectId, wordId);
            if (!wordIsInFrontier)
            {
                return null;
            }

            var word = await _repo.GetWord(projectId, wordId);
            if (word is null)
            {
                return null;
            }

            word.Id = "";
            word.ProjectId = projectId;
            word.Accessibility = State.Deleted;

            // Keep track of the old word, adding it to the history.
            word.History.Add(wordId);

            var deletedWord = await _repo.Add(word);
            return deletedWord.Id;
        }

        /// <summary> Makes a new word in the Frontier with changes made </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> Update(string projectId, string wordId, Word word)
        {
            var wordIsInFrontier = await _repo.DeleteFrontier(projectId, wordId);

            // We only want to update words that are in the frontier
            if (wordIsInFrontier)
            {
                word.Id = "";
                word.ProjectId = projectId;
                word.Modified = DateTime.UtcNow.ToLongDateString();

                // Keep track of the old word, adding it to the history.
                word.History.Add(wordId);

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
            addParent.Audio = new List<string>();

            // Generate new child words form child word field
            foreach (var newChildWordState in mergeWords.ChildrenWords)
            {
                // Get child word
                var currentChildWord = await _repo.GetWord(projectId, newChildWordState.SrcWordId);
                if (currentChildWord is null)
                {
                    throw new KeyNotFoundException($"Unable to locate word: ${newChildWordState.SrcWordId}");
                }

                // Copy over audio if child doesn't have own surviving entry
                if (!newChildWordState.SenseStates.Exists(x => x == State.Separate))
                {
                    addParent.Audio.AddRange(currentChildWord.Audio);
                }

                // Remove child from frontier
                await _repo.DeleteFrontier(projectId, currentChildWord.Id);

                // Iterate through senses of that word and change to corresponding state in mergewords
                if (currentChildWord.Senses.Count != newChildWordState.SenseStates.Count)
                {
                    throw new FormatException("Sense counts don't match");
                }
                for (var i = 0; i < currentChildWord.Senses.Count; i++)
                {
                    currentChildWord.Senses[i].Accessibility = newChildWordState.SenseStates[i];
                }

                // Change the child word's history to its previous self
                currentChildWord.History = new List<string> { newChildWordState.SrcWordId };

                // Add child word to the database
                currentChildWord.Id = "";
                await _repo.Add(currentChildWord);

                // Handle different states
                var separateWord = currentChildWord.Clone();
                separateWord.Senses = new List<Sense>();
                separateWord.Id = "";
                for (var i = 0; i < currentChildWord.Senses.Count; i++)
                {
                    switch (newChildWordState.SenseStates[i])
                    {
                        // Add the word to the parent's history
                        case State.Sense:
                        case State.Duplicate:
                            if (!addParent.History.Contains(currentChildWord.Id))
                            {
                                addParent.History.Add(currentChildWord.Id);
                            }
                            break;
                        // Add the sense to a separate word and the word to its history
                        case State.Separate:
                            currentChildWord.Senses[i].Accessibility = State.Active;
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

                // Add a new word to the database with all of the senses with separate tags from this word
                if (separateWord.Senses.Count != 0)
                {
                    separateWord.ProjectId = projectId;
                    var newSeparate = await _repo.Create(separateWord);
                    newWordsList.Add(newSeparate);
                }
            }

            // Add parent with child history to the database
            addParent.ProjectId = projectId;
            var newParent = await _repo.Create(addParent);
            newWordsList.Insert(0, newParent);
            return newWordsList;
        }

        /// <summary> Checks if a word being added is an exact duplicate of a preexisting word </summary>
        public async Task<bool> WordIsUnique(Word word)
        {
            // Get all words from frontier
            var allWords = await _repo.GetFrontier(word.ProjectId);

            // Find all words with matching vernacular
            var allVernaculars = allWords.FindAll(x => x.Vernacular == word.Vernacular);

            var foundDuplicateSense = false;
            var isUniqueWord = true;

            // Iterate over words with the same vernacular
            foreach (var matchingVern in allVernaculars)
            {
                // Iterate over senses of those words
                foreach (var newSense in word.Senses)
                {
                    foundDuplicateSense = false;

                    // Iterate over the senses of the new word
                    foreach (var oldSense in matchingVern.Senses)
                    {
                        // If the new sense is a strict subset of the old one, then merge it in
                        if (newSense.Glosses.All(s => oldSense.Glosses.Contains(s)))
                        {
                            foundDuplicateSense = true;

                            // Add edited by and remove duplicates
                            matchingVern.EditedBy.AddRange(word.EditedBy);
                            matchingVern.EditedBy = matchingVern.EditedBy.Distinct().ToList();

                            // Add semantic domains and remove duplicates
                            oldSense.SemanticDomains.AddRange(newSense.SemanticDomains);
                            oldSense.SemanticDomains = oldSense.SemanticDomains.Distinct().ToList();
                        }
                    }

                    // If we never found a matching sense in the old word, the words are different
                    if (!foundDuplicateSense)
                    {
                        break;
                    }
                }

                // Update the word only if all the senses were duplicates
                if (foundDuplicateSense)
                {
                    isUniqueWord = false;
                    await Update(matchingVern.ProjectId, matchingVern.Id, matchingVern);
                }
            }
            return isUniqueWord;
        }
    }
}
