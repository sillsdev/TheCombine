using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;



namespace BackendFramework.Services
{
    public class StatisticsService : IStatisticsService
    {
        private readonly IWordRepository _wordRepo;
        private readonly ISemanticDomainRepository _domainRepo;
        private readonly IUserRepository _userRepo;

        public StatisticsService(IWordRepository wordRepo, ISemanticDomainRepository domainRepo, IUserRepository userRepo)
        {
            _wordRepo = wordRepo;
            _domainRepo = domainRepo;
            _userRepo = userRepo;
        }


        /// <summary>
        /// Get the count of senses which use each semantic domain as a list of SemanticDomainCount objects
        /// </summary>
        public async Task<List<SemanticDomainCount>> GetSemanticDomainCounts(string projectId, string lang)
        {
            Dictionary<string, int> hashMap = new Dictionary<string, int>();
            List<SemanticDomainTreeNode>? domainTreeNodeList = await _domainRepo.GetAllSemanticDomainTreeNodes(lang);
            List<Word> wordList = await _wordRepo.GetFrontier(projectId);
            List<SemanticDomainCount> resList = new List<SemanticDomainCount>();

            if (domainTreeNodeList == null || wordList == null)
            {
                return new List<SemanticDomainCount>();
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
                resList.Add(new SemanticDomainCount(domainTreeNode, hashMap.GetValueOrDefault(domainTreeNode.Id, 0)));
            }
            return resList;
        }


        // Fuen's temporarily mark
        // Get the count of senses and domain per user return a list of domainSenseUserCount objects
        public async Task<List<DomainSenseUserCount>> GetDomainSenseUserCounts(string projectId)
        {
            List<Word> wordList = await _wordRepo.GetFrontier(projectId);
            Dictionary<string, DomainSenseUserCount> resUserMap = new Dictionary<string, DomainSenseUserCount>();

            // get project user
            var allUsers = await _userRepo.GetAllUsers();
            var projectUsers = allUsers.FindAll(user => user.ProjectRoles.ContainsKey(projectId));
            // build a domainSenseUserCount object hashMap with userId as key 
            foreach (User u in projectUsers)
            {
                resUserMap.Add(u.Id, new DomainSenseUserCount(u.Id, u.Username));
            }
            // for legacy database without userId under word and sense model
            var unknownId = "unknownUserId";
            var unknownName = "unknownUser";
            resUserMap.Add(unknownId, new DomainSenseUserCount(unknownId, unknownName));


            foreach (Word word in wordList)
            {
                foreach (Sense sense in word.Senses)
                {
                    var userId = sense.userId;
                    var domainName = sense.SemanticDomains[0].Name;
                    var domSenUserValue = new DomainSenseUserCount();
                    // check is the sense have a userId
                    domSenUserValue = (userId != null && resUserMap.ContainsKey(userId)
                        // if new sense model find the domainSenseUserCount
                        ? domSenUserValue = resUserMap[userId]
                        // if not new sense model assign to unknownUser
                        : domSenUserValue = resUserMap[unknownId]);

                    // update DomainCount
                    if (!domSenUserValue.DomainSet.Contains(domainName))
                    {
                        domSenUserValue.DomainSet.Add(domainName);
                        domSenUserValue.DomainCount++;
                    }
                    // updata senseCount
                    domSenUserValue.SenseCount++;
                }
            }
            // return descending order by senseCount
            return resUserMap.Values.ToList().OrderByDescending(t => t.SenseCount).ToList();
        }
    }
}
