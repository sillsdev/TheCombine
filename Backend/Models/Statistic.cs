using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using SIL.Extensions;

namespace BackendFramework.Models
{

    /// <summary>
    /// This class contains all the data needed by the Statistics service to report on how many words a user has
    /// collected in each domain.
    /// </summary>
    /// <remarks> This object is for use in the Statistics service and is not stored in the database. </remarks>
    public class SemanticDomainUserCount
    {
        [Required]
        public string Id { get; set; }

        public string Username { get; set; }
        [Required]

        public HashSet<string> DomainSet { get; set; }
        public int DomainCount { get; set; }
        public int WordCount { get; set; }

        public SemanticDomainUserCount(string id, string username)
        {
            Id = id;
            Username = username;
            DomainSet = new HashSet<string>();
            DomainCount = 0;
            WordCount = 0;
        }

        public SemanticDomainUserCount()
        {
            Id = "";
            Username = "";
            DomainSet = new HashSet<string>();
            DomainCount = 0;
            WordCount = 0;
        }
    }

    /// <summary>
    /// This class contains all the data needed by the Statistics service to report on how many words has collected
    /// in each domain.
    /// </summary>
    /// <remarks> This object is for use in the Statistics service and is not stored in the database. </remarks>
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
    /// This class contains the data needed by the Statistics service to generate how many words has collected per day
    /// per user
    /// </summary>
    /// <remarks> This object is for use in the Statistics service and is not stored in the database. </remarks>
    public class WordsPerDayPerUserCount
    {
        [Required]
        public DateTime DateTime { get; set; }

        [Required]
        public Dictionary<string, int> UserNameCountDictionary { get; set; }

        public WordsPerDayPerUserCount(string isoString)
        {
            DateTime = DateTimeExtensions.ParseDateTimePermissivelyWithException(isoString);
            UserNameCountDictionary = new Dictionary<string, int>();
        }
    }

    /// <summary> This class contains the data needed by the Statistics service to create Root Data for Chart </summary>
    /// <remarks> This object is for use in the Statistics service and is not stored in the database. </remarks>
    public class ChartRootData
    {
        [Required]
        public List<string> Dates { get; set; }
        [Required]
        public List<Dataset> Datasets { get; set; }

        public ChartRootData()
        {
            Dates = new List<string>();
            Datasets = new List<Dataset>();
        }
    }

    /// <summary> This class contains the data needed by the Statistics service to fill out ChartRootData </summary>
    /// <remarks> This object is for use in the Statistics service and is not stored in the database. </remarks>
    public class Dataset
    {
        [Required]
        public string UserName { get; set; }
        [Required]
        public List<int> Data { get; set; }

        public Dataset(string userName, int data)
        {
            UserName = userName;
            Data = new List<int>() { data };
        }
    }

}
