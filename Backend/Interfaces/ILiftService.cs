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
        void StoreExport(string userId, string filePath);
        string? RetrieveExport(string userId);
        bool DeleteExport(string userId);
        void SetExportInProgress(string userId, bool isInProgress);
        bool IsExportInProgress(string userId);
    }

    public interface ILiftMerger : ILexiconMerger<LiftObject, LiftEntry, LiftSense, LiftExample>
    {
        bool DoesImportHaveDefinitions();
        bool DoesImportHaveGrammaticalInfo();
        Task<List<Word>> SaveImportEntries();
    }
}
