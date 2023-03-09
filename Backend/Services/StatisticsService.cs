using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using SIL.Extensions;

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

        /// <summary>
        /// Get the count of words per day per user as a list of WordsPerDayUserChartJSCount objects <see cref="WordsPerDayUserChartJSCount"/>
        /// </summary>
        public async Task<List<WordsPerDayUserChartJSCount>> GetWordsPerDayUserChartJSCounts(string projectId)
        {
            List<Word> wordList = await _wordRepo.GetFrontier(projectId);
            Dictionary<string, WordsPerDayUserChartJSCount> shortTimeDictionary = new Dictionary<string, WordsPerDayUserChartJSCount>();
            Dictionary<string, string> userNameIdDictionary = new Dictionary<string, string>();

            if (wordList == null)
            {
                return new List<WordsPerDayUserChartJSCount>();
            }

            var allUsers = await _userRepo.GetAllUsers();
            var projectUsers = allUsers.FindAll(user => user.ProjectRoles.ContainsKey(projectId));

            // only count for current valid users of the project
            foreach (User u in projectUsers)
            {
                userNameIdDictionary.Add(u.Id, u.Username);
            }

            foreach (Word word in wordList)
            {
                foreach (Sense sense in word.Senses)
                {
                    foreach (SemanticDomain sd in sense.SemanticDomains)
                    {
                        // The created timestamp may not exist for some model
                        if (!string.IsNullOrEmpty(sd.Created))
                        {
                            DateTime tempDate = DateTimeExtensions.ParseDateTimePermissivelyWithException(sd.Created);
                            var userName = userNameIdDictionary.GetValueOrDefault(sd.UserId, "");
                            // WordsPerDayUserChartJSCount exist for particular day
                            if (shortTimeDictionary.ContainsKey(tempDate.ToISO8601TimeFormatDateOnlyString()) && !string.IsNullOrEmpty(userName))
                            {
                                var barChartNode = shortTimeDictionary[tempDate.ToISO8601TimeFormatDateOnlyString()];
                                barChartNode.UserNameCountDictionary[userName] = barChartNode.UserNameCountDictionary.GetValueOrDefault(userName, 0) + 1;
                            }
                            // WordsPerDayUserChartJSCount NOT exist, create one and update to the Dictionary
                            else
                            {
                                var tempBarChartNode = new WordsPerDayUserChartJSCount(sd.Created);
                                foreach (User u in projectUsers)
                                {
                                    tempBarChartNode.UserNameCountDictionary.Add(u.Username, 0);
                                }
                                tempBarChartNode.UserNameCountDictionary[userName] = 1;
                                shortTimeDictionary.Add(tempBarChartNode.ShortDateString, tempBarChartNode);
                            }
                        }
                    }
                }
            }
            // sort by date order
            var resList = shortTimeDictionary.Values.ToList().OrderBy(t => t.ShortDateString).ToList();
            return resList;
        }

        /// <summary>
        /// Get the counts of senses and domains for user return a list of SemanticDomainUserCount objects <see cref="SemanticDomainUserCount"/>
        /// </summary>
        /// <returns> A List of SemanticDomainUserCount <see cref="SemanticDomainUserCount"/> </returns>
        public async Task<List<SemanticDomainUserCount>> GetSemanticDomainUserCounts(string projectId)
        {
            List<Word> wordList = await _wordRepo.GetFrontier(projectId);
            Dictionary<string, SemanticDomainUserCount> resUserMap = new Dictionary<string, SemanticDomainUserCount>();

            // Get all users of the project
            var allUsers = await _userRepo.GetAllUsers();
            var projectUsers = allUsers.FindAll(user => user.ProjectRoles.ContainsKey(projectId));

            // build a SemanticDomainUserCount object hashMap with userId as the key 
            foreach (User u in projectUsers)
            {
                resUserMap.Add(u.Id, new SemanticDomainUserCount(u.Id, u.Username));
            }

            // unknownUser is for legacy data without a userId under SemanticDomain model
            var unknownId = "unknownUserId";
            var unknownName = "unknownUser";
            resUserMap.Add(unknownId, new SemanticDomainUserCount(unknownId, unknownName));

            foreach (Word word in wordList)
            {
                foreach (Sense sense in word.Senses)
                {
                    foreach (SemanticDomain sd in sense.SemanticDomains)
                    {
                        var userId = sd.UserId;
                        var domainName = sd.Name;
                        var domainUserValue = new SemanticDomainUserCount();
                        // if the SemanticDomain have a userId and exist in HashMap
                        domainUserValue = (userId != null && resUserMap.ContainsKey(userId)
                            // if new SemanticDomain model
                            ? domainUserValue = resUserMap[userId]
                            // if not new SemanticDomain model assign to unknownUser
                            : domainUserValue = resUserMap[unknownId]);

                        // update DomainCount
                        if (!domainUserValue.DomainSet.Contains(domainName))
                        {
                            domainUserValue.DomainSet.Add(domainName);
                            domainUserValue.DomainCount++;
                        }
                        // update WordCount
                        domainUserValue.WordCount++;
                    }
                }
            }
            // return descending order by senseCount
            return resUserMap.Values.ToList().OrderByDescending(t => t.WordCount).ToList();
        }
    }
}
