using System;
using System.Collections.Generic;
using System.Linq;

namespace BackendFramework.Models
{
    public sealed class LexboxQuery
    {
        public const string QueryUrl = "https://lexbox.org/api/graphql";
        public const string MiniLcmBaseUrl = "https://lexbox.org/api/mini-lcm";
        public const string LfClassicBaseUrl = "https://lexbox.org/api/lfclassic";
        public const string MyProjectsQuery = @"query {
    myProjects {
        code
        description
        flexProjectMetadata {
            flexModelVersion
            langProjectId
            lexEntryCount
            projectId
            writingSystems {
                analysisWss {
                    isActive
                    isDefault
                    tag
                }
                vernacularWss {
                    isActive
                    isDefault
                    tag
                }
            }
        }
        id
        isConfidential
        name
        parentId
        projectOrigin
        repoSizeInKb
        resetStatus
        retentionPolicy
        type
        userCount
    }
}";

        public required string Query { get; init; }
    }

    public sealed class LexboxQueryResponse<T>
    {
        public T? Data { get; init; }
        public LexboxQueryError[]? Errors { get; init; }
    }

    public sealed class LexboxQueryError
    {
        public string? Message { get; init; }
    }

    public sealed class LexboxProject(LexboxProjectDto dto)
    {
        public List<string> AnalysisWsTags { get; init; } =
            WsIdDto.GetActiveTags(dto.FlexProjectMetadata?.WritingSystems?.AnalysisWss ?? []).ToList();
        public string Code { get; init; } = dto.Code;
        public string? Description { get; init; } = dto.Description;
        public Guid Id { get; init; } = dto.Id;
        public bool? IsConfidential { get; init; } = dto.IsConfidential;
        public string Name { get; init; } = dto.Name;
        public string Type { get; init; } = dto.Type;
        public List<string> VernacularWsTags { get; init; } =
            WsIdDto.GetActiveTags(dto.FlexProjectMetadata?.WritingSystems?.VernacularWss ?? []).ToList();
    }

    public sealed class MyProjectsData
    {
        public List<LexboxProjectDto> MyProjects { get; init; } = [];
    }

    public sealed class LexboxProjectDto
    {
        public string Code { get; init; } = "";
        public string? Description { get; init; }
        public ProjectMetadataDto? FlexProjectMetadata { get; init; }
        public Guid Id { get; init; }
        public bool? IsConfidential { get; init; }
        public string Name { get; init; } = "";
        public Guid? ParentId { get; init; }
        public string ProjectOrigin { get; init; } = "";
        public int? RepoSizeInKb { get; init; }
        public string ResetStatus { get; init; } = "";
        public string RetentionPolicy { get; init; } = "";
        public string Type { get; init; } = "";
        public int UserCount { get; init; }
    }

    public sealed class ProjectMetadataDto
    {
        public int? FlexModelVersion { get; init; }
        public Guid? LangProjectId { get; init; }
        public int? LexEntryCount { get; init; }
        public Guid ProjectId { get; init; }
        public ProjectWritingSystemsDto? WritingSystems { get; init; }
    }

    public sealed class ProjectWritingSystemsDto
    {
        public List<WsIdDto> AnalysisWss { get; init; } = [];
        public List<WsIdDto> VernacularWss { get; init; } = [];
    }

    public sealed class WsIdDto
    {
        public bool IsActive { get; init; }
        public bool IsDefault { get; init; }
        public string Tag { get; init; } = "";

        /// <summary> Gets the tags of active, non-audio writing systems, default first. </summary>
        public static List<string> GetActiveTags(List<WsIdDto> wsList)
        {
            return wsList.Where(ws => ws.IsActive && !IsAudioTag(ws.Tag))
                .OrderByDescending(ws => ws.IsDefault).Select(ws => ws.Tag).ToList();
        }

        /// <summary> Whether the tag is a FieldWorks audio writing system, e.g. "es-Zxxx-419-x-audio". </summary>
        public static bool IsAudioTag(string tag)
        {
            var subtags = tag.Split('-');
            var privateUseStart = Array.FindIndex(subtags, s => s.Equals("x", StringComparison.OrdinalIgnoreCase));
            return privateUseStart >= 0 && subtags.Skip(privateUseStart + 1)
                .Any(s => s.Equals("audio", StringComparison.OrdinalIgnoreCase));
        }
    }

    public sealed class LexboxQueryException(string title, string detail) : Exception(detail)
    {
        public string Title { get; } = title;
    }

    public sealed class LexboxEntry
    {
        // Lexbox defaults to "Stem", and "Unknown" carries no morph-type data to protect.
        private static readonly HashSet<string> UnprotectedMorphTypes = ["Stem", "Unknown"];

        public Dictionary<string, string> CitationForm { get; init; } = [];
        public List<LexboxDeletable> ComplexForms { get; init; } = [];
        public List<LexboxDeletable> Components { get; init; } = [];
        public DateTime? DeletedAt { get; init; }
        public Guid Id { get; init; }
        public Dictionary<string, string> LexemeForm { get; init; } = [];
        public Dictionary<string, LexboxRichString> LiteralMeaning { get; init; } = [];
        public string? MorphType { get; init; }
        public Dictionary<string, LexboxRichString> Note { get; init; } = [];
        public List<LexboxSense> Senses { get; init; } = [];

        public Word? ToWord(string vernacularLang, IEnumerable<string>? analysisLangs = null)
        {
            if (DeletedAt is not null)
            {
                // Ignore any entry that was deleted.
                return null;
            }

            CitationForm.TryGetValue(vernacularLang, out var vernacular);
            var usingCitationForm = !string.IsNullOrWhiteSpace(vernacular);
            if (!usingCitationForm)
            {
                LexemeForm.TryGetValue(vernacularLang, out vernacular);
            }
            vernacular = vernacular?.Trim();
            if (string.IsNullOrEmpty(vernacular))
            {
                // Ignore any entry with no citation/lexeme form in specified vernacular language.
                return null;
            }

            var noteLang = (analysisLangs ?? []).FirstOrDefault(Note.ContainsKey) ?? Note.Keys.FirstOrDefault() ?? "";
            var noteText = noteLang.Length > 0 && Note.TryGetValue(noteLang, out var noteRich)
                ? noteRich.GetPlainText()
                : "";

            var protectReasons = GetProtectReasons();
            return new Word
            {
                Accessibility = protectReasons.Count > 0 ? Status.Protected : Status.Active,
                Guid = Id,
                Id = Guid.NewGuid().ToString(),
                Note = new Note(noteLang, noteText),
                ProtectReasons = protectReasons,
                Senses = Senses
                    .Select(s => s.ToSense(analysisLangs)).Where(s => s is not null).OfType<Sense>().ToList(),
                UsingCitationForm = usingCitationForm,
                Vernacular = vernacular,
            };
        }

        /// <summary> Determine what entry data is not handled by The Combine. </summary>
        public List<ProtectReason> GetProtectReasons()
        {
            var reasons = new List<ProtectReason>();
            if (LiteralMeaning.Values.Any(lm => !string.IsNullOrWhiteSpace(lm.GetPlainText())))
            {
                reasons.Add(new() { Type = ReasonType.Field, Value = "literal-meaning" });
            }
            if (MorphType is not null && !UnprotectedMorphTypes.Contains(MorphType))
            {
                reasons.Add(new() { Type = ReasonType.TraitMorphType, Value = MorphType });
            }
            // The Combine keeps only one note language.
            var noteCount = Note.Values.Count(n => !string.IsNullOrWhiteSpace(n.GetPlainText()));
            if (noteCount > 1)
            {
                reasons.Add(new() { Type = ReasonType.Notes, Count = noteCount });
            }
            var relationCount = Components.Concat(ComplexForms).Count(r => r.DeletedAt is null);
            if (relationCount > 0)
            {
                reasons.Add(new() { Type = ReasonType.Relations, Count = relationCount });
            }
            return reasons;
        }
    }

    public sealed class LexboxSense
    {
        public Dictionary<string, LexboxRichString> Definition { get; init; } = [];
        public DateTime? DeletedAt { get; init; }
        public List<LexboxDeletable> ExampleSentences { get; init; } = [];
        public Dictionary<string, string> Gloss { get; init; } = [];
        public Guid Id { get; init; }
        public LexboxPartOfSpeech? PartOfSpeech { get; init; }
        public List<LexboxDeletable> Pictures { get; init; } = [];
        public List<LexboxSemanticDomain> SemanticDomains { get; init; } = [];

        public Sense? ToSense(IEnumerable<string>? langs = null)
        {
            if (DeletedAt is not null)
            {
                // Ignore any sense that was deleted.
                return null;
            }

            var protectReasons = GetProtectReasons();
            return new()
            {
                Accessibility = protectReasons.Count > 0 ? Status.Protected : Status.Active,
                Definitions = Definition
                    .Select(kvp => new Definition { Language = kvp.Key, Text = kvp.Value.GetPlainText() }).ToList(),
                Glosses = Gloss.Select(kvp => new Gloss { Def = kvp.Value, Language = kvp.Key }).ToList(),
                GrammaticalInfo = PartOfSpeech?.ToGrammaticalInfo(langs) ?? new GrammaticalInfo(),
                Guid = Id,
                ProtectReasons = protectReasons,
                SemanticDomains = SemanticDomains.Select(sd => sd.ToSemanticDomain(langs)).ToList(),
            };
        }

        /// <summary> Determine what sense data is not handled by The Combine. </summary>
        public List<ProtectReason> GetProtectReasons()
        {
            var reasons = new List<ProtectReason>();
            var exampleCount = ExampleSentences.Count(ex => ex.DeletedAt is null);
            if (exampleCount > 0)
            {
                reasons.Add(new() { Type = ReasonType.Examples, Count = exampleCount });
            }
            var pictureCount = Pictures.Count(pic => pic.DeletedAt is null);
            if (pictureCount > 0)
            {
                reasons.Add(new() { Type = ReasonType.Illustrations, Count = pictureCount });
            }
            return reasons;
        }
    }

    /// <summary> A Lexbox object whose content The Combine ignores, other than whether it was deleted. </summary>
    public sealed class LexboxDeletable
    {
        public DateTime? DeletedAt { get; init; }
    }

    public sealed class LexboxPartOfSpeech
    {
        public Guid Id { get; init; }
        public Dictionary<string, string> Name { get; init; } = [];

        public GrammaticalInfo ToGrammaticalInfo(IEnumerable<string>? langs = null)
        {
            var resolvedLang = (langs ?? []).FirstOrDefault(Name.ContainsKey) ?? Name.Keys.FirstOrDefault() ?? "";
            var name = resolvedLang.Length > 0 && Name.TryGetValue(resolvedLang, out var langName) ? langName : "";
            return new GrammaticalInfo(name);
        }
    }

    public sealed class LexboxSemanticDomain
    {
        public string Code { get; init; } = "";
        public Guid Id { get; init; }
        public Dictionary<string, string> Name { get; init; } = [];

        public SemanticDomain ToSemanticDomain(IEnumerable<string>? langs = null)
        {
            var resolvedLang = (langs ?? []).FirstOrDefault(Name.ContainsKey) ?? Name.Keys.FirstOrDefault() ?? "";
            var name = resolvedLang.Length > 0 && Name.TryGetValue(resolvedLang, out var langName) ? langName : "";
            return new SemanticDomain { Guid = Id.ToString(), Id = Code, Lang = resolvedLang, Name = name };
        }
    }

    public sealed class LexboxRichString
    {
        public List<LexboxRichSpan> Spans { get; init; } = [];

        public string GetPlainText() => string.Concat(Spans.Select(s => s.Text));
    }

    public sealed class LexboxRichSpan
    {
        public string Text { get; init; } = "";
    }

}
