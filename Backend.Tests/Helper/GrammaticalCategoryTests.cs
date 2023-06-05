using System.Collections.Generic;
using BackendFramework.Models;
using NUnit.Framework;
using static BackendFramework.Helper.GrammaticalCategory;

namespace Backend.Tests.Helper
{
    public class GrammaticalCategoryTests
    {
        private static List<string> _blank = new()
        {
            "", " ", "\t", "\n", "!@#$%^&*()", "-=+", "[]\\{}|", ";':\"", ",./<>?"
        };
        [TestCaseSource(nameof(_blank))]
        public void TestUnspecified(string gramCat)
        {
            Assert.That(GetGramCatGroup(gramCat), Is.EqualTo(GramCatGroup.Unspecified));
        }
        private static List<string> _meaningless = new()
        {
            "_",
            "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
            "o1", "p2",
            "R", "S", "T", "U",
            "3W", "4X", "5Y", "6Z",
            "7", "8", "9", "0"
        };
        [TestCaseSource(nameof(_meaningless))]
        public void TestOther(string gramCat)
        {
            Assert.That(GetGramCatGroup(gramCat), Is.EqualTo(GramCatGroup.Other));
        }

        private static List<string> _adj = new()
        {
            "adj", "Adjective", "Adjetivo", "Adjectif",
            "прил", "прилагательное",
            "形", "形容词"
        };
        [TestCaseSource(nameof(_adj))]
        public void TestAdjectives(string gramCat)
        {
            Assert.That(GetGramCatGroup(gramCat), Is.EqualTo(GramCatGroup.Adjective));
        }

        private static List<string> _adp = new()
        {
            "post", "Postposition", "Postposición",
            "prep", "Preposition", "Preposición", "Preposição",
            "adp", "Adposition", "Adposição",
            "adpos", "Adposición", "Adposition",
            "prép", "Préposition",
            "posp", "Posposição",
            "послелог", "послелог",
            "предл", "предлог",
            "Прилог", "Прилог",
            "后置", "后置词",
            "前置", "前置词",
            "位置", "位置词"
        };
        [TestCaseSource(nameof(_adp))]
        public void TestAdposition(string gramCat)
        {
            Assert.That(GetGramCatGroup(gramCat), Is.EqualTo(GramCatGroup.Adposition));
        }

        private static List<string> _adv = new()
        {
            "adv", "Adverb", "Adverbio", "Adverbe", "Advérbio",
            "нареч", "наречие",
            "副", "副词"
        };
        [TestCaseSource(nameof(_adv))]
        public void TestAdverb(string gramCat)
        {
            Assert.That(GetGramCatGroup(gramCat), Is.EqualTo(GramCatGroup.Adverb));
        }

        private static List<string> _clf = new()
        {
            "nclf", "Noun classifier",
            "clf", "Classifier", "Clasificador", "Classificador",
            "class.nom", "Classificateur nominal",
            "class", "Classificateur",
            "clfnom", "Classificador Nominal",
            "сч. сл", "Классификатор",
            "сч.сл", "Классификатор",
            "名词类別词", "名词类別词",
            "类别", "类别词"
        };
        [TestCaseSource(nameof(_clf))]
        public void TestClassifier(string gramCat)
        {
            Assert.That(GetGramCatGroup(gramCat), Is.EqualTo(GramCatGroup.Classifier));
        }

        private static List<string> _conn = new()
        {
            "correlconn", "Correlative connective",
            "coordconn", "Coordinating connective",
            "advlizer", "Adverbializer", "Адвербиализатор",
            "comp", "Complementizer",
            "rel", "Relativizer",
            "subordconn", "Subordinating connective",
            "conn", "Connective", "Connecteur",
            "conn.corrél", "Connecteur corrélatif",
            "conn.coord", "Connecteur coordonnant",
            "adverbialisateur", "Adverbialisateur",
            "compltr", "Complémenteur",
            "relativis", "Relativiseur",
            "conn.subord", "Connecteur subordonnant",
            "concorr", "Conjunção correlativa",
            "conjcoor", "Conectivo coordenativo",
            "advlizr", "Adverbializador",
            "conjcom", "Complementizador",
            "reltvzr", "Relativizador",
            "consub", "Conectivo subordenativo",
            "con", "Conectivo",
            "парн.союз", "Парный союз",
            "соч.союз", "Сочинительный союз",
            "изъясн.союз", "Изъяснительный союз",
            "отн.союз", "Относительный союз",
            "подч.союз", "Подчинительный союз",
            "союз", "Союз",
            "关系连词", "关系连词",
            "并列连词", "并列连词",
            "副词化连词", "副词化连词",
            "补语连词", "补语连词",
            "关系从句连词", "关系从句连词",
            "从属连词", "从属连词",
            "连", "连词"
        };
        [TestCaseSource(nameof(_conn))]
        public void TestConnective(string gramCat)
        {
            Assert.That(GetGramCatGroup(gramCat), Is.EqualTo(GramCatGroup.Connective));
        }

        private static List<string> _det = new()
        {
            "def", "Definite article",
            "déf", "Artículo definido",
            "indf", "Indefinite article", "Artículo indefinido",
            "art", "Article", "Artículo", "Artigo",
            "dem", "Demonstrative", "Demonstrativo",
            "cardnum", "Cardinal numeral",
            "distrnum", "Distributive numeral",
            "multipnum", "Multiplicative numeral",
            "ordnum", "Ordinal numeral",
            "partnum", "Partitive numeral",
            "num", "Numeral", "Numéral",
            "quant", "Quantifier", "Quantificateur", "Quantificador",
            "det", "Determiner", "Determinante",
            "art.déf", "Article défini",
            "art.indéf", "Article indéfini",
            "dém", "Démonstratif",
            "num.card", "Numéral cardinal",
            "num.distr", "Numéral distributif",
            "num.mult", "Numéral multiplicatif",
            "num.ord", "Numéral ordinal",
            "num.fract", "Numéral fractionnaire",
            "dét", "Déterminant",
            "artdef", "Artigo definido",
            "artindf", "Artigo indefinido",
            "numcar", "Numeral cardinal",
            "numdistr", "Numeral Distributivo",
            "nummulti", "Numeral multiplicativo",
            "numord", "Numeral ordinal",
            "numpar", "Numeral partitivo",
            "опр.арт", "Определённый артикль",
            "неопр.арт", "Неопределённый артикль",
            "арт", "Артикль",
            "указат", "Указательное слово",
            "кол.числ", "Количественное числительное",
            "разд.числ", "Разделительное числительное",
            "кратн.числ", "Кратное числительное",
            "пор.числ", "Порядковое числительное",
            "дробн.числ", "Дробное числительное",
            "числ", "Числительное",
            "квантиф", "Квантификатор",
            "опр", "Определитель",
            "定冠词", "定冠词",
            "不定冠词", "不定冠词",
            "冠", "冠词",
            "指示代", "指示代词",
            "基数词", "基数词",
            "分配数词", "分配数词",
            "倍数词", "倍数词",
            "序数词", "序数词",
            "部分数词", "部分数词",
            "数", "数词",
            "数量词", "数量词",
            "限定", "限定词"
        };
        [TestCaseSource(nameof(_det))]
        public void TestDeterminer(string gramCat)
        {
            Assert.That(GetGramCatGroup(gramCat), Is.EqualTo(GramCatGroup.Determiner));
        }

        private static List<string> _exist = new()
        {
            "existmrkr", "Existential marker",
            "marq.exist", "Marqueur existentiel",
            "marcexist", "Marcador existencial",
            "экз.марк", "Экзистеницальный маркер",
            "存在标记", "存在标记"
        };
        [TestCaseSource(nameof(_exist))]
        public void TestExistentialMarker(string gramCat)
        {
            Assert.That(GetGramCatGroup(gramCat), Is.EqualTo(GramCatGroup.ExistentialMarker));
        }

        private static List<string> _expl = new()
        {
            "expl", "Expletive", "Explétif", "Expletivo",
            "форм.сл", "Формальное слово",
            "填补词", "填补词"
        };
        [TestCaseSource(nameof(_expl))]
        public void TestExpletive(string gramCat)
        {
            Assert.That(GetGramCatGroup(gramCat), Is.EqualTo(GramCatGroup.Expletive));
        }

        private static List<string> _interj = new()
        {
            "interj", "Interjection", "Interjección", "Interjeição",
            "межд", "Междометие",
            "叹", "叹词"
        };
        [TestCaseSource(nameof(_interj))]
        public void TestInterjection(string gramCat)
        {
            Assert.That(GetGramCatGroup(gramCat), Is.EqualTo(GramCatGroup.Interjection));
        }

        private static List<string> _n = new()
        {
            "ger", "Gerund", "Gérundif", "Gerúndio", "Герундий",
            "nom", "Nominal",
            "nprop", "Proper Noun", "Nome Próprio",
            "subs", "Substantive", "Substantivo", "По существу",
            "n", "Noun", "Nom", "Nome",
            "sus", "Nombre",
            "n.pr", "Nom propre",
            "subst", "Substantif",
            "имя", "Имя",
            "собств", "Имя собственное",
            "сущ", "существительное",
            "动名词", "动名词",
            "名词", "名词",
            "专有名", "专有名词",
            "体词", "体词",
            "名", "名词"
        };
        [TestCaseSource(nameof(_n))]
        public void TestNoun(string gramCat)
        {
            Assert.That(GetGramCatGroup(gramCat), Is.EqualTo(GramCatGroup.Noun));
        }

        private static List<string> _ptcp = new()
        {
            "ptcp", "Participle", "Participio",
            "part", "Participe", "Particípio",
            "прич", "Причастие",
            "分词", "分词"
        };
        [TestCaseSource(nameof(_ptcp))]
        public void TestParticiple(string gramCat)
        {
            Assert.That(GetGramCatGroup(gramCat), Is.EqualTo(GramCatGroup.Participle));
        }

        private static List<string> _prt = new()
        {
            "nomprt", "Nominal particle",
            "q", "Question particle", "Marcador interrogativo",
            "verbprt", "Verbal particle",
            "prt", "Particle", "Partícula",
            "partic.nom", "Particule nominale",
            "partic.interr", "Particule interrogative",
            "partic.verb", "Particule verbale",
            "partic", "Particule",
            "prtnom", "Partícula nominal",
            "prtverb", "Partícula verbal",
            "ном.част", "Номинативная частица",
            "во", "Вопросительная частица",
            "гл.част", "Глагольная частица",
            "част", "Частица",
            "名词性助词", "名词性助词",
            "疑问", "疑问助词",
            "动词性助词", "动词性助词",
            "助词", "助词"
        };
        [TestCaseSource(nameof(_prt))]
        public void TestParticle(string gramCat)
        {
            Assert.That(GetGramCatGroup(gramCat), Is.EqualTo(GramCatGroup.Particle));
        }

        private static List<string> _pren = new()
        {
            "prenoun", "Prenoun",
            "pren", "Prenome",
            "名词前词", "名词前词"
        };
        [TestCaseSource(nameof(_pren))]
        public void TestPrenoun(string gramCat)
        {
            Assert.That(GetGramCatGroup(gramCat), Is.EqualTo(GramCatGroup.Prenoun));
        }

        private static List<string> _prev = new()
        {
            "preverb", "Preverb",
            "动词前词", "动词前词"
        };
        [TestCaseSource(nameof(_prev))]
        public void TestPreverb(string gramCat)
        {
            Assert.That(GetGramCatGroup(gramCat), Is.EqualTo(GramCatGroup.Preverb));
        }

        private static List<string> _pro = new()
        {
            "interrog", "Interrogative pro-form",
            "pro-adj", "Pro-adjective", "Pró-adjetivo",
            "pro-adv", "Pro-adverb",
            "indfpro", "Indefinite pronoun", "Pronombre indefinido",
            "emph", "Emphatic pronoun",
            "poss", "Possessive pronoun",
            "pos", "pronombre posesivo",
            "refl", "Reflexive pronoun",
            "pro.refl", "pronombre reflexivo",
            "pers", "Personal pronoun", "Pronombre personal",
            "recp", "Reciprocal pronoun",
            "relpro", "Relative pronoun", "Pronombre relativo",
            "pro", "Pronoun", "Pronombre",
            "pro-form", "Pro-form",
            "pron.int", "Pronom interrogatif",
            "pron.indéf", "Pronom indéfini",
            "pron.emph", "Pronom emphatique",
            "pron.poss", "Pronom possessif",
            "pron.réfl", "Pronom réfléchi",
            "pron.pers", "Pronom personnel",
            "pron.réc", "Pronom réciproque",
            "pron.rel", "Pronom relatif",
            "pron", "Pronom", "Pronome",
            "proforme", "Proforme",
            "prointerrog", "Proforma interrogativa",
            "pronindf", "Pronome indefinido",
            "pronenf", "Pronome enfático",
            "pronposs", "Pronome possessivo",
            "pronrefl", "Pronome reflexivo",
            "pronpes", "Pronome pessoal",
            "pronrecp", "Pronome recíproco",
            "pronrel", "Pronome relativo",
            "proforma", "Proforma",
            "вопр", "Вопросительное местоименное слово",
            "неопр.мест", "Неопределённое местоимение",
            "эмф.мест", "Эмфатическое местоимение",
            "прит.мест", "Притяжательное местоимение",
            "возвр.мест", "Возвратное местоимение",
            "личн.мест", "Личное местоимение",
            "взаимн.мест", "Взаимное местоимение",
            "относ.мест", "Относительное местоимение",
            "мест", "местоимение",
            "местоименное слово", "Местоименное слово",
            "疑问词", "疑问替代词",
            "代形容词", "代形容词",
            "代副词", "代副词",
            "不定代词", "不定代词",
            "强调代词", "强调代词",
            "领有", "领有代词",
            "反身代词", "反身代词",
            "人称代", "人称代词",
            "相互代词", "相互代词",
            "关系代词", "关系代词",
            "代", "代词",
            "替代词", "替代词"
        };
        [TestCaseSource(nameof(_pro))]
        public void TestProForm(string gramCat)
        {
            Assert.That(GetGramCatGroup(gramCat), Is.EqualTo(GramCatGroup.ProForm));
        }

        private static List<string> _v = new()
        {
            "cop", "Copulative verb", "Verbo copulativo",
            "vd", "Ditransitive verb",
            "vb", "Verbo bitransitivo",
            "vi", "Intransitive verb", "Verbo intransitivo", "Непереходный глагол",
            "vt", "Transitive verb", "Verbo transitivo", "Переходный глагол",
            "v", "Verb", "Verbo", "Verbe",
            "v.cop", "Verbe copulatif",
            "v.bi-tr", "Verbe bitransitif",
            "v.i", "Verbe intransitif",
            "v.tr", "Verbe transitif",
            "гл.-связ", "глагол-связка",
            "дитр.гл", "Дитранзитивный глагол",
            "гл", "Глагол",
            "系动词", "系动词",
            "双及物动", "双及物动词",
            "不及物动", "不及物动词",
            "及物动", "及物动词",
            "动", "动词"
        };
        [TestCaseSource(nameof(_v))]
        public void TestVerb(string gramCat)
        {
            Assert.That(GetGramCatGroup(gramCat), Is.EqualTo(GramCatGroup.Verb));
        }
    }
}
