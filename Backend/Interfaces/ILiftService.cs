using SIL.Lift.Parsing;

namespace BackendFramework.Interfaces
{
    public interface ILiftService : ILexiconMerger<LiftObject, LiftEntry, LiftSense, LiftExample>
    {
        void SetProject(string projectId);
        string LiftExport(string projectId);
        void LdmlImport(string combine, string bcp47);
    }
}