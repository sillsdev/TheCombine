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

        // Statistic names (TODO: localize)
        const string StatAverage = "Average";
        const string StatBurstProjection = "Burst Projection";
        const string StatDailyTotal = "Daily Total";
        const string StatProjection = "Projection";
        const string StatRunningTotal = "Running Total";

        /// <summary>
        /// Get a <see cref="SemanticDomainCount"/> to generate a SemanticDomain statistics
        /// </summary>
        public async Task<List<SemanticDomainCount>> GetSemanticDomainCounts(string projectId, string lang)
        {
            var hashMap = new Dictionary<string, int>();
            var domainTreeNodeList = await _domainRepo.GetAllSemanticDomainTreeNodes(lang);
            var wordList = await _wordRepo.GetFrontier(projectId);

            if (domainTreeNodeList is null || domainTreeNodeList.Count == 0 || wordList.Count == 0)
            {
                return [];
            }

            foreach (var word in wordList)
            {
                foreach (var sense in word.Senses)
                {
                    foreach (var sd in sense.SemanticDomains)
                    {
                        hashMap[sd.Id] = hashMap.GetValueOrDefault(sd.Id, 0) + 1;
                    }
                }
            }

            var resList = new List<SemanticDomainCount>();
            foreach (var domainTreeNode in domainTreeNodeList)
            {
                resList.Add(new(domainTreeNode, hashMap.GetValueOrDefault(domainTreeNode.Id, 0)));
            }
            return resList;
        }

        /// <summary>
        /// Get a <see cref="WordsPerDayPerUserCount"/> to generate a WordsPerDayPerUser statistics
        /// </summary>
        public async Task<List<WordsPerDayPerUserCount>> GetWordsPerDayPerUserCounts(string projectId)
        {
            var wordList = await _wordRepo.GetFrontier(projectId);
            var shortTimeDictionary = new Dictionary<string, WordsPerDayPerUserCount>();
            var userNameIdDictionary = new Dictionary<string, string>();

            if (wordList.Count == 0)
            {
                return [];
            }

            var allUsers = await _userRepo.GetAllUsers();
            var projectUsers = allUsers.FindAll(user => user.ProjectRoles.ContainsKey(projectId));

            // only count for current valid users of the project
            foreach (var u in projectUsers)
            {
                userNameIdDictionary.Add(u.Id, u.Username);
            }

            foreach (var word in wordList)
            {
                foreach (var sense in word.Senses)
                {
                    foreach (var sd in sense.SemanticDomains)
                    {
                        // The created timestamp may not exist for some model
                        if (!string.IsNullOrEmpty(sd.Created))
                        {
                            var dateKey = sd.Created.ParseModernPastDateTimePermissivelyWithException()
                                .ToISO8601TimeFormatDateOnlyString();
                            if (!shortTimeDictionary.TryGetValue(dateKey, out var chartNode))
                            {
                                chartNode = new WordsPerDayPerUserCount(sd.Created);
                                foreach (var u in projectUsers)
                                {
                                    chartNode.UserNameCountDictionary.Add(u.Username, 0);
                                }
                                shortTimeDictionary.Add(dateKey, chartNode);
                            }

                            var username = userNameIdDictionary.GetValueOrDefault(sd.UserId, "?");
                            // A semantic domain shouldn't usually have `.Created` without a valid `.UserId`;
                            // this case is a safe-guard to allow a project owner to see statistics even if there's an
                            // error in the user reckoning (e.g., if a user is removed from the project mid-workshop).
                            if (!chartNode.UserNameCountDictionary.TryAdd(username, 1))
                            {
                                chartNode.UserNameCountDictionary[username]++;
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
            var LineChartData = new ChartRootData();
            var wordList = await _wordRepo.GetFrontier(projectId);
            var workshopSchedule = new List<string>();
            var totalCountDictionary = new Dictionary<string, int>();

            // If no schedule yet or wordList is empty, return empty ChartRootData
            if (schedule.Count == 0 || wordList.Count == 0)
            {
                return LineChartData;
            }

            // Build workshop schedule hashSet 
            foreach (var dt in schedule)
            {
                workshopSchedule.Add(dt.ToISO8601TimeFormatDateOnlyString());
            }

            // Build daily count Dictionary 
            foreach (var word in wordList)
            {
                foreach (var sense in word.Senses)
                {
                    foreach (var sd in sense.SemanticDomains)
                    {

                        if (!string.IsNullOrEmpty(sd.Created))
                        {
                            string dateString = sd.Created.ParseModernPastDateTimePermissivelyWithException()
                                .ToISO8601TimeFormatDateOnlyString();
                            if (!workshopSchedule.Contains(dateString))
                            {
                                continue;
                            }
                            else if (!totalCountDictionary.TryAdd(dateString, 1))
                            {
                                totalCountDictionary[dateString]++;
                            }
                        }
                    }
                }
            }

            // If no semantic domain has Created, return empty ChartRootData
            if (totalCountDictionary.Count == 0)
            {
                return LineChartData;
            }

            var averageValue = 0;
            workshopSchedule.Sort();
            var totalCountList = totalCountDictionary.Values.ToList();
            var pastDays = workshopSchedule.FindAll(day =>
                day.ParseModernPastDateTimePermissivelyWithException().CompareTo(DateTime.Now) <= 0).Count;
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
                averageValue = totalCountList.Sum() / (pastDays - 1);
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
                totalCountDictionary.TryGetValue(day, out today);
                if (LineChartData.Datasets.Count == 0)
                {
                    runningTotal = yesterday = today;
                    LineChartData.Datasets.Add(new(StatDailyTotal, today));
                    LineChartData.Datasets.Add(new(StatAverage, averageValue));
                    LineChartData.Datasets.Add(new(StatRunningTotal, runningTotal));
                    LineChartData.Datasets.Add(new(StatProjection, projection));
                    LineChartData.Datasets.Add(new(StatBurstProjection, runningTotal));
                }
                else
                {
                    // not generate data after the current date for Daily Total, Average, and Running Total
                    if (day.ParseModernPastDateTimePermissivelyWithException().CompareTo(DateTime.Now) <= 0)
                    {
                        runningTotal += today;
                        LineChartData.Datasets.Find(element => element.UserName == StatDailyTotal)?.Data.Add(today);
                        LineChartData.Datasets.Find(element => element.UserName == StatAverage)?.Data.Add(averageValue);
                        LineChartData.Datasets.Find(
                            element => element.UserName == StatRunningTotal)?.Data.Add(runningTotal);
                        LineChartData.Datasets.Find(
                            element => element.UserName == StatBurstProjection)?.Data.Add(runningTotal);
                        burst = (today + yesterday) / 2;
                        burstProjection = runningTotal + burst;
                        yesterday = today;
                    }
                    else
                    {
                        LineChartData.Datasets.Find(
                            element => element.UserName == StatBurstProjection)?.Data.Add(burstProjection);
                        burstProjection += burst;
                    }
                    LineChartData.Datasets.Find(element => element.UserName == StatProjection)?.Data.Add(projection);
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
            var LineChartData = new ChartRootData();
            var list = await GetWordsPerDayPerUserCounts(projectId);
            // if the list is null or empty return new ChartRootData to generate a empty Chart
            if (list is null || list.Count == 0)
            {
                return LineChartData;
            }

            // add the daily totals dataset first
            LineChartData.Datasets.Add(new(StatDailyTotal));

            // update the ChartRootData based on the order of the WordsPerDayPerUserCount from the list
            foreach (var temp in list)
            {
                LineChartData.Dates.Add(temp.DateTime.ToISO8601TimeFormatDateOnlyString());

                var totalDay = 0;
                foreach (var item in temp.UserNameCountDictionary)
                {
                    totalDay += item.Value;
                    var dataset = LineChartData.Datasets.Find(element => element.UserName == item.Key);
                    if (dataset is null)
                    {
                        LineChartData.Datasets.Add(new(item.Key, item.Value));
                    }
                    else
                    {
                        dataset.Data.Add(item.Value);
                    }
                }
                LineChartData.Datasets.Find(element => element.UserName == StatDailyTotal)!.Data.Add(totalDay);
            }

            return LineChartData;
        }


        /// <summary>
        /// Get <see cref="SemanticDomainUserCount"/> to generate a SemanticDomain per User statistics
        /// </summary>
        /// <returns> A List of SemanticDomainUserCount <see cref="SemanticDomainUserCount"/> </returns>
        public async Task<List<SemanticDomainUserCount>> GetSemanticDomainUserCounts(string projectId)
        {
            var wordList = await _wordRepo.GetFrontier(projectId);
            var resUserMap = new Dictionary<string, SemanticDomainUserCount>();

            // Get all users of the project
            var allUsers = await _userRepo.GetAllUsers();
            var projectUsers = allUsers.FindAll(user => user.ProjectRoles.ContainsKey(projectId));

            // build a SemanticDomainUserCount object hashMap with userId as the key 
            foreach (var u in projectUsers)
            {
                resUserMap.Add(u.Id, new(u.Id, u.Username));
            }

            // unknownUser is for legacy data without a userId under SemanticDomain model
            var unknownId = "unknownUserId";
            var unknownName = "unknownUser";
            resUserMap.Add(unknownId, new(unknownId, unknownName));

            foreach (var word in wordList)
            {
                foreach (var sense in word.Senses)
                {
                    foreach (var sd in sense.SemanticDomains)
                    {
                        var userId = sd.UserId;
                        var domainName = sd.Name;

                        // if the SemanticDomain have a userId and exist in HashMap
                        SemanticDomainUserCount? domainUserValue;
                        if (userId is null || !resUserMap.TryGetValue(userId, out domainUserValue))
                        {
                            domainUserValue = resUserMap[unknownId];
                        }

                        // update DomainCount
                        if (domainUserValue.DomainSet.Add(domainName))
                        {
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
