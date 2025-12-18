using System.ComponentModel.DataAnnotations;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BackendFramework.Models
{
    /// <summary>
    /// Tracks the number of senses in each semantic domain for a project.
    /// Used for performant statistics queries without scanning the entire Frontier collection.
    /// </summary>
    public class ProjectSemanticDomainCount
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [Required]
        [BsonElement("projectId")]
        public string ProjectId { get; set; }

        [Required]
        [BsonElement("domainId")]
        public string DomainId { get; set; }

        [Required]
        [BsonElement("count")]
        public int Count { get; set; }

        public ProjectSemanticDomainCount()
        {
            Id = "";
            ProjectId = "";
            DomainId = "";
            Count = 0;
        }

        public ProjectSemanticDomainCount(string projectId, string domainId, int count = 0)
        {
            Id = "";
            ProjectId = projectId;
            DomainId = domainId;
            Count = count;
        }
    }
}
