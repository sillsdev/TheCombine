using System.Collections.Generic;
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
            var langLookup = new LanguageLookup();
            return langTags.Select(
                tag => new WritingSystem { Bcp47 = tag, Name = langLookup.GetLanguageFromCode(tag).DesiredName });
        }

        /// <summary> Extract <see cref="WritingSystem"/>s from ldml files in a directory. </summary>
        public static IEnumerable<WritingSystem> GetVernacularWritingSystems(string dirPath)
        {
            var wsr = LdmlInFolderWritingSystemRepository.Initialize(dirPath);
            return wsr.AllWritingSystems.Select(ws => new WritingSystem
            {
                Bcp47 = ws.LanguageTag,
                Name = ws.Language.Name,
                Font = ws.DefaultFont.Name
            });
        }
    }
}
