using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;



namespace BackendFramework.Services
{
    public class StatisticsService : IStatisticsService
    {
        private readonly IWordRepository _wordRepo;
        private readonly ISemanticDomainRepository _domainRepo;

        public StatisticsService(IWordRepository wordRepo, ISemanticDomainRepository domainRepo)
        {
            _wordRepo = wordRepo;
            _domainRepo = domainRepo;
        }

        /// <summary>
        /// Get a list of pair of SemanticDomainCounts counting the sense-domain
        /// key: SemanticDomainTreeNode, value: counts as int
        /// </summary>
        /// <returns>
        /// List of KeyValuePair<SemanticDomainTreeNode, int>
        ///     key: SemanticDomainTreeNode
        ///     value: counts as int
        /// </returns>
        public async Task<List<KeyValuePair<SemanticDomainTreeNode, int>>> GetSemanticDomainCounts(string projectId, string lang)
        {
            Dictionary<string, int> hashMap = new Dictionary<string, int>();
            List<SemanticDomainTreeNode>? domainTreeNodeList = await _domainRepo.GetAllSemanticDomainTreeNodes(lang);
            List<Word> wordList = await _wordRepo.GetAllWords(projectId);
            List<KeyValuePair<SemanticDomainTreeNode, int>> resList = new List<KeyValuePair<SemanticDomainTreeNode, int>>();

            if (domainTreeNodeList == null || wordList == null)
            {
                return new List<KeyValuePair<SemanticDomainTreeNode, int>>();
            }

            foreach (Word word in wordList)
            {
                foreach (Sense sense in word.Senses)
                {
                    foreach (SemanticDomain sd in sense.SemanticDomains)
                    {
                        hashMap[sd.Id] = hashMap.GetValueOrDefault(sd.Id, 0) + 1;
                    }
                }
            }

            foreach (SemanticDomainTreeNode domainTreeNode in domainTreeNodeList)
            {
                resList.Add(new KeyValuePair<SemanticDomainTreeNode, int>(domainTreeNode, hashMap.GetValueOrDefault(domainTreeNode.Id, 0)));
            }
            return resList;
        }
    }
}
