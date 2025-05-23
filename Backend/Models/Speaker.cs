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

        /// <summary> Create a deep copy. </summary>
        public Speaker Clone()
        {
            // Shallow copy is sufficient.
            return (Speaker)MemberwiseClone();
        }
    }

    public enum ConsentType
    {
        None = 0,
        Audio,
        Image
    }
}
