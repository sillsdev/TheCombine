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

            // We only want to add the deleted word if the word started in the frontier.
            if (wordIsInFrontier)
            {
                var wordToDelete = await _repo.GetWord(projectId, wordId);
                if (wordToDelete is null)
                {
                    return false;
                }

                wordToDelete.Id = "";
                wordToDelete.Modified = "";
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
                wordWithAudioToDelete.Modified = "";
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
            word.Modified = "";
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
                word.Modified = "";

                // Keep track of the old word, adding it to the history.
                word.History.Add(wordId);

                await _repo.Create(word);
            }

            return wordIsInFrontier;
        }

        /// <summary> Prepares a merge parent to be added to the database. </summary>
        /// <returns> Word to add. </returns>
        private async Task<Word> MergePrepParent(string projectId, MergeWords mergeWords)
        {
            var parent = mergeWords.Parent.Clone();
            parent.ProjectId = projectId;
            parent.History = new List<string>();

            // Add child to history.
            foreach (var childSource in mergeWords.Children)
            {
                parent.History.Add(childSource.SrcWordId);
                if (childSource.GetAudio)
                {
                    var child = await _repo.GetWord(projectId, childSource.SrcWordId);
                    if (child is null)
                    {
                        throw new KeyNotFoundException($"Unable to locate word: ${childSource.SrcWordId}");
                    }
                    parent.Audio.AddRange(child.Audio);
                }
            }

            // Remove duplicates.
            parent.Audio = parent.Audio.Distinct().ToList();
            parent.History = parent.History.Distinct().ToList();

            // Clear fields to be automatically regenerated.
            parent.Id = "";
            parent.Modified = "";

            return parent;
        }

        /// <summary> Deletes all the merge children from the frontier. </summary>
        /// <returns> Number of words deleted. </returns>
        private async Task<long> MergeDeleteChildren(string projectId, MergeWords mergeWords)
        {
            var childIds = mergeWords.Children.Select(c => c.SrcWordId).ToList();
            return await _repo.DeleteFrontier(projectId, childIds);
        }

        /// <summary>
        /// Given a list of MergeWords, preps the words to be added, removes the children
        /// from the frontier, and adds the new words to the database.
        /// </summary>
        /// <returns> List of new words added. </returns>
        public async Task<List<Word>> Merge(string projectId, List<MergeWords> mergeWordsList)
        {
            var newWords = new List<Word>();
            await Task.WhenAll(mergeWordsList.Select(m => MergePrepParent(projectId, m)
                                             .ContinueWith(task => newWords.Add(task.Result))));
            await Task.WhenAll(mergeWordsList.Select(m => MergeDeleteChildren(projectId, m)));
            return await _repo.Create(newWords);
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
