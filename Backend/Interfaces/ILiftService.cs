using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Models;
using SIL.Lift.Parsing;

namespace BackendFramework.Interfaces
{
    public interface ILiftService
    {
        ILiftMerger GetLiftImporterExporter(string projectId, IWordRepository wordRepo);
        void LdmlImport(string filePath, string langTag, IProjectRepository projRepo, Project project);
        Task<string> LiftExport(string projectId, IWordRepository wordRepo, IProjectRepository projRepo);

        // Methods to store, retrieve, and delete an export string in a common dictionary.
        void StoreExport(string key, string filePath);
        string? RetrieveExport(string key);
        bool DeleteExport(string key);
        void SetExportInProgress(string key, bool isInProgress);
        bool IsExportInProgress(string key);
    }

    public interface ILiftMerger : ILexiconMerger<LiftObject, LiftEntry, LiftSense, LiftExample>
    {
        Task<List<Word>> SaveImportEntries();
    }
}
