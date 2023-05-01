using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using static SIL.Extensions.DateTimeExtensions;

namespace BackendFramework.Services
{
    public class StatisticsService : IStatisticsService
    {
        private readonly IWordRepository _wordRepo;
        private readonly ISemanticDomainRepository _domainRepo;
        private readonly IUserRepository _userRepo;

        public StatisticsService(
            IWordRepository wordRepo, ISemanticDomainRepository domainRepo, IUserRepository userRepo)
        {
            _wordRepo = wordRepo;
            _domainRepo = domainRepo;
            _userRepo = userRepo;
        }


        /// <summary>
        /// Get a <see cref="SemanticDomainCount"/> to generate a SemanticDomain statistics
        /// </summary>
        public async Task<List<SemanticDomainCount>> GetSemanticDomainCounts(string projectId, string lang)
        {
            Dictionary<string, int> hashMap = new Dictionary<string, int>();
            List<SemanticDomainTreeNode>? domainTreeNodeList = await _domainRepo.GetAllSemanticDomainTreeNodes(lang);
            List<Word> wordList = await _wordRepo.GetFrontier(projectId);
            List<SemanticDomainCount> resList = new List<SemanticDomainCount>();

            if (domainTreeNodeList is null || !domainTreeNodeList.Any() || !wordList.Any())
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
        /// Get a <see cref="WordsPerDayPerUserCount"/> to generate a WordsPerDayPerUser statistics
        /// </summary>
        public async Task<List<WordsPerDayPerUserCount>> GetWordsPerDayPerUserCounts(string projectId)
        {
            List<Word> wordList = await _wordRepo.GetFrontier(projectId);
            Dictionary<string, WordsPerDayPerUserCount> shortTimeDictionary =
                new Dictionary<string, WordsPerDayPerUserCount>();
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
                            DateTime tempDate = ParseDateTimePermissivelyWithException(sd.Created);
                            var userName = userNameIdDictionary.GetValueOrDefault(sd.UserId, "");
                            // WordsPerDayPerUserCount exist for particular day
                            if (shortTimeDictionary.ContainsKey(tempDate.ToISO8601TimeFormatDateOnlyString()) &&
                                !string.IsNullOrEmpty(userName))
                            {
                                var chartNode = shortTimeDictionary[tempDate.ToISO8601TimeFormatDateOnlyString()];
                                chartNode.UserNameCountDictionary[userName] = chartNode
                                    .UserNameCountDictionary.GetValueOrDefault(userName, 0) + 1;
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
                                shortTimeDictionary.Add(
                                    tempBarChartNode.DateTime.ToISO8601TimeFormatDateOnlyString(), tempBarChartNode);
                            }
                        }
                    }
                }
            }
            // sort by date order
            var resList = shortTimeDictionary.Values.ToList()
                .OrderBy(t => t.DateTime.ToISO8601TimeFormatDateOnlyString()).ToList();
            return resList;
        }

        /// <summary>
        /// Get a <see cref="ChartRootData"/> to generate a Estimate Line Chart,
        /// Return a empty Object if the workshop schedule or wordList is empty or null
        /// </summary>
        public async Task<ChartRootData> GetProgressEstimationLineChartRoot(string projectId, List<DateTime> schedule)
        {
            ChartRootData LineChartData = new ChartRootData();
            List<Word> wordList = await _wordRepo.GetFrontier(projectId);
            List<string> workshopSchedule = new List<string>();
            Dictionary<string, int> totalCountDictionary = new Dictionary<string, int>();

            // if not schedule yet or wordList is empty return new ChartRootData
            if (!schedule.Any() || !wordList.Any())
            {
                return LineChartData;
            }

            // Build workshop schedule hashSet 
            foreach (DateTime dt in schedule)
            {
                workshopSchedule.Add(dt.ToISO8601TimeFormatDateOnlyString());
            }

            // Build daily count Dictionary 
            foreach (Word word in wordList)
            {
                foreach (Sense sense in word.Senses)
                {
                    foreach (SemanticDomain sd in sense.SemanticDomains)
                    {

                        if (!string.IsNullOrEmpty(sd.Created))
                        {
                            string dateString = ParseDateTimePermissivelyWithException(sd.Created)
                                .ToISO8601TimeFormatDateOnlyString();
                            if (!workshopSchedule.Contains(dateString))
                            {
                                continue;
                            }
                            else if (totalCountDictionary.ContainsKey(dateString))
                            {
                                totalCountDictionary[dateString]++;
                            }
                            else
                            {
                                totalCountDictionary.Add(dateString, 1);
                            }
                        }
                    }
                }
            }
            var averageValue = 0;
            workshopSchedule.Sort();
            var totalCountList = totalCountDictionary.Values.ToList();
            var pastDays = workshopSchedule.FindAll(day =>
                ParseDateTimePermissivelyWithException(day).CompareTo(DateTime.Now) <= 0).Count();
            // calculate average daily count
            // If pastDays is two or more, and pastDays equals the number of days on which at least one word was added
            var min = totalCountList.Min();
            if (totalCountList.Count == pastDays && pastDays > 1)
            {
                averageValue = (totalCountList.Sum() - min) / (pastDays - 1);
            }
            // If pastDays is two or more and at least one of those days had no word added
            else if (pastDays > 1)
            {
                averageValue = (totalCountList.Sum()) / (pastDays - 1);
            }
            // no need to remove the lowest data if there's only one past day
            else
            {
                averageValue = totalCountList.Count > 0 ? totalCountList[0] : 0;
            }

            int burst = 0, burstProjection = 0, projection = min, runningTotal = 0, today = 0, yesterday = 0;
            // generate ChartRootData for frontend
            for (int i = 0; i < workshopSchedule.Count; i++)
            {
                LineChartData.Dates.Add(workshopSchedule[i]);
                var day = workshopSchedule[i];
                if (LineChartData.Datasets.Count == 0)
                {
                    runningTotal = totalCountDictionary.ContainsKey(day) ? totalCountDictionary[day] : 0;
                    today = yesterday = runningTotal;
                    LineChartData.Datasets.Add(new Dataset(
                        "Daily Total", (totalCountDictionary.ContainsKey(day) ? totalCountDictionary[day] : 0)));
                    LineChartData.Datasets.Add(new Dataset("Average", averageValue));
                    LineChartData.Datasets.Add(new Dataset("Running Total", runningTotal));
                    LineChartData.Datasets.Add(new Dataset("Projection", projection));
                    LineChartData.Datasets.Add(new Dataset("Burst Projection", runningTotal));
                }
                else
                {
                    // not generate data after the current date for "Daily Total", "Average" and "Running Total"
                    if (ParseDateTimePermissivelyWithException(day).CompareTo(DateTime.Now) <= 0)
                    {
                        today = totalCountDictionary.ContainsKey(day) ? totalCountDictionary[day] : 0;
                        runningTotal += today;
                        LineChartData.Datasets.Find(element => element.UserName == "Daily Total")?.Data.Add(today);
                        LineChartData.Datasets.Find(element => element.UserName == "Average")?.Data.Add(averageValue);
                        LineChartData.Datasets.Find(
                            element => element.UserName == "Running Total")?.Data.Add(runningTotal);
                        LineChartData.Datasets.Find(
                            element => element.UserName == "Burst Projection")?.Data.Add(runningTotal);
                        burst = (today + yesterday) / 2;
                        burstProjection = runningTotal + burst;
                        yesterday = today;
                    }
                    else
                    {
                        LineChartData.Datasets.Find(
                            element => element.UserName == "Burst Projection")?.Data.Add((burstProjection));
                        burstProjection += burst;
                    }
                    LineChartData.Datasets.Find(element => element.UserName == "Projection")?.Data.Add(projection);
                }
                projection += averageValue;
            }
            return LineChartData;
        }

        /// <summary>
        /// Get a <see cref="ChartRootData"/> to generate a Line Chart,
        /// Return a empty Object if the project is empty or null
        /// </summary>
        public async Task<ChartRootData> GetLineChartRootData(string projectId)
        {
            ChartRootData LineChartData = new ChartRootData();
            List<WordsPerDayPerUserCount> list = await GetWordsPerDayPerUserCounts(projectId);
            // if the list is null or empty return new ChartRootData to generate a empty Chart
            if (list is null || !list.Any())
            {
                return LineChartData;
            }

            // update the ChartRootData based on the order of the WordsPerDayPerUserCount from the list
            foreach (WordsPerDayPerUserCount temp in list)
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
                    LineChartData.Datasets.Add(new Dataset("Daily Total", totalDay));
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
                    LineChartData.Datasets.Find(element => element.UserName == "Daily Total")?.Data.Add(totalDay);
                }
            }

            return LineChartData;
        }


        /// <summary>
        /// Get <see cref="SemanticDomainUserCount"/> to generate a SemanticDomain per User statistics
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
                        domainUserValue = (userId is not null && resUserMap.ContainsKey(userId)
                            // if true, new SemanticDomain model
                            ? domainUserValue = resUserMap[userId]
                            // if false, assign to unknownUser
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
