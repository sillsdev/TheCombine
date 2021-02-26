using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Http;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json;

namespace BackendFramework.Models
{
    public class Word
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        /// <summary>
        /// This Guid is important for Lift round-tripping with other applications and must remain stable through
        /// Word edits.
        /// </summary>
        [BsonElement("guid")]
        public Guid Guid { get; set; }

        [BsonElement("vernacular")]
        public string Vernacular { get; set; }

        [BsonElement("plural")]
        public string Plural { get; set; }

        [BsonElement("senses")]
        public List<Sense> Senses { get; set; }

        [BsonElement("audio")]
        public List<string> Audio { get; set; }

        [BsonElement("created")]
        public string Created { get; set; }

        [BsonElement("modified")]
        public string Modified { get; set; }

        [BsonElement("accessibility")]
        [BsonRepresentation(BsonType.String)]
        public State Accessibility { get; set; }

        [BsonElement("history")]
        public List<string> History { get; set; }

        [BsonElement("partOfSpeech")]
        public string PartOfSpeech { get; set; }

        [BsonElement("editedBy")]
        public List<string> EditedBy { get; set; }

        [BsonElement("otherField")]
        public string OtherField { get; set; }

        [BsonElement("projectId")]
        public string ProjectId { get; set; }

        [BsonElement("note")]
        public Note Note { get; set; }

        public Word()
        {
            Id = "";

            // By default generate a new, unique Guid for each new Word.
            Guid = Guid.NewGuid();
            Vernacular = "";
            Plural = "";
            Created = "";
            Modified = "";
            PartOfSpeech = "";
            OtherField = "";
            ProjectId = "";
            Accessibility = State.Active;
            Audio = new List<string>();
            EditedBy = new List<string>();
            History = new List<string>();
            Senses = new List<Sense>();
            Note = new Note();
        }

        public Word Clone()
        {
            var clone = new Word
            {
                Id = (string)Id.Clone(),
                Guid = Guid,
                Vernacular = (string)Vernacular.Clone(),
                Plural = (string)Plural.Clone(),
                Created = (string)Created.Clone(),
                Modified = (string)Modified.Clone(),
                PartOfSpeech = (string)PartOfSpeech.Clone(),
                OtherField = (string)OtherField.Clone(),
                ProjectId = (string)ProjectId.Clone(),
                Accessibility = Accessibility,
                Audio = new List<string>(),
                EditedBy = new List<string>(),
                History = new List<string>(),
                Senses = new List<Sense>(),
                Note = Note.Clone()
            };

            foreach (var file in Audio)
            {
                clone.Audio.Add((string)file.Clone());
            }
            foreach (var id in EditedBy)
            {
                clone.EditedBy.Add((string)id.Clone());
            }
            foreach (var id in History)
            {
                clone.History.Add((string)id.Clone());
            }
            foreach (var sense in Senses)
            {
                clone.Senses.Add(sense.Clone());
            }

            return clone;
        }

        public bool ContentEquals(Word other)
        {
            return
                other.Vernacular.Equals(Vernacular) &&
                other.Plural.Equals(Plural) &&
                other.PartOfSpeech.Equals(PartOfSpeech) &&
                other.OtherField.Equals(OtherField) &&
                other.ProjectId.Equals(ProjectId) &&

                other.Audio.Count == Audio.Count &&
                other.Audio.All(Audio.Contains) &&

                other.Senses.Count == Senses.Count &&
                other.Senses.All(Senses.Contains) &&

                other.Note.Equals(Note);
        }

        public override bool Equals(object? obj)
        {
            if (!(obj is Word other) || GetType() != obj.GetType())
            {
                return false;
            }

            return
                other.Id.Equals(Id) &&
                ContentEquals(other) &&
                other.Guid == Guid &&
                other.Created.Equals(Created) &&
                other.Modified.Equals(Modified) &&
                other.EditedBy.Count == EditedBy.Count &&
                other.EditedBy.All(EditedBy.Contains) &&
                other.History.Count == History.Count &&
                other.History.All(History.Contains);
        }

        public override int GetHashCode()
        {
            var hash = new HashCode();
            hash.Add(Id);
            hash.Add(Guid);
            hash.Add(Vernacular);
            hash.Add(Plural);
            hash.Add(Senses);
            hash.Add(Audio);
            hash.Add(Created);
            hash.Add(Modified);
            hash.Add(Accessibility);
            hash.Add(History);
            hash.Add(PartOfSpeech);
            hash.Add(EditedBy);
            hash.Add(OtherField);
            hash.Add(ProjectId);
            hash.Add(Note);
            return hash.ToHashCode();
        }
    }

    /// <summary> A note associated with a Word, compatible with FieldWorks. </summary>
    public class Note
    {
        /// <summary> The bcp-47 code for the language the note is written in. </summary>
        public string Language { get; set; }

        /// <summary> The contents of the note. </summary>
        public string Text { get; set; }

        public Note()
        {
            Language = "";
            Text = "";
        }

        public Note(string language, string text)
        {
            Language = language;
            Text = text;
        }

        public Note Clone()
        {
            return new Note
            {
                Language = (string)Language.Clone(),
                Text = (string)Text.Clone()
            };
        }

        /// <summary> Whether the Note contains any contents that can be serialized. </summary>
        public bool IsBlank()
        {
            return Text == "";
        }

        public override bool Equals(object? obj)
        {
            if (!(obj is Note other) || GetType() != obj.GetType())
            {
                return false;
            }

            return Language.Equals(other.Language) && Text.Equals(other.Text);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Language, Text);
        }
    }

    public class Sense
    {
        /// <summary>
        /// This Guid is important for Lift round-tripping with other applications and must remain stable through Word
        /// edits.
        /// </summary>
        [BsonElement("guid")]
        public Guid Guid { get; set; }

        [BsonElement("Glosses")]
        public List<Gloss> Glosses { get; set; }

        [BsonElement("SemanticDomains")]
        public List<SemanticDomain> SemanticDomains { get; set; }

        [BsonElement("accessibility")]
        [BsonRepresentation(BsonType.String)]
        public State Accessibility { get; set; }

        public Sense()
        {
            // By default generate a new, unique Guid for each new Sense.
            Guid = Guid.NewGuid();
            Accessibility = State.Active;
            Glosses = new List<Gloss>();
            SemanticDomains = new List<SemanticDomain>();
        }

        public Sense Clone()
        {
            var clone = new Sense
            {
                Guid = Guid,
                Accessibility = Accessibility,
                Glosses = new List<Gloss>(),
                SemanticDomains = new List<SemanticDomain>()
            };

            foreach (var gloss in Glosses)
            {
                clone.Glosses.Add(gloss.Clone());
            }
            foreach (var sd in SemanticDomains)
            {
                clone.SemanticDomains.Add(sd.Clone());
            }

            return clone;
        }

        public override bool Equals(object? obj)
        {
            if (!(obj is Sense other) || GetType() != obj.GetType())
            {
                return false;
            }

            return
                other.Guid == Guid &&
                other.Accessibility == Accessibility &&
                other.Glosses.Count == Glosses.Count &&
                other.Glosses.All(Glosses.Contains) &&

                other.SemanticDomains.Count == SemanticDomains.Count &&
                other.SemanticDomains.All(SemanticDomains.Contains);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Guid, Accessibility, Glosses, SemanticDomains);
        }
    }

    public class Gloss
    {
        /// <summary> The bcp-47 code for the language the note is written in. </summary>
        public string Language { get; set; }

        /// <summary> The gloss string. </summary>
        public string Def { get; set; }

        public Gloss()
        {
            Language = "";
            Def = "";
        }

        public Gloss Clone()
        {
            return new Gloss
            {
                Language = (string)Language.Clone(),
                Def = (string)Def.Clone()
            };
        }

        public override bool Equals(object? obj)
        {
            if (!(obj is Gloss other) || GetType() != obj.GetType())
            {
                return false;
            }

            return Language.Equals(other.Language) && Def.Equals(other.Def);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Language, Def);
        }
    }

    public class SemanticDomain
    {
        public string Name { get; set; }
        public string Id { get; set; }
        public string Description { get; set; }

        public SemanticDomain Clone()
        {
            return new SemanticDomain
            {
                Name = (string)Name.Clone(),
                Id = (string)Id.Clone(),
                Description = (string)Description.Clone()
            };
        }

        public SemanticDomain()
        {
            Name = "";
            Id = "";
            Description = "";
        }

        public override bool Equals(object? obj)
        {
            if (!(obj is SemanticDomain other) || GetType() != obj.GetType())
            {
                return false;
            }

            return Name.Equals(other.Name) && Id.Equals(other.Id) && Description.Equals(other.Description);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Name, Id, Description);
        }
    }

    /// <summary> Helper object that contains a file along with its name and path </summary>
    public class FileUpload
    {
        public IFormFile? File { get; set; }
        public string Name { get; set; }
        public string FilePath { get; set; }

        /// <summary> Models by ASP.NET Core POSTs must have a constructor with zero arguments. </summary>
        public FileUpload()
        {
            File = null;
            Name = "";
            FilePath = "";
        }
    }

    /// <summary>
    /// Helper object that contains a parent word and a number of children which will be merged into it
    /// along with the userId of who made the merge and at what time
    /// </summary>
    public class MergeWords
    {
        public Word Parent { get; set; }
        public List<MergeSourceWord> ChildrenWords { get; set; }

        public MergeWords()
        {
            Parent = new Word();
            ChildrenWords = new List<MergeSourceWord>();
        }
    }

    /// <summary> Helper object that contains a wordId and the type of merge that should be performed </summary>
    public class MergeSourceWord
    {
        public string SrcWordId;
        public List<State> SenseStates;

        public MergeSourceWord()
        {
            SrcWordId = "";
            SenseStates = new List<State>();
        }
    }

    /// <summary> Information about the state of the word in that database used for merging </summary>
    [JsonConverter(typeof(StringEnumConverter))]
    public enum State
    {
        Active,
        Deleted,
        Sense,
        Duplicate,
        Separate
    }
}
