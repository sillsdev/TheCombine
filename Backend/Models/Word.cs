using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BackendFramework.Models
{
    public class Word
    {
        [Required]
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        /// <summary>
        /// This Guid is important for Lift round-tripping with other applications and must remain stable through
        /// Word edits.
        /// </summary>
        [Required]
        [BsonElement("guid")]
        [BsonGuidRepresentation(GuidRepresentation.CSharpLegacy)]
#pragma warning disable CA1720
        public Guid Guid { get; set; }
#pragma warning restore CA1720

        [Required]
        [BsonElement("vernacular")]
        public string Vernacular { get; set; }

        [BsonElement("usingCitationForm")]
        public bool UsingCitationForm { get; set; }

        /// <summary> Not implemented in frontend. </summary>
        [BsonElement("plural")]
        public string Plural { get; set; }

        [Required]
        [BsonElement("senses")]
        public List<Sense> Senses { get; set; }

        [Required]
        [BsonElement("audio")]
        public List<Pronunciation> Audio { get; set; }

        [Required]
        [BsonElement("created")]
        public string Created { get; set; }

        [Required]
        [BsonElement("modified")]
        public string Modified { get; set; }

        [Required]
        [BsonElement("accessibility")]
        [BsonRepresentation(BsonType.String)]
        public Status Accessibility { get; set; }

        [BsonElement("protectReasons")]
        public List<ProtectReason> ProtectReasons { get; set; }

        [Required]
        [BsonElement("history")]
        public List<string> History { get; set; }

        /// <summary> Not implemented in frontend. </summary>
        [BsonElement("editedBy")]
        public List<string> EditedBy { get; set; }

        /// <summary> Not implemented in frontend. </summary>
        [BsonElement("otherField")]
        public string OtherField { get; set; }

        [Required]
        [BsonElement("projectId")]
        public string ProjectId { get; set; }

        [Required]
        [BsonElement("note")]
        public Note Note { get; set; }

        [Required]
        [BsonElement("flag")]
        public Flag Flag { get; set; }

        public Word()
        {
            Id = "";

            // By default generate a new, unique Guid for each new Word.
            Guid = Guid.NewGuid();
            Vernacular = "";
            UsingCitationForm = false;
            Plural = "";
            Created = "";
            Modified = "";
            OtherField = "";
            ProjectId = "";
            Accessibility = Status.Active;
            Audio = new();
            EditedBy = new();
            History = new();
            ProtectReasons = new();
            Senses = new();
            Note = new();
            Flag = new();
        }

        /// <summary> Create a deep copy. </summary>
        public Word Clone()
        {
            return new()
            {
                Id = Id,
                Guid = Guid,
                Vernacular = Vernacular,
                UsingCitationForm = UsingCitationForm,
                Plural = Plural,
                Created = Created,
                Modified = Modified,
                OtherField = OtherField,
                ProjectId = ProjectId,
                Accessibility = Accessibility,
                Audio = Audio.Select(p => p.Clone()).ToList(),
                EditedBy = EditedBy.Select(id => id).ToList(),
                History = History.Select(id => id).ToList(),
                ProtectReasons = ProtectReasons.Select(pr => pr.Clone()).ToList(),
                Senses = Senses.Select(s => s.Clone()).ToList(),
                Note = Note.Clone(),
                Flag = Flag.Clone(),
            };
        }

        /// <summary> Determine whether vernacular and sense strings contain those of other word. </summary>
        public bool Contains(Word other)
        {
            return
                ProjectId == other.ProjectId &&
                Vernacular == other.Vernacular &&
                other.Senses.All(s => Senses.Any(s.IsContainedIn));
        }

        /// <summary>
        /// Append contents of other contained word.
        /// Warning! The following content of the other word are lost:
        /// Plural, Created, Modified, Accessibility, OtherField.
        /// </summary>
        /// <returns> A bool: true if operation succeeded and word updated. </returns>
        public bool AppendContainedWordContents(Word other, string userId)
        {
            // Confirm that the other word is contained
            if (!Contains(other))
            {
                return false;
            }
            var sensesWithAddedSemDoms = Senses.Select(s => s.Clone()).ToList();
            foreach (var otherSense in other.Senses)
            {
                var containingSense = sensesWithAddedSemDoms.Find(otherSense.IsContainedIn);
                if (containingSense is null)
                {
                    return false;
                }
                containingSense.CopyDomains(otherSense, userId);
            }

            // Preserve other word's SemanticDomains, Note, Flag, Audio, EditedBy, History
            Senses = sensesWithAddedSemDoms;
            Note.Append(other.Note);
            Flag.Append(other.Flag);
            Audio.AddRange(other.Audio);
            EditedBy.AddRange(other.EditedBy);
            EditedBy = EditedBy.Distinct().ToList();
            History.AddRange(other.History);
            return true;
        }
    }

    /// <summary> A pronunciation associated with a Word. </summary>
    public class Pronunciation
    {
        /// <summary> The audio file name. </summary>
        [Required]
        [BsonElement("fileName")]
        public string FileName { get; set; }

        /// <summary> The speaker id. </summary>
        [Required]
        [BsonElement("speakerId")]
        public string SpeakerId { get; set; }

        /// <summary> For imported audio, to prevent modification or deletion (unless the word is deleted). </summary>
        [Required]
        [BsonElement("protected")]
        public bool Protected { get; set; }

        public Pronunciation()
        {
            FileName = "";
            SpeakerId = "";
            Protected = false;
        }

        public Pronunciation(string fileName) : this()
        {
            FileName = fileName;
        }

        public Pronunciation(string fileName, string speakerId) : this(fileName)
        {
            SpeakerId = speakerId;
        }

        /// <summary> Create a deep copy. </summary>
        public Pronunciation Clone()
        {
            // Shallow copy is sufficient.
            return (Pronunciation)MemberwiseClone();
        }
    }

    /// <summary> A note associated with a Word, compatible with FieldWorks. </summary>
    public class Note
    {
        /// <summary> The bcp-47 code for the language the note is written in. </summary>
        [Required]
        public string Language { get; set; }

        /// <summary> The contents of the note. </summary>
        [Required]
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

        /// <summary> Create a deep copy. </summary>
        public Note Clone()
        {
            // Shallow copy is sufficient.
            return (Note)MemberwiseClone();
        }

        /// <summary> Check if content is the same as another Note. </summary>
        public bool ContentEquals(Note other)
        {
            return Language.Equals(other.Language, StringComparison.Ordinal) &&
                Text.Equals(other.Text, StringComparison.Ordinal);
        }

        /// <summary> Whether the Note contains any non-whitespace contents. </summary>
        public bool IsBlank()
        {
            return string.IsNullOrWhiteSpace(Text);
        }

        /// <summary> Append other note to the present note. </summary>
        public void Append(Note other)
        {
            // There's nothing to append if other note is blank or identical.
            if (other.IsBlank() || ContentEquals(other))
            {
                return;
            }

            // If present note is blank, simply copy other note.
            if (IsBlank())
            {
                Language = other.Language;
                Text = other.Text;
                return;
            }

            var langTag = Language == other.Language ? "" : $"[{other.Language}] ";
            Text += $"; {langTag}{other.Text}";
        }
    }

    /// <summary> A flag on a Word, for Combine data, not for export. </summary>
    public class Flag
    {
        /// <summary> Indicates if a flag is active. </summary>
        [Required]
        public bool Active { get; set; }

        /// <summary> User-specified text. </summary>
        [Required]
        public string Text { get; set; }

        public Flag()
        {
            Active = false;
            Text = "";
        }

        public Flag(string text)
        {
            Active = true;
            Text = text;
        }

        /// <summary> Create a deep copy. </summary>
        public Flag Clone()
        {
            // Shallow copy is sufficient.
            return (Flag)MemberwiseClone();
        }

        /// <summary> Check if content is the same as another Flag. </summary>
        public bool ContentEquals(Flag other)
        {
            return Active == other.Active && Text.Equals(other.Text, StringComparison.Ordinal);
        }

        /// <summary> Append other flag to the present flag. </summary>
        public void Append(Flag other)
        {
            // There's nothing to append if other flag is inactive/identical, or both are active and other is empty.
            if (!other.Active || ContentEquals(other) || (Active && string.IsNullOrWhiteSpace(other.Text)))
            {
                return;
            }

            // If present flag is inactive or empty, simply copy the active other flag.
            if (!Active || string.IsNullOrWhiteSpace(Text))
            {
                Active = true;
                Text = other.Text;
                return;
            }

            Text += $"; {other.Text}";
        }
    }
}
