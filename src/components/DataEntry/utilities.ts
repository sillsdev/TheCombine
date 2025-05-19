import { RefObject } from "react";

import { Sense, Status, Word } from "api/models";
import { DomainWord } from "types/word";

/** Checks whether a sense is active
 * (and in the specified domain if domainId is provided). */
function isActiveInDomain(sense: Sense, domainId?: string): boolean {
  return (
    (!domainId || sense.semanticDomains.some((d) => d.id === domainId)) &&
    // The undefined is for Statuses created before .accessibility was required.
    [Status.Active, Status.Protected, undefined].includes(sense.accessibility)
  );
}

/** Filter out words that do not have at least 1 active sense
 * (and in the specified domain if domainId is provided). */
export function filterWordsWithSenses(
  words: Word[],
  domainId?: string
): Word[] {
  return words.filter((w) =>
    w.senses.some((s) => isActiveInDomain(s, domainId))
  );
}

/** Filter out sense's glosses with empty def
 * (and if lang is specified, put glosses in that lang first). */
function filterGlosses(sense: Sense, lang?: string): Sense {
  const glosses = sense.glosses.filter((g) => g.def.trim());
  if (lang) {
    glosses.sort((a, b) => +(b.language === lang) - +(a.language === lang));
  }
  return { ...sense, glosses };
}

export function filterWordsByDomain(
  words: Word[],
  domainId: string,
  lang?: string
): DomainWord[] {
  const domainWords: DomainWord[] = [];
  const wordsInDomain = filterWordsWithSenses(words, domainId);
  wordsInDomain.sort((a, b) => a.vernacular.localeCompare(b.vernacular));
  for (const w of wordsInDomain) {
    domainWords.push(
      ...w.senses
        .filter((s) => isActiveInDomain(s, domainId))
        .map((s) => new DomainWord({ ...w, senses: [filterGlosses(s, lang)] }))
    );
  }
  return domainWords;
}

/** Focus on a specified object. */
export function focusInput(ref: RefObject<HTMLDivElement>): void {
  if (ref.current) {
    ref.current.focus();
    ref.current.scrollIntoView({ behavior: "smooth" });
  }
}
