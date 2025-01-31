import { GramCatGroup, GrammaticalInfo, Sense, Status, Word } from "api/models";
import {
  areDefinitionsSame,
  areDomainsSame,
  areGlossesSame,
  cleanSense,
  cleanWord,
  isSenseChanged,
} from "goals/ReviewEntries/ReviewEntriesTable/Cells/EditCell/utilities";
import { newSemanticDomain } from "types/semanticDomain";
import {
  newDefinition,
  newFlag,
  newGloss,
  newNote,
  newSense,
  newWord,
} from "types/word";

describe("areDefinitionsSame", () => {
  it("trims whitespace", () => {
    const helloA = newDefinition(" \tHello", "en");
    const helloB = newDefinition("Hello", "en");
    const worldA = newDefinition("World", "qaa");
    const worldB = newDefinition("  World \n", "qaa");
    expect(areDefinitionsSame([helloA, worldA], [helloB, worldB])).toBeTruthy();
  });

  it("ignores order and empty text", () => {
    const hello = newDefinition("Hello", "en");
    const world = newDefinition("World", "qaa");
    const space = newDefinition("   ", "sp");
    const tab = newDefinition("\t\t", "ta");
    const newline = newDefinition("\n\n\n\n", "ne");
    expect(
      areDefinitionsSame([hello, space, world], [tab, newline, world, hello])
    ).toBeTruthy();
  });

  it("is case sensitive", () => {
    const helloA = newDefinition("Hello", "en");
    const helloB = newDefinition("Hello", "En");
    const worldA = newDefinition("World", "qaa");
    const worldB = newDefinition("world", "qaa");
    expect(areDefinitionsSame([helloA, worldA], [helloB, worldA])).toBeFalsy();
    expect(areDefinitionsSame([helloA, worldA], [helloA, worldB])).toBeFalsy();
  });
});

describe("areGlossesSame", () => {
  it("trims whitespace", () => {
    const helloA = newGloss(" \tHello", "en");
    const helloB = newGloss("Hello", "en");
    const worldA = newGloss("World", "qaa");
    const worldB = newGloss("  World \n", "qaa");
    expect(areGlossesSame([helloA, worldA], [helloB, worldB])).toBeTruthy();
  });

  it("ignores order and empty text", () => {
    const hello = newGloss("Hello", "en");
    const world = newGloss("World", "qaa");
    const space = newGloss("   ", "sp");
    const tab = newGloss("\t\t", "ta");
    const newline = newGloss("\n\n\n\n", "ne");
    expect(
      areGlossesSame([hello, space, world], [tab, newline, world, hello])
    ).toBeTruthy();
  });

  it("is case sensitive", () => {
    const helloA = newGloss("Hello", "en");
    const helloB = newGloss("Hello", "En");
    expect(areGlossesSame([helloA], [helloB])).toBeFalsy();

    const worldA = newGloss("World", "qaa");
    const worldB = newGloss("world", "qaa");
    expect(areGlossesSame([worldA], [worldB])).toBeFalsy();
  });
});

describe("areDomainsSame", () => {
  it("ignores order and multiplicity", () => {
    const one = newSemanticDomain("1");
    const oneTwo = newSemanticDomain("1.2");
    const oneTwoThree = newSemanticDomain("1.2.3");
    expect(
      areDomainsSame(
        [one, oneTwo, oneTwo, oneTwoThree, oneTwoThree, oneTwoThree],
        [oneTwoThree, oneTwo, one]
      )
    ).toBeTruthy();
  });

  it("ignores name and lang", () => {
    const en = newSemanticDomain("1", "", "en");
    const es = newSemanticDomain("1", "", "es");
    const one = newSemanticDomain("1", "one");
    const uno = newSemanticDomain("1", "uno");
    expect(areDomainsSame([en], [es])).toBeTruthy();
    expect(areDomainsSame([one], [uno])).toBeTruthy();
  });

  it("matches id strings exactly", () => {
    const oneTwo = newSemanticDomain("12");
    const oneDotTwo = newSemanticDomain("1.2");
    const oneDotTwoSpace = newSemanticDomain("1.2 ");
    expect(areDomainsSame([oneTwo], [oneDotTwo])).toBeFalsy();
    expect(areDomainsSame([oneDotTwo], [oneDotTwoSpace])).toBeFalsy();
  });
});

describe("isSenseChanged", () => {
  it("checks guid", () => {
    const senseA = newSense("gloss");
    const senseB: Sense = { ...senseA, guid: "new-guid" };
    expect(isSenseChanged(senseA, senseB)).toBeTruthy();
  });

  it("checks accessibility", () => {
    const senseA = newSense("gloss");
    const senseB: Sense = { ...senseA, accessibility: Status.Duplicate };
    expect(isSenseChanged(senseA, senseB)).toBeTruthy();
  });

  it("checks grammaticalInfo", () => {
    const gi: GrammaticalInfo = {
      catGroup: GramCatGroup.Adverb,
      grammaticalCategory: "a",
    };
    const senseA: Sense = { ...newSense("gloss"), grammaticalInfo: gi };
    const senseB: Sense = { ...senseA };
    senseB.grammaticalInfo = { ...gi, catGroup: GramCatGroup.Verb };
    expect(isSenseChanged(senseA, senseB)).toBeTruthy();
    senseB.grammaticalInfo = { ...gi, grammaticalCategory: "b" };
    expect(isSenseChanged(senseA, senseB)).toBeTruthy();
  });

  it("checks definitions", () => {
    const hello = newDefinition("Hello");
    const world = newDefinition("World");
    const ds = [hello, world];
    const senseA: Sense = { ...newSense(), definitions: ds };
    const senseB: Sense = { ...senseA, definitions: [hello] };
    expect(isSenseChanged(senseA, senseB)).toBeTruthy();
    senseB.definitions = [world, newDefinition(), hello];
    expect(isSenseChanged(senseA, senseB)).toBeFalsy();
  });

  it("checks glosses", () => {
    const hello = newGloss("Hello");
    const world = newGloss("World");
    const gs = [hello, world];
    const senseA: Sense = { ...newSense(), glosses: gs };
    const senseB: Sense = { ...senseA, glosses: [hello] };
    expect(isSenseChanged(senseA, senseB)).toBeTruthy();
    senseB.glosses = [world, newGloss(), hello];
    expect(isSenseChanged(senseA, senseB)).toBeFalsy();
  });

  it("checks semantic domains", () => {
    const hello = newSemanticDomain("3.5.1.4.3", "Greet");
    const world = newSemanticDomain("1.2", "World");
    const sd = [hello, world];
    const senseA: Sense = { ...newSense(), semanticDomains: sd };
    const senseB: Sense = { ...senseA, semanticDomains: [hello] };
    expect(isSenseChanged(senseA, senseB)).toBeTruthy();
    senseB.semanticDomains = [hello, hello, world, world];
    expect(isSenseChanged(senseA, senseB)).toBeFalsy();
  });
});

describe("cleanSense", () => {
  it("returns undefined for deleted sense", () => {
    const sense = newSense("gloss");
    sense.accessibility = Status.Deleted;
    expect(cleanSense(sense)).toBeUndefined();
  });

  it("removes empty definitions", () => {
    const sense = newSense("gloss");
    const hello = newDefinition("hello");
    const world = newDefinition("world");
    sense.definitions = [hello, newDefinition(), world];
    const cleaned = cleanSense(sense) as Sense;
    expect(cleaned.definitions).toEqual([hello, world]);
  });

  it("removes empty glosses", () => {
    const sense = newSense();
    const hello = newGloss("hello");
    const world = newGloss("world");
    sense.glosses = [hello, newGloss(), world];
    const cleaned = cleanSense(sense) as Sense;
    expect(cleaned.glosses).toEqual([hello, world]);
  });

  it("removes domains with duplicate ids", () => {
    const sense = newSense("gloss");
    const hello = newSemanticDomain("3.5.1.4.3", "Greet");
    const world = newSemanticDomain("1.2", "World");
    sense.semanticDomains = [hello, hello, world, world];
    const doms = (cleanSense(sense) as Sense).semanticDomains;
    expect(doms).toHaveLength(2);
    expect(doms).toContain(hello);
    expect(doms).toContain(world);
  });

  it("returns undefined for empty sense (unless protected and exempted)", () => {
    const sense = newSense();
    sense.guid = "guid-does-not-matter";
    sense.accessibility = Status.Protected;
    expect(cleanSense(sense)).toBeUndefined();
    expect(typeof cleanSense(sense, { exemptProtected: true })).toEqual(
      "object"
    );
  });

  it("returns error string for non-empty sense without gloss (unless protected and exempted)", () => {
    const sense = newSense();
    sense.grammaticalInfo.catGroup = GramCatGroup.Noun;
    sense.accessibility = Status.Protected;
    expect(typeof cleanSense(sense)).toEqual("string");
    expect(typeof cleanSense(sense, { exemptProtected: true })).toEqual(
      "object"
    );
  });

  it("allow sense without gloss but with definition", () => {
    const sense = newSense();
    sense.definitions.push(newDefinition("¡Hola, Mundo!"));
    expect(typeof cleanSense(sense)).toEqual("object");
  });

  it("returns different error if definitionsEnabled", () => {
    const sense = newSense();
    sense.grammaticalInfo.catGroup = GramCatGroup.Noun;
    const disabledResult = cleanSense(sense);
    const enabledResult = cleanSense(sense, { definitionsEnabled: true });
    expect(typeof disabledResult).toEqual("string");
    expect(typeof enabledResult).toEqual("string");
    expect(disabledResult).not.toEqual(enabledResult);
  });
});

describe("cleanWord", () => {
  it("trims vernacular", () => {
    const vern = "Hello, World!";
    const word = newWord(` \n${vern} \t `);
    word.senses.push(newSense("gloss"));
    expect((cleanWord(word) as Word).vernacular).toEqual(vern);
  });

  it("returns error string for empty vernacular", () => {
    const word = newWord(" \n \t ");
    word.senses.push(newSense("gloss"));
    expect(typeof cleanWord(word)).toEqual("string");
  });

  it("returns error string for no senses (unless protected and exempted)", () => {
    const word = newWord("vern");
    const sense = newSense(" \n");
    sense.accessibility = Status.Protected;
    word.senses.push(sense);
    expect(typeof cleanWord(word)).toEqual("string");
    expect(typeof cleanWord(word, { exemptProtected: true })).toEqual("object");
  });

  it("cleans up note", () => {
    const word = newWord("vern");
    word.senses.push(newSense("gloss"));
    const helloWorld = "Hello, World!";
    const lang = "en";

    // Trims whitespace
    word.note = newNote(` ${helloWorld}`, lang);
    let cleaned = cleanWord(word) as Word;
    expect(cleaned.note).toEqual(newNote(helloWorld, lang));

    // Clears lang if note text empty
    word.note.text = "\t ";
    cleaned = cleanWord(word) as Word;
    expect(cleaned.note).toEqual(newNote());
  });

  it("cleans up flag", () => {
    const word = newWord("vern");
    word.senses.push(newSense("gloss"));
    const helloWorld = "Hello, World!";

    // Trims whitespace
    word.flag = newFlag(`${helloWorld}\n`);
    let cleaned = cleanWord(word) as Word;
    expect(cleaned.flag).toEqual(newFlag(helloWorld));

    // Clears text if active is false
    word.flag.active = false;
    cleaned = cleanWord(word) as Word;
    expect(cleaned.flag).toEqual(newFlag());
  });
});
