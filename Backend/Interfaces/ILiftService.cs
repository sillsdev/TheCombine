using BackendFramework.Models;
using SIL.Lift.Parsing;

namespace BackendFramework.Interfaces
{
    public interface ILiftService
    {
        ILexiconMerger<LiftObject, LiftEntry, LiftSense, LiftExample> GetLiftImporterExporter(
            string projectId, IProjectService projectService, IWordRepository wordRepo);
        void LdmlImport(string filePath, string langTag, IProjectService projectService, Project project);
        string LiftExport(string projectId, IWordRepository wordRepo, IProjectService projectService);
        void AddExport(string userId, string encodedZip);
        string? GetExport(string userId);
        void RemoveExport(string userId);
    }
}
