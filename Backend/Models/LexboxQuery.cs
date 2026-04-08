using System;
using System.Collections.Generic;
using System.Linq;

namespace BackendFramework.Models
{
    public sealed class LexboxQuery
    {
        public const string QueryUrl = "https://lexbox.org/api/graphql";
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

}
