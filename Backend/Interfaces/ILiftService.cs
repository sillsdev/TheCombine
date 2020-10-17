using BackendFramework.Models;
using SIL.Lift.Parsing;

namespace BackendFramework.Interfaces
{
    public interface ILiftService
    {
        ILexiconMerger<LiftObject, LiftEntry, LiftSense, LiftExample> GetLiftImporterExporter(
            string projectId, IProjectService projectService, IWordRepository wordRepo);
        string LiftExport(string projectId, IWordRepository wordRepo, IProjectService projectService);
        void LdmlImport(string filePath, string langTag, IProjectService projectService, Project project);
    }
}
