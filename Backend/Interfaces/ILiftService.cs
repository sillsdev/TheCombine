using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Models;
using SIL.Lift.Parsing;

namespace BackendFramework.Interfaces
{
    public interface ILiftService
    {
        ILiftMerger GetLiftImporterExporter(string projectId, string vernLang, IWordRepository wordRepo);
        Task<bool> LdmlImport(string dirPath, IProjectRepository projRepo, Project project);
        Task<string> LiftExport(string projectId, IWordRepository wordRepo, IProjectRepository projRepo);
        Task CreateLiftRanges(List<SemanticDomainFull> projDoms, string rangesDest);

        // Methods to store, retrieve, and delete an export string in a common dictionary.
        bool StoreExport(string userId, string filePath);
        string? RetrieveExport(string userId);
        bool DeleteExport(string userId);
        void SetExportInProgress(string userId, bool isInProgress);
        bool IsExportInProgress(string userId);
        void StoreImport(string userId, string filePath);
        string? RetrieveImport(string userId);
        bool DeleteImport(string userId);
    }

    public interface ILiftMerger : ILexiconMerger<LiftObject, LiftEntry, LiftSense, LiftExample>
    {
        bool DoesImportHaveDefinitions();
        bool DoesImportHaveGrammaticalInfo();
        List<SemanticDomainFull> GetCustomSemanticDomains();
        List<WritingSystem> GetImportAnalysisWritingSystems();
        Task<List<Word>> SaveImportEntries();
    }
}
