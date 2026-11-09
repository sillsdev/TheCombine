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
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = "";

        [BsonElement("projectId")]
        public string ProjectId { get; set; } = "";

        [BsonElement("domainId")]
        public string DomainId { get; set; } = "";

        [BsonElement("count")]
        public int Count { get; set; }

        public ProjectSemanticDomainCount() { }

        public ProjectSemanticDomainCount(string projectId, string domainId, int count = 0)
        {
            ProjectId = projectId;
            DomainId = domainId;
            Count = count;
        }
    }
}
