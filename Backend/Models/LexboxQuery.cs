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

        public static List<string> GetActiveTags(List<WsIdDto> wsList)
        {
            return wsList.Where(ws => ws.IsActive).OrderByDescending(ws => ws.IsDefault).Select(ws => ws.Tag).ToList();
        }
    }

    public sealed class LexboxQueryException(string title, string detail) : Exception(detail)
    {
        public string Title { get; } = title;
    }

    public sealed class LexboxEntry
    {
        public Dictionary<string, string> CitationForm { get; init; } = [];
        public DateTime? DeletedAt { get; init; }
        public Guid Id { get; init; }
        public Dictionary<string, string> LexemeForm { get; init; } = [];
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

            return new Word
            {
                Guid = Id,
                Id = Guid.NewGuid().ToString(),
                Note = new Note(noteLang, noteText),
                Senses = Senses
                    .Select(s => s.ToSense(analysisLangs)).Where(s => s is not null).OfType<Sense>().ToList(),
                UsingCitationForm = usingCitationForm,
                Vernacular = vernacular,
            };
        }
    }

    public sealed class LexboxSense
    {
        public Dictionary<string, LexboxRichString> Definition { get; init; } = [];
        public DateTime? DeletedAt { get; init; }
        public Dictionary<string, string> Gloss { get; init; } = [];
        public Guid Id { get; init; }
        public LexboxPartOfSpeech? PartOfSpeech { get; init; }
        public List<LexboxSemanticDomain> SemanticDomains { get; init; } = [];

        public Sense? ToSense(IEnumerable<string>? langs = null)
        {
            // Ignore any sense that was deleted.
            return DeletedAt is null ? null : new()
            {
                Definitions = Definition
                    .Select(kvp => new Definition { Language = kvp.Key, Text = kvp.Value.GetPlainText() }).ToList(),
                Glosses = Gloss.Select(kvp => new Gloss { Def = kvp.Value, Language = kvp.Key }).ToList(),
                GrammaticalInfo = PartOfSpeech?.ToGrammaticalInfo(langs) ?? new GrammaticalInfo(),
                Guid = Id,
                SemanticDomains = SemanticDomains.Select(sd => sd.ToSemanticDomain(langs)).ToList(),
            };
        }
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
