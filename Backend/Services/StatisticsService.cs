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

            if (domainTreeNodeList == null || !domainTreeNodeList.Any() || !wordList.Any())
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
        /// Get the count of words per day per user as a list of WordsPerDayPerUserCount objects <see cref="WordsPerDayPerUserCount"/>
        /// </summary>
        public async Task<List<WordsPerDayPerUserCount>> GetWordsPerDayPerUserCounts(string projectId)
        {
            List<Word> wordList = await _wordRepo.GetFrontier(projectId);
            Dictionary<string, WordsPerDayPerUserCount> shortTimeDictionary = new Dictionary<string, WordsPerDayPerUserCount>();
            Dictionary<string, string> userNameIdDictionary = new Dictionary<string, string>();

            if (!wordList.Any())
            {
                return new List<WordsPerDayPerUserCount>();
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
                            // WordsPerDayPerUserCount exist for particular day
                            if (shortTimeDictionary.ContainsKey(tempDate.ToISO8601TimeFormatDateOnlyString()) && !string.IsNullOrEmpty(userName))
                            {
                                var chartNode = shortTimeDictionary[tempDate.ToISO8601TimeFormatDateOnlyString()];
                                chartNode.UserNameCountDictionary[userName] = chartNode.UserNameCountDictionary.GetValueOrDefault(userName, 0) + 1;
                            }
                            // WordsPerDayPerUserCount NOT exist, create one and update to the Dictionary
                            else
                            {
                                var tempBarChartNode = new WordsPerDayPerUserCount(sd.Created);
                                foreach (User u in projectUsers)
                                {
                                    tempBarChartNode.UserNameCountDictionary.Add(u.Username, 0);
                                }
                                tempBarChartNode.UserNameCountDictionary[userName] = 1;
                                shortTimeDictionary.Add(tempBarChartNode.DateTime.ToISO8601TimeFormatDateOnlyString(), tempBarChartNode);
                            }
                        }
                    }
                }
            }
            // sort by date order
            var resList = shortTimeDictionary.Values.ToList().OrderBy(t => t.DateTime.ToISO8601TimeFormatDateOnlyString()).ToList();
            return resList;
        }

        public async Task<ChartRootData> GetProgressEstimationLineChartRoot(string projectId, Project project)
        {
            ChartRootData LineChartData = new ChartRootData();
            List<Word> wordList = await _wordRepo.GetFrontier(projectId);
            if (!project.WorkshopSchedule.Any() || !wordList.Any())
            {
                return LineChartData;
            }
            HashSet<string> workshopScheduleSet = new HashSet<string>();
            foreach (DateTime dt in project.WorkshopSchedule)
            {

                workshopScheduleSet.Add(dt.ToISO8601TimeFormatDateOnlyString());
            }
            Dictionary<string, int> totalCountDictionary = new Dictionary<string, int>();

            foreach (Word word in wordList)
            {
                foreach (Sense sense in word.Senses)
                {
                    foreach (SemanticDomain sd in sense.SemanticDomains)
                    {

                        if (!string.IsNullOrEmpty(sd.Created))
                        {

                            DateTime tempDate = DateTimeExtensions.ParseDateTimePermissivelyWithException(sd.Created);
                            if (!workshopScheduleSet.Contains(tempDate.ToISO8601TimeFormatDateOnlyString()))
                            {
                                continue;
                            }
                            else if (totalCountDictionary.ContainsKey(tempDate.ToISO8601TimeFormatDateOnlyString()))
                            {
                                totalCountDictionary[tempDate.ToISO8601TimeFormatDateOnlyString()]++;
                            }
                            else
                            {
                                totalCountDictionary.Add(tempDate.ToISO8601TimeFormatDateOnlyString(), 1);
                            }
                        }
                    }
                }
            }
            var averageValue = 0;
            var workshopScheduleList = workshopScheduleSet.ToList();
            workshopScheduleList.Sort();
            var totalCountList = totalCountDictionary.Values.ToList();
            var pastDays = workshopScheduleList.FindAll(day => DateTimeExtensions.ParseDateTimePermissivelyWithException(day).CompareTo(DateTime.Now) <= 0).Count();
            if (totalCountList.Count == pastDays && pastDays > 1)
            {
                var min = totalCountList.Min();
                averageValue = (totalCountList.Sum() - min) / (pastDays - 1);
            }
            else if (pastDays > 1)
            {
                averageValue = (totalCountList.Sum()) / (pastDays - 1);
            }
            else
            {
                averageValue = totalCountList[0];
            }

            var EstimationValue = averageValue;

            foreach (string day in workshopScheduleList)
            {
                LineChartData.Dates.Add(day);
                if (LineChartData.Datasets.Count == 0)
                {
                    LineChartData.Datasets.Add(new Dataset("Daily Count", (totalCountDictionary.ContainsKey(day) ? totalCountDictionary[day] : 0)));
                    LineChartData.Datasets.Add(new Dataset("Average Count", averageValue));
                    LineChartData.Datasets.Add(new Dataset("EstimationTotal", EstimationValue));

                }
                else
                {
                    if (DateTimeExtensions.ParseDateTimePermissivelyWithException(day).CompareTo(DateTime.Now) <= 0)
                    {
                        LineChartData.Datasets.Find(element => element.UserName == "Daily Count")?.Data.Add(totalCountDictionary.ContainsKey(day) ? totalCountDictionary[day] : 0);
                        LineChartData.Datasets.Find(element => element.UserName == "Average Count")?.Data.Add(averageValue);
                    }
                    LineChartData.Datasets.Find(element => element.UserName == "EstimationTotal")?.Data.Add(EstimationValue);
                }
                EstimationValue += averageValue;
            }
            return LineChartData;
        }

        /// <summary>
        /// Get a ChartRootData objects <see cref="ChartRootData"/> to generate a Line Chart,
        /// Return a empty Object if the project is empty or null
        /// </summary>
        public async Task<ChartRootData> GetLineChartRootData(string projectId)
        {
            ChartRootData LineChartData = new ChartRootData();
            List<WordsPerDayPerUserCount> list = await GetWordsPerDayPerUserCounts(projectId);
            // if the list is null or empty return new ChartRootData to generate a empty Chart
            if ((list == null) && (!list!.Any()))
            {
                return LineChartData;
            }

            // update the ChartRootData based on the order of the WordsPerDayPerUserCount from the list
            foreach (WordsPerDayPerUserCount temp in list!)
            {
                LineChartData.Dates.Add(temp.DateTime.ToISO8601TimeFormatDateOnlyString());
                // first traversal, generate a new Dataset
                if (LineChartData.Datasets.Count == 0)
                {
                    var totalDay = 0;
                    foreach (var item in temp.UserNameCountDictionary)
                    {
                        totalDay += item.Value;
                        LineChartData.Datasets.Add(new Dataset(item.Key, item.Value));
                    }
                    // update "Total", Line Chart needed
                    LineChartData.Datasets.Add(new Dataset("Total", totalDay));
                }
                // remaining traversal, update the object by pushing the value to Data array
                else
                {
                    var totalDay = 0;
                    foreach (var item in temp.UserNameCountDictionary)
                    {
                        totalDay += item.Value;
                        LineChartData.Datasets.Find(element => element.UserName == item.Key)?.Data.Add(item.Value);
                    }
                    // update "Total"
                    LineChartData.Datasets.Find(element => element.UserName == "Total")?.Data.Add(totalDay);
                }
            }

            return LineChartData;
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
