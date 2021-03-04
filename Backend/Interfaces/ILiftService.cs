using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Models;
using SIL.Lift.Parsing;

namespace BackendFramework.Interfaces
{
    public interface ILiftService
    {
        ILexiconMerger<LiftObject, LiftEntry, LiftSense, LiftExample> GetLiftImporterExporter(
            string projectId, IProjectService projectService, IWordRepository wordRepo);
        void LdmlImport(string filePath, string langTag, IProjectService projectService, Project project);
        Task<string> LiftExport(string projectId, IWordRepository wordRepo, IProjectService projectService);

        // Methods for list of imported entries for storing in the database.
        void ClearImportEntries();
        bool InitializeImportEntries();
        List<Word> GetImportEntries();

        // Methods to store, retrieve, and delete an export string in a common dictionary.
        void StoreExport(string key, string filePath);
        string? RetrieveExport(string key);
        bool DeleteExport(string key);
        void SetExportInProgress(string key, bool isInProgress);
        bool IsExportInProgress(string key);
    }
}
