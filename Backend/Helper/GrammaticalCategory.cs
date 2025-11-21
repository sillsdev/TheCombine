using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using BackendFramework.Models;

namespace BackendFramework.Helper
{
    /// <summary>
    /// Classifying the grammatical category of a sense.
    ///
    /// Although FieldWorks provides a list of options, custom strings are allowed.
    /// </summary>
    public static class GrammaticalCategory
    {
        private class GroupPattern
        {
            public List<string> Has { get; set; }
            public List<string>? Is { get; set; }
            public GramCatGroup CatGroup { get; set; }

            public GroupPattern()
            {
                CatGroup = GramCatGroup.Unspecified;
                Has = new List<string>();
            }

            public bool Matches(string gramCat)
            {
                if (Is is not null)
                {
                    var initPart = Regex.Match(gramCat, @"[^\W]+").Value;
                    foreach (string isString in Is)
                    {
                        if (initPart.Equals(isString, StringComparison.OrdinalIgnoreCase))
                        {
                            return true;
                        }
                    }
                }
                foreach (string hasString in Has)
                {
                    if (gramCat.Contains(hasString, StringComparison.OrdinalIgnoreCase))
                    {
                        return true;
                    }
                }
                return false;
            }
        }

        // The following patterns cover all grammatical categories in FieldWorks for:
        //   English (en), Spanish (es), French (fr), Portuguese (pt), Russian (ru), Chinese (zh)
        // Omissions due to conflicting abbreviations:
        //   Spanish "indf" for Indefinite Pronoun (conflicts with abbrev. for Indefinite article)
        //   Spanish "rel" for Relative Pronoun (conflicts with abbrev. for Relativizer)
        //   Portuguese "pos" for Postposition (conflicts with Spanish "pos" for Possessive pronoun)
        //   Russian "вопр" for Question Particle (conflict with Russian "вопр" for Interrogative pro-form)
        // Additions based on user-data:
        //   Determiner: "ordinal" (for Ordinal numbers with out "num")
        //   Interjection: "intj"
        //   Noun: "compound" (for Compound nouns to be caught before the "com" of Connective)
        // The order of this list is important;
        //   e.g., you have to check for adverbs before verbs.
        private static List<GroupPattern> patterns = new List<GroupPattern> {
            new GroupPattern{
                CatGroup = GramCatGroup.Classifier,
                Has = new List<string> { "clas", "clf", "клас", "类" },
                Is = new List<string> { "сч" }
            },
            new GroupPattern{
                CatGroup = GramCatGroup.ExistentialMarker,
                Has = new List<string> { "exist", "экз", "存在" }
            },
            new GroupPattern{
                CatGroup = GramCatGroup.Expletive,
                Has = new List<string> { "expl", "форм", "填补" }
            },
            new GroupPattern{
                CatGroup = GramCatGroup.Interjection,
                Has = new List<string> { "interj", "intj", "межд", "叹" }
            },
            new GroupPattern{
                CatGroup = GramCatGroup.Noun,
                Has = new List<string> { "compound", "prop" },
            },
            new GroupPattern{
                CatGroup = GramCatGroup.Participle,
                Has = new List<string> { "partici", "ptcp", "прич" },
                Is = new List<string> { "part", "分", "分词" }
            },
            new GroupPattern{
                CatGroup = GramCatGroup.Prenoun,
                Has = new List<string> { "pren", "名词前" }
            },
            new GroupPattern{
                CatGroup = GramCatGroup.Preverb,
                Has = new List<string> { "prev", "动词前" }
            },
            new GroupPattern{
                CatGroup = GramCatGroup.Particle,
                Has = new List<string> { "marc", "mark", "particl", "particu", "prt", "част", "助" },
                Is = new List<string> { "partic", "q", "во", "疑问" }
            },
            new GroupPattern{
                CatGroup = GramCatGroup.Determiner,
                Has = new List<string> { "指示" }
            },
            new GroupPattern{
                CatGroup = GramCatGroup.ProForm,
                Has = new List<string> {
                    "emph", "interr", "pers", "poss", "prn", "pro", "recp", "refl",
                    "вопр", "мест", "代", "领", "疑问"
                },
                Is = new List<string> { "pos" }
            },
            new GroupPattern{
                CatGroup = GramCatGroup.Determiner,
                Has = new List<string> {
                    "art", "def", "dem", "det", "ind", "num", "ordinal", "quant",
                    "арт", "указ", "числ", "квант", "опр", "定", "冠", "数"
                }
            },
            new GroupPattern{
                CatGroup = GramCatGroup.Adposition,
                Has = new List<string> { "adp", "pos", "prep", "лог", "предл", "置" }
            },
            new GroupPattern{
                CatGroup = GramCatGroup.Adjective,
                Has = new List<string> { "adj", "прил", "形" }
            },
            new GroupPattern{
                CatGroup = GramCatGroup.Connective,
                Has = new List<string> { "com", "con", "isateur", "iz", "rel", "изатор", "союз", "连" }
            },
            new GroupPattern{
                CatGroup = GramCatGroup.Noun,
                Has = new List<string> {
                    "ger", "nom", "noun", "subs", "sus",
                    "гер", "сущ", "имя", "собс", "名", "体"
                },
                Is = new List<string> { "n" }
            },
            new GroupPattern{
                CatGroup = GramCatGroup.Adverb,
                Has = new List<string> { "adv", "нареч", "副" }
            },
            new GroupPattern{
                CatGroup = GramCatGroup.Verb,
                Has = new List<string> { "cop", "trans", "v", "гл", "动" }
            }
        };

        public static GramCatGroup GetGramCatGroup(string grammaticalCategory)
        {
            var gramCat = removeAccents(grammaticalCategory);
            if (string.IsNullOrWhiteSpace(Regex.Match(gramCat, @"[^\W]+").Value))
            {
                return GramCatGroup.Unspecified;
            }
            foreach (GroupPattern pattern in patterns)
            {
                if (pattern.Matches(gramCat))
                {
                    return pattern.CatGroup;
                }
            }
            return GramCatGroup.Other;
        }

        /// <summary> Remove accents (and other non-spacing characters) from a string. </summary>
        public static string removeAccents(string withAccents)
        {
            // Method modified from https://stackoverflow.com/a/249126
            var normalized = withAccents.Normalize(NormalizationForm.FormD);
            var stringBuilder = new StringBuilder(capacity: normalized.Length);
            foreach (var c in normalized)
                if (char.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                {
                    stringBuilder.Append(c);
                }
            return stringBuilder.ToString().Normalize(NormalizationForm.FormC);
        }
    }
}
