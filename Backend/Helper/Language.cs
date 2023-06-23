using System.Collections.Generic;
using System.IO;
using System.Linq;
using BackendFramework.Models;
using SIL.WritingSystems;

namespace BackendFramework.Helper
{
    public static class Language
    {
        /// <summary>
        /// Extract list of distinct Language strings from all of a <see cref="Sense"/>'s Definitions and Glosses.
        /// </summary>
        public static IEnumerable<string> GetSenseAnalysisLangTags(Sense sense)
        {
            var tags = sense.Definitions.Select(d => d.Language).ToList();
            tags.AddRange(sense.Glosses.Select(g => g.Language));
            return tags.Distinct();
        }

        /// <summary> Convert language tags into writing systems. </summary>
        public static IEnumerable<WritingSystem> ConvertLangTagsToWritingSystems(IEnumerable<string> langTags)
        {
            // If Sldr isn't initialized, temporarily initialize it here.
            var isSldrInitialized = Sldr.IsInitialized;
            if (!isSldrInitialized)
            {
                Sldr.Initialize();
            }
            var langLookup = new LanguageLookup();
            var writingSystems = langTags.Select(tag =>
                new WritingSystem { Bcp47 = tag, Name = langLookup.GetLanguageFromCode(tag)?.DesiredName ?? "" });
            if (!isSldrInitialized)
            {
                Sldr.Cleanup();
            }
            return writingSystems;
        }

        /// <summary>
        /// Extract <see cref="WritingSystem"/>s from .ldml files in a directory or its WritingSystems subdirectory.
        /// </summary>
        public static IEnumerable<WritingSystem> GetVernacularWritingSystems(string dirPath)
        {
            if (!Directory.GetFiles(dirPath, "*.ldml").Any())
            {
                dirPath = Path.Combine(dirPath, "WritingSystems");
            }

            var wsr = LdmlInFolderWritingSystemRepository.Initialize(dirPath);
            return wsr.AllWritingSystems.Select(wsd => new WritingSystem(wsd));
        }
    }
}
