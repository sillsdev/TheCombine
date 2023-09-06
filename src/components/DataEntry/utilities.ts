import { Status, Word } from "api/models";
import { DomainWord } from "types/word";

/** Filter out words that do not have at least 1 active sense */
export function filterWordsWithSenses(words: Word[]): Word[] {
  return words.filter((w) =>
    w.senses.find((s) =>
      [Status.Active, Status.Protected].includes(s.accessibility)
    )
  );
}

export function filterWordsByDomain(
  words: Word[],
  domainId: string
): DomainWord[] {
  const domainWords: DomainWord[] = [];
  for (const currentWord of words) {
    const senses = currentWord.senses.filter((s) =>
      // The undefined is for Statuses created before .accessibility was required in the frontend.
      [Status.Active, Status.Protected, undefined].includes(s.accessibility)
    );
    for (const sense of senses) {
      if (sense.semanticDomains.map((dom) => dom.id).includes(domainId)) {
        // Only the first gloss is shown, and no definitions.
        domainWords.push(new DomainWord({ ...currentWord, senses: [sense] }));
      }
    }
  }
  return domainWords;
}

export function sortDomainWordsByVern(words: DomainWord[]): DomainWord[] {
  return words.sort(
    (a, b) =>
      a.vernacular.localeCompare(b.vernacular) ||
      a.gloss.def.localeCompare(b.gloss.def)
  );
}
