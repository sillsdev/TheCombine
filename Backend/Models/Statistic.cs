using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using SIL.Extensions;

namespace BackendFramework.Models
{

    //interface DatasetsProps {
    //   label: string;
    //   data: Array<number>;
    //   borderColor: string;
    //   backgroundColor: string;
    // }

    public class Dataset
    {
        [Required]
        public string Label { get; set; }
        [Required]
        public int[] Data { get; set; }

        public string BorderColor { get; set; }

        public string BackgroundColor { get; set; }

        public Dataset(string label, int data)
        {
            Label = label;
            Data = new int[] { data };
            BorderColor = "";
            BackgroundColor = "";
        }
    }


    /*
        data object just for Service method used only
        Not for MongoDB store
    */
    /// <summary> Contains Id/username, DomainHashSet/DomainCount and WordCount for Words Per User Statistics </summary>
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



    /*
        data object just for Service method used only
        Not for MongoDB store
    */
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

    /*
        data object just for Service method used only
        Not for MongoDB store
    */
    //The data structure is for per user per day chartJS use only
    public class WordsPerDayUserChartJSCount
    {
        [Required]
        public DateTime DateTime { get; set; }

        [Required]
        public Dictionary<string, int> UserNameCountDictionary { get; set; }

        public WordsPerDayUserChartJSCount(string isoString)
        {
            DateTime = DateTimeExtensions.ParseDateTimePermissivelyWithException(isoString);
            UserNameCountDictionary = new Dictionary<string, int>();
        }
    }



    //interface LineChartDataProps {
    //   labels: Array<string>;
    //   datasets: Array<DatasetsProps>;
    // }

    public class ChartData
    {
        [Required]
        [BsonElement("labels")]
        public string[] Labels { get; set; }
        [Required]
        [BsonElement("datasets")]
        public Dataset[] Datasets { get; set; }

        public ChartData()
        {
            Labels = new string[] { };
            Datasets = new Dataset[] { };
        }
    }

}
