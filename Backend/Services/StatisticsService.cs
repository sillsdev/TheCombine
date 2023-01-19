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
        public async Task<List<KeyValuePair<SemanticDomainTreeNode, int>>> GetAllStatisticsKeyPair(string projectId, string lang)
        {
            Dictionary<string, int> hashMap = new Dictionary<string, int>();
            List<SemanticDomainTreeNode>? domainTreeNodeList = await _domainRepo.GetAllSemanticDomainTreeNode(lang);
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
                        var temp = sd.Id;
                        while (temp.Length >= 1)
                        {
                            hashMap[temp] = hashMap.GetValueOrDefault(temp, 0) + 1;
                            if (temp.Length == 1)
                            {
                                break;
                            }
                            if (temp.Length >= 3)
                            {
                                temp = temp.Substring(0, temp.Length - 2);
                            }
                        }
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