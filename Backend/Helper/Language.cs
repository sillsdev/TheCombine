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

        public static IEnumerable<WritingSystem> ConvertLangTagsToWritingSystems(IEnumerable<string> langTags)
        {
            var langLookup = new LanguageLookup();
            return langTags.Select(
                tag => new WritingSystem { Bcp47 = tag, Name = langLookup.GetLanguageFromCode(tag).DesiredName });
        }

    }
}
