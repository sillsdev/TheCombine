import { CardContent } from "@mui/material";
import { type ReactElement, useEffect, useState } from "react";
//import { useTranslation } from "react-i18next";

import {
  type Sense,
  Definition,
  Gloss,
  SemanticDomain,
  Status,
} from "api/models";
import SenseCard from "components/WordCard/SenseCard";
import SummarySenseCard from "components/WordCard/SummarySenseCard";
//import { type StoreState } from "types";
//import { useAppSelector } from "types/hooks";

/** Trim whitespace off all definition texts, then remove those with empty text.  */
export function trimDefinitions(definitions: Definition[]): Definition[] {
  return definitions
    .map((d) => ({ ...d, text: d.text.trim() }))
    .filter((d) => d.text.length);
}

/** Trim whitespace off all gloss defs, then remove those with empty def.  */
export function trimGlosses(glosses: Gloss[]): Gloss[] {
  return glosses
    .map((g) => ({ ...g, def: g.def.trim() }))
    .filter((g) => g.def.length);
}

/** Check if two definition arrays have the same content. */
function areDefinitionsSame(a: Definition[], b: Definition[]): boolean {
  return (
    a.length === b.length &&
    a.every((ad) =>
      b.find((bd) => ad.language === bd.language && ad.text === bd.text)
    )
  );
}

/** Check if two gloss arrays have the same content. */
function areGlossesSame(a: Gloss[], b: Gloss[]): boolean {
  return (
    a.length === b.length &&
    a.every((ag) =>
      b.find((bg) => ag.language === bg.language && ag.def === bg.def)
    )
  );
}

/** Check if two semantic domain arrays have the same content. */
function areDomainsSame(a: SemanticDomain[], b: SemanticDomain[]): boolean {
  return (
    a.every((ad) => b.find((bd) => ad.id === bd.id)) &&
    b.every((bd) => a.find((ad) => ad.id === bd.id))
  );
}

function isSenseChanged(oldSense: Sense, newSense: Sense): boolean {
  return (
    oldSense.accessibility !== newSense.accessibility ||
    oldSense.grammaticalInfo.catGroup !== newSense.grammaticalInfo.catGroup ||
    oldSense.grammaticalInfo.grammaticalCategory !==
      newSense.grammaticalInfo.grammaticalCategory ||
    !areDefinitionsSame(
      trimDefinitions(oldSense.definitions),
      trimDefinitions(newSense.definitions)
    ) ||
    !areGlossesSame(
      trimGlosses(oldSense.glosses),
      trimGlosses(newSense.glosses)
    ) ||
    !areDomainsSame(oldSense.semanticDomains, newSense.semanticDomains)
  );
}

interface EditSensesCardContentProps {
  newSenses: Sense[];
  oldSenses: Sense[];
  showSenses: boolean;
  toggleSenseDeleted: (index: number) => void;
  addOrUpdateSense: (sense: Sense) => void;
}

export default function EditSensesCardContent(
  props: EditSensesCardContentProps
): ReactElement {
  /* const analysisWritingSystems = useAppSelector(
    (state: StoreState) =>
      state.currentProjectState.project.analysisWritingSystems
  );*/

  const [changes, setChanges] = useState<boolean[]>([]);

  useEffect(() => {
    setChanges(
      props.newSenses.map((sense, index) =>
        index < props.oldSenses.length
          ? true
          : isSenseChanged(sense, props.oldSenses[index])
      )
    );
  }, [props.newSenses, props.oldSenses]);

  //const { t } = useTranslation();

  return (
    <CardContent>
      {props.showSenses ? (
        props.newSenses.map((s, i) =>
          s.accessibility === Status.Deleted ? (
            <div key={s.guid} />
          ) : (
            <SenseCard highlight={changes[i]} key={s.guid} sense={s} />
          )
        )
      ) : (
        <SummarySenseCard
          senses={props.newSenses.filter(
            (s) => s.accessibility !== Status.Deleted
          )}
        />
      )}
    </CardContent>
  );
}
