using System.ComponentModel.DataAnnotations;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BackendFramework.Models
{
    /// <summary>
    /// A cached tally of how many frontier sense-occurrences of a semantic domain exist within a project.
    /// There is one document per (<see cref="ProjectId"/>, <see cref="DomainId"/>) pair.
    /// </summary>
    public class ProjectSemanticDomainCount
    {
        [Required]
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

        public ProjectSemanticDomainCount(string projectId, string domainId, int count = 0) : this()
        {
            ProjectId = projectId;
            DomainId = domainId;
            Count = count;
        }

        /// <summary> Create a deep copy. </summary>
        public ProjectSemanticDomainCount Clone()
        {
            // Shallow copy is sufficient.
            return (ProjectSemanticDomainCount)MemberwiseClone();
        }
    }
}
