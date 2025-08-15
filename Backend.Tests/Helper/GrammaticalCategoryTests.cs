using System.Collections.Generic;
using BackendFramework.Models;
using NUnit.Framework;
using static BackendFramework.Helper.GrammaticalCategory;

namespace Backend.Tests.Helper
{
    internal sealed class GrammaticalCategoryTests
    {
        private static List<string> _blank = new()
        {
            "",
            " ",
            "\t",
            "\n",
            "!@#$%^&*()",
            "-=+",
            "[]\\{}|",
            ";':\"",
            ",./<>?"
        };
        [TestCaseSource(nameof(_blank))]
        public void TestUnspecified(string gramCat)
        {
            Assert.That(GetGramCatGroup(gramCat), Is.EqualTo(GramCatGroup.Unspecified));
        }
        private static List<string> _meaningless = new()
        {
            "_",
            "a",
            "b",
            "c",
            "d",
            "e",
            "f",
            "g",
            "h",
            "i",
            "j",
            "k",
            "l",
            "m",
            "o1",
            "p2",
            "R",
            "S",
            "T",
            "U",
            "3W",
            "4X",
            "5Y",
            "6Z",
            "7",
            "8",
            "9",
            "0"
        };
        [TestCaseSource(nameof(_meaningless))]
        public void TestOther(string gramCat)
        {
            Assert.That(GetGramCatGroup(gramCat), Is.EqualTo(GramCatGroup.Other));
        }

        private static List<string> _adj = new()
        {
            "Adjectif",
            "Adjective",
            "Adjetivo",
            "adj",
            "прил",
            "прилагательное",
            "形",
            "形容词"
        };
        [TestCaseSource(nameof(_adj))]
        public void TestAdjectives(string gramCat)
        {
            Assert.That(GetGramCatGroup(gramCat), Is.EqualTo(GramCatGroup.Adjective));
        }

        private static List<string> _adp = new()
        {
            "Adposición",
            "Adposition",
            "Adposição",
            "Posposição",
            "Postposición",
            "Postposition",
            "Preposición",
            "Preposition",
            "Preposição",
            "Préposition",
            "adp",
            "adpos",
            "post",
            "prep",
            "prép",
            "Прилог",
            "послелог",
            "предл",
            "предлог",
            "位置",
            "位置词",
            "前置",
            "前置词",
            "后置",
            "后置词"
        };
        [TestCaseSource(nameof(_adp))]
        public void TestAdposition(string gramCat)
        {
            Assert.That(GetGramCatGroup(gramCat), Is.EqualTo(GramCatGroup.Adposition));
        }

        private static List<string> _adv = new()
        {
            "Adverb",
            "Adverbe",
            "Adverbio",
            "Advérbio",
            "adv",
            "нареч",
            "наречие",
            "副",
            "副词"
        };
        [TestCaseSource(nameof(_adv))]
        public void TestAdverb(string gramCat)
        {
            Assert.That(GetGramCatGroup(gramCat), Is.EqualTo(GramCatGroup.Adverb));
        }

        private static List<string> _clf = new()
        {
            "Clasificador",
            "Classificador",
            "Classificador Nominal",
            "Classificateur",
            "Classificateur nominal",
            "Classifier",
            "Noun classifier",
            "class",
            "class.nom",
            "clf",
            "clfnom",
            "nclf",
            "Классификатор",
            "сч. сл",
            "сч.сл",
            "名词类別词",
            "类别",
            "类别词"
        };
        [TestCaseSource(nameof(_clf))]
        public void TestClassifier(string gramCat)
        {
            Assert.That(GetGramCatGroup(gramCat), Is.EqualTo(GramCatGroup.Classifier));
        }

        private static List<string> _conn = new()
        {
            "Adverbialisateur",
            "Adverbializador",
            "Adverbializer",
            "Complementizador",
            "Complementizer",
            "Complémenteur",
            "Conectivo",
            "Conectivo coordenativo",
            "Conectivo subordenativo",
            "Conjunção correlativa",
            "Connecteur",
            "Connecteur coordonnant",
            "Connecteur corrélatif",
            "Connecteur subordonnant",
            "Connective",
            "Coordinating connective",
            "Correlative connective",
            "Relativiseur",
            "Relativizador",
            "Relativizer",
            "Subordinating connective",
            "adverbialisateur",
            "advlizer",
            "advlizr",
            "comp",
            "compltr",
            "con",
            "concorr",
            "conjcom",
            "conjcoor",
            "conn",
            "conn.coord",
            "conn.corrél",
            "conn.subord",
            "consub",
            "coordconn",
            "correlconn",
            "rel",
            "relativis",
            "reltvzr",
            "subordconn",
            "Адвербиализатор",
            "Изъяснительный союз",
            "Относительный союз",
            "Парный союз",
            "Подчинительный союз",
            "Сочинительный союз",
            "Союз",
            "изъясн.союз",
            "отн.союз",
            "парн.союз",
            "подч.союз",
            "соч.союз",
            "союз",
            "从属连词",
            "关系从句连词",
            "关系连词",
            "副词化连词",
            "并列连词",
            "补语连词",
            "连",
            "连词"
        };
        [TestCaseSource(nameof(_conn))]
        public void TestConnective(string gramCat)
        {
            Assert.That(GetGramCatGroup(gramCat), Is.EqualTo(GramCatGroup.Connective));
        }

        private static List<string> _det = new()
        {
            "Article",
            "Article défini",
            "Article indéfini",
            "Artigo",
            "Artigo definido",
            "Artigo indefinido",
            "Artículo",
            "Artículo definido",
            "Artículo indefinido",
            "Cardinal numeral",
            "Definite article",
            "Demonstrative",
            "Demonstrativo",
            "Determinante",
            "Determiner",
            "Distributive numeral",
            "Démonstratif",
            "Déterminant",
            "Indefinite article",
            "Multiplicative numeral",
            "Numeral",
            "Numeral Distributivo",
            "Numeral cardinal",
            "Numeral multiplicativo",
            "Numeral ordinal",
            "Numeral partitivo",
            "Numéral",
            "Numéral cardinal",
            "Numéral distributif",
            "Numéral fractionnaire",
            "Numéral multiplicatif",
            "Numéral ordinal",
            "Ordinal numeral",
            "Partitive numeral",
            "Quantificador",
            "Quantificateur",
            "Quantifier",
            "art",
            "art.déf",
            "art.indéf",
            "artdef",
            "artindf",
            "cardnum",
            "def",
            "dem",
            "det",
            "distrnum",
            "déf",
            "dém",
            "dét",
            "indf",
            "multipnum",
            "num",
            "num.card",
            "num.distr",
            "num.fract",
            "num.mult",
            "num.ord",
            "numcar",
            "numdistr",
            "nummulti",
            "numord",
            "numpar",
            "ordnum",
            "partnum",
            "quant",
            "Артикль",
            "Дробное числительное",
            "Квантификатор",
            "Количественное числительное",
            "Кратное числительное",
            "Неопределённый артикль",
            "Определитель",
            "Определённый артикль",
            "Порядковое числительное",
            "Разделительное числительное",
            "Указательное слово",
            "Числительное",
            "арт",
            "дробн.числ",
            "квантиф",
            "кол.числ",
            "кратн.числ",
            "неопр.арт",
            "опр",
            "опр.арт",
            "пор.числ",
            "разд.числ",
            "указат",
            "числ",
            "不定冠词",
            "倍数词",
            "冠",
            "冠词",
            "分配数词",
            "基数词",
            "定冠词",
            "序数词",
            "指示代",
            "指示代词",
            "数",
            "数词",
            "数量词",
            "部分数词",
            "限定",
            "限定词"
        };
        [TestCaseSource(nameof(_det))]
        public void TestDeterminer(string gramCat)
        {
            Assert.That(GetGramCatGroup(gramCat), Is.EqualTo(GramCatGroup.Determiner));
        }

        private static List<string> _exist = new()
        {
            "Existential marker",
            "Marcador existencial",
            "Marqueur existentiel",
            "existmrkr",
            "marcexist",
            "marq.exist",
            "Экзистеницальный маркер",
            "экз.марк",
            "存在标记"
        };
        [TestCaseSource(nameof(_exist))]
        public void TestExistentialMarker(string gramCat)
        {
            Assert.That(GetGramCatGroup(gramCat), Is.EqualTo(GramCatGroup.ExistentialMarker));
        }

        private static List<string> _expl = new()
        {
            "Expletive",
            "Expletivo",
            "Explétif",
            "expl",
            "Формальное слово",
            "форм.сл",
            "填补词"
        };
        [TestCaseSource(nameof(_expl))]
        public void TestExpletive(string gramCat)
        {
            Assert.That(GetGramCatGroup(gramCat), Is.EqualTo(GramCatGroup.Expletive));
        }

        private static List<string> _interj = new()
        {
            "Interjección",
            "Interjection",
            "Interjeição",
            "interj",
            "Междометие",
            "межд",
            "叹",
            "叹词"
        };
        [TestCaseSource(nameof(_interj))]
        public void TestInterjection(string gramCat)
        {
            Assert.That(GetGramCatGroup(gramCat), Is.EqualTo(GramCatGroup.Interjection));
        }

        private static List<string> _n = new()
        {
            "Gerund",
            "Gerúndio",
            "Gérundif",
            "Nom",
            "Nom propre",
            "Nombre",
            "Nome",
            "Nome Próprio",
            "Nominal",
            "Noun",
            "Proper Noun",
            "Substantif",
            "Substantive",
            "Substantivo",
            "ger",
            "n",
            "n.pr",
            "nom",
            "nprop",
            "subs",
            "subst",
            "sus",
            "Герундий",
            "Имя",
            "Имя собственное",
            "По существу",
            "имя",
            "собств",
            "сущ",
            "существительное",
            "专有名",
            "专有名词",
            "体词",
            "动名词",
            "名",
            "名词"
        };
        [TestCaseSource(nameof(_n))]
        public void TestNoun(string gramCat)
        {
            Assert.That(GetGramCatGroup(gramCat), Is.EqualTo(GramCatGroup.Noun));
        }

        private static List<string> _ptcp = new()
        {
            "Participe",
            "Participio",
            "Participle",
            "Particípio",
            "part",
            "ptcp",
            "Причастие",
            "прич",
            "分词"
        };
        [TestCaseSource(nameof(_ptcp))]
        public void TestParticiple(string gramCat)
        {
            Assert.That(GetGramCatGroup(gramCat), Is.EqualTo(GramCatGroup.Participle));
        }

        private static List<string> _prt = new()
        {
            "Marcador interrogativo",
            "Nominal particle",
            "Particle",
            "Particule",
            "Particule interrogative",
            "Particule nominale",
            "Particule verbale",
            "Partícula",
            "Partícula nominal",
            "Partícula verbal",
            "Question particle",
            "Verbal particle",
            "nomprt",
            "partic",
            "partic.interr",
            "partic.nom",
            "partic.verb",
            "prt",
            "prtnom",
            "prtverb",
            "q",
            "verbprt",
            "Вопросительная частица",
            "Глагольная частица",
            "Номинативная частица",
            "Частица",
            "во",
            "гл.част",
            "ном.част",
            "част",
            "动词性助词",
            "助词",
            "名词性助词",
            "疑问",
            "疑问助词"
        };
        [TestCaseSource(nameof(_prt))]
        public void TestParticle(string gramCat)
        {
            Assert.That(GetGramCatGroup(gramCat), Is.EqualTo(GramCatGroup.Particle));
        }

        private static List<string> _pren = new()
        {
            "Prenome",
            "Prenoun",
            "pren",
            "prenoun",
            "名词前词"
        };
        [TestCaseSource(nameof(_pren))]
        public void TestPrenoun(string gramCat)
        {
            Assert.That(GetGramCatGroup(gramCat), Is.EqualTo(GramCatGroup.Prenoun));
        }

        private static List<string> _prev = new()
        {
            "Preverb",
            "preverb",
            "动词前词"
        };
        [TestCaseSource(nameof(_prev))]
        public void TestPreverb(string gramCat)
        {
            Assert.That(GetGramCatGroup(gramCat), Is.EqualTo(GramCatGroup.Preverb));
        }

        private static List<string> _pro = new()
        {
            "Emphatic pronoun",
            "Indefinite pronoun",
            "Interrogative pro-form",
            "Personal pronoun",
            "Possessive pronoun",
            "Pro-adjective",
            "Pro-adverb",
            "Pro-form",
            "Proforma",
            "Proforma interrogativa",
            "Proforme",
            "Pronom",
            "Pronom emphatique",
            "Pronom indéfini",
            "Pronom interrogatif",
            "Pronom personnel",
            "Pronom possessif",
            "Pronom relatif",
            "Pronom réciproque",
            "Pronom réfléchi",
            "Pronombre",
            "Pronombre indefinido",
            "Pronombre personal",
            "Pronombre relativo",
            "Pronome",
            "Pronome enfático",
            "Pronome indefinido",
            "Pronome pessoal",
            "Pronome possessivo",
            "Pronome recíproco",
            "Pronome reflexivo",
            "Pronome relativo",
            "Pronoun",
            "Pró-adjetivo",
            "Reciprocal pronoun",
            "Reflexive pronoun",
            "Relative pronoun",
            "emph",
            "indfpro",
            "interrog",
            "pers",
            "pos",
            "poss",
            "pro",
            "pro-adj",
            "pro-adv",
            "pro-form",
            "pro.refl",
            "proforma",
            "proforme",
            "prointerrog",
            "pron",
            "pron.emph",
            "pron.indéf",
            "pron.int",
            "pron.pers",
            "pron.poss",
            "pron.rel",
            "pron.réc",
            "pron.réfl",
            "pronenf",
            "pronindf",
            "pronombre posesivo",
            "pronombre reflexivo",
            "pronpes",
            "pronposs",
            "pronrecp",
            "pronrefl",
            "pronrel",
            "recp",
            "refl",
            "relpro",
            "Взаимное местоимение",
            "Возвратное местоимение",
            "Вопросительное местоименное слово",
            "Личное местоимение",
            "Местоименное слово",
            "Неопределённое местоимение",
            "Относительное местоимение",
            "Притяжательное местоимение",
            "Эмфатическое местоимение",
            "взаимн.мест",
            "возвр.мест",
            "вопр",
            "личн.мест",
            "мест",
            "местоимение",
            "местоименное слово",
            "неопр.мест",
            "относ.мест",
            "прит.мест",
            "эмф.мест",
            "不定代词",
            "人称代",
            "人称代词",
            "代",
            "代副词",
            "代形容词",
            "代词",
            "关系代词",
            "反身代词",
            "强调代词",
            "替代词",
            "疑问替代词",
            "疑问词",
            "相互代词",
            "领有",
            "领有代词"
        };
        [TestCaseSource(nameof(_pro))]
        public void TestProForm(string gramCat)
        {
            Assert.That(GetGramCatGroup(gramCat), Is.EqualTo(GramCatGroup.ProForm));
        }

        private static List<string> _v = new()
        {
            "Copulative verb",
            "Ditransitive verb",
            "Intransitive verb",
            "Transitive verb",
            "Verb",
            "Verbe",
            "Verbe bitransitif",
            "Verbe copulatif",
            "Verbe intransitif",
            "Verbe transitif",
            "Verbo",
            "Verbo bitransitivo",
            "Verbo copulativo",
            "Verbo intransitivo",
            "Verbo transitivo",
            "cop",
            "v",
            "v.bi-tr",
            "v.cop",
            "v.i",
            "v.tr",
            "vb",
            "vd",
            "vi",
            "vt",
            "Глагол",
            "Дитранзитивный глагол",
            "Непереходный глагол",
            "Переходный глагол",
            "гл",
            "гл.-связ",
            "глагол-связка",
            "дитр.гл",
            "不及物动",
            "不及物动词",
            "动",
            "动词",
            "及物动",
            "及物动词",
            "双及物动",
            "双及物动词",
            "系动词"
        };
        [TestCaseSource(nameof(_v))]
        public void TestVerb(string gramCat)
        {
            Assert.That(GetGramCatGroup(gramCat), Is.EqualTo(GramCatGroup.Verb));
        }
    }
}
