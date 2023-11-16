using System;
using System.ComponentModel.DataAnnotations;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BackendFramework.Models
{
    /// <summary>
    /// Helper object that contains a parent word and a number of children which will be merged into it
    /// along with the userId of who made the merge and at what time
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
        public Consent Consent { get; set; }

        public Speaker()
        {
            Id = "";
            ProjectId = "";
            Name = "";
            Consent = new Consent();
        }

        public Speaker Clone()
        {
            return new Speaker
            {
                Id = Id,
                ProjectId = ProjectId,
                Name = Name,
                Consent = Consent.Clone()
            };
        }

        public bool ContentEquals(Speaker other)
        {
            return ProjectId.Equals(other.ProjectId, StringComparison.Ordinal) &&
                Name.Equals(other.Name, StringComparison.Ordinal) &&
                Consent.Equals(other.Consent);
        }

        public override bool Equals(object? obj)
        {
            return obj is Speaker other && GetType() == obj.GetType() &&
                Id.Equals(other.Id, StringComparison.Ordinal) && ContentEquals(other);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Id, ProjectId, Name, Consent);
        }
    }

    public class Consent
    {
        [Required]
        [BsonElement("fileName")]
        public string? FileName { get; set; }

        [Required]
        [BsonElement("fileType")]
        public ConsentType? FileType { get; set; }

        public Consent Clone()
        {
            return new Consent
            {
                FileName = FileName,
                FileType = FileType
            };
        }

        private bool ContentEquals(Consent other)
        {
            return FileName == other.FileName && FileType == other.FileType;
        }

        public override bool Equals(object? obj)
        {
            return obj is Consent other && GetType() == obj.GetType() && ContentEquals(other);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(FileName, FileType);
        }
    }

    public enum ConsentType
    {
        Audio,
        Image
    }
}
