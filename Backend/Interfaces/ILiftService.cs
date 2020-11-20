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

        // Methods to store, retrieve, and delete an export string in a common dictionary
        void StoreExport(string key, byte[] file);
        byte[]? RetrieveExport(string key);
        bool DeleteExport(string key);
    }
}
