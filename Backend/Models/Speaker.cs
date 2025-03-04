using System;
using System.ComponentModel.DataAnnotations;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BackendFramework.Models
{
    /// <summary>
    /// Project Speaker that can have a consent form and can be associated with Pronunciations.
    /// The speaker's consent for will have file name equal to .Id of the Speaker.
    /// </summary>
    public class Speaker
    {
        [Required]
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [Required]
        [BsonElement("projectId")]
        public string ProjectId { get; set; }

        [Required]
        [BsonElement("name")]
        public string Name { get; set; }

        [Required]
        [BsonElement("consent")]
        public ConsentType Consent { get; set; }

        public Speaker()
        {
            Id = "";
            ProjectId = "";
            Name = "";
        }

        public Speaker Clone()
        {
            return new Speaker
            {
                Id = Id,
                ProjectId = ProjectId,
                Name = Name,
                Consent = Consent
            };
        }

        public bool ContentEquals(Speaker other)
        {
            return ProjectId.Equals(other.ProjectId, StringComparison.Ordinal) &&
                Name.Equals(other.Name, StringComparison.Ordinal) &&
                Consent == other.Consent;
        }
    }

    public enum ConsentType
    {
        None = 0,
        Audio,
        Image
    }
}
