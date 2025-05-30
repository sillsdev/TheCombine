using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using static SIL.Extensions.DateTimeExtensions;

namespace BackendFramework.Models
{

    /// <summary>
    /// This class contains all the data needed by StatisticsService to report on how many words a user has
    /// collected in each domain.
    /// </summary>
    /// <remarks> This object is not stored in the database. </remarks>
    public class SemanticDomainUserCount
    {
        [Required]
        public string Id { get; set; }

        public string Username { get; set; }
        [Required]

        public HashSet<string> DomainSet { get; set; }
        public int DomainCount { get; set; }
        public int WordCount { get; set; }

        public SemanticDomainUserCount()
        {
            Id = "";
            Username = "";
            DomainSet = [];
            DomainCount = 0;
            WordCount = 0;
        }

        public SemanticDomainUserCount(string id, string username) : this()
        {
            Id = id;
            Username = username;
        }
    }

    /// <summary>
    /// This class contains all the data needed by StatisticsService to report on how many words have been collected
    /// in each domain.
    /// </summary>
    /// <remarks> This object is not stored in the database. </remarks>
    public class SemanticDomainCount
    {
        [Required]
        public SemanticDomainTreeNode SemanticDomainTreeNode { get; set; }

        [Required]
        public int Count { get; set; }

        public SemanticDomainCount(SemanticDomainTreeNode semanticDomainTreeNode, int count)
        {
            SemanticDomainTreeNode = semanticDomainTreeNode;
            Count = count;
        }
    }

    /// <summary>
    /// This class contains the data needed by StatisticsService to generate how many words have been collected per day
    /// per user.
    /// </summary>
    /// <remarks> This object is not stored in the database. </remarks>
    public class WordsPerDayPerUserCount
    {
        [Required]
        public DateTime DateTime { get; set; }

        [Required]
        public Dictionary<string, int> UserNameCountDictionary { get; set; }

        public WordsPerDayPerUserCount(string isoString)
        {
            DateTime = isoString.ParseModernPastDateTimePermissivelyWithException();
            UserNameCountDictionary = [];
        }
    }

    /// <summary> This class contains the data needed by StatisticsService to create Root Data for Chart. </summary>
    /// <remarks> This object is not stored in the database. </remarks>
    public class ChartRootData
    {
        [Required]
        public List<string> Dates { get; set; }
        [Required]
        public List<Dataset> Datasets { get; set; }

        public ChartRootData()
        {
            Dates = [];
            Datasets = [];
        }
    }

    /// <summary> This class contains the data needed by StatisticsService to fill out ChartRootData. </summary>
    /// <remarks> This object is not stored in the database. </remarks>
    public class Dataset
    {
        [Required]
        public string UserName { get; set; }
        [Required]
        public List<int> Data { get; set; }

        public Dataset(string userName)
        {
            UserName = userName;
            Data = [];
        }
        public Dataset(string userName, int data)
        {
            UserName = userName;
            Data = [data];
        }
    }

}
