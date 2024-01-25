import {
  Add,
  ArrowDownward,
  ArrowUpward,
  Delete,
  Edit,
  RestoreFromTrash,
} from "@mui/icons-material";
import { CardContent, Divider, Grid, Icon } from "@mui/material";
import { grey, yellow } from "@mui/material/colors";
import { type ReactElement, useEffect, useState } from "react";
//import { useTranslation } from "react-i18next";

import {
  type Sense,
  Definition,
  Gloss,
  SemanticDomain,
  Status,
} from "api/models";
import { IconButtonWithTooltip } from "components/Buttons";
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

export function isSenseChanged(oldSense: Sense, newSense: Sense): boolean {
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
  moveSense: (from: number, to: number) => void;
  newSenses: Sense[];
  oldSenses: Sense[];
  showSenses: boolean;
  toggleSenseDeleted: (index: number) => void;
  updateOrAddSense: (sense: Sense) => void;
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
          ? isSenseChanged(sense, props.oldSenses[index])
          : true
      )
    );
  }, [props.newSenses, props.oldSenses]);

  //const { t } = useTranslation();

  return (
    <CardContent>
      {props.showSenses ? (
        <>
          {props.newSenses.map((s, i) => (
            <>
              <EditSense
                bumpSenseDown={
                  i < props.newSenses.length - 1
                    ? () => props.moveSense(i, i + 1)
                    : undefined
                }
                bumpSenseUp={i ? () => props.moveSense(i, i - 1) : undefined}
                edited={changes[i]}
                key={s.guid}
                sense={s}
                toggleSenseDeleted={() => props.toggleSenseDeleted(i)}
                updateSense={props.updateOrAddSense}
              />
              <Divider sx={{ mb: 1 }} />
            </>
          ))}
          <IconButtonWithTooltip
            buttonId={"sense-add"}
            icon={<Add />}
            onClick={() => {}}
            size="small"
          />
        </>
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

interface EditSenseProps {
  edited?: boolean;
  sense: Sense;
  bumpSenseDown?: () => void;
  bumpSenseUp?: () => void;
  toggleSenseDeleted: () => void;
  updateSense: (sense: Sense) => void;
}

function EditSense(props: EditSenseProps): ReactElement {
  const sense = props.sense;
  const deleted = sense.accessibility === Status.Deleted;
  //const [editing, setEditing] = useState(false);

  return (
    <Grid container>
      <Grid item>
        <Grid container direction="column">
          <Grid item>
            <IconButtonWithTooltip
              buttonId={`sense-${sense.guid}-bump-up`}
              icon={props.bumpSenseUp ? <ArrowUpward /> : <Icon />}
              onClick={props.bumpSenseUp}
              size="small"
            />
          </Grid>
          <Grid item>
            <IconButtonWithTooltip
              buttonId={`sense-${sense.guid}-bump-down`}
              icon={props.bumpSenseDown ? <ArrowDownward /> : <Icon />}
              onClick={props.bumpSenseDown}
              size="small"
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item>
        <Grid container direction="column">
          {deleted ? (
            <Grid item>
              <IconButtonWithTooltip
                buttonId={`sense-${sense.guid}-restore`}
                icon={<RestoreFromTrash />}
                onClick={props.toggleSenseDeleted}
                size="small"
              />
            </Grid>
          ) : (
            <>
              <Grid item>
                <IconButtonWithTooltip
                  buttonId={`sense-${sense.guid}-delete`}
                  icon={<Delete />}
                  onClick={
                    sense.accessibility === Status.Protected
                      ? undefined
                      : props.toggleSenseDeleted
                  }
                  size="small"
                  textId={
                    sense.accessibility === Status.Protected
                      ? "reviewEntries.deleteDisabled"
                      : undefined
                  }
                />
              </Grid>
              <Grid item>
                <IconButtonWithTooltip
                  buttonId={`sense-${sense.guid}-edit`}
                  icon={<Edit />}
                  onClick={undefined}
                  size="small"
                />
              </Grid>
            </>
          )}
        </Grid>
      </Grid>
      <Grid item sx={{ maxWidth: `calc(100% - 80px)` }}>
        <SenseCard
          bgColor={deleted ? grey[500] : props.edited ? yellow[100] : undefined}
          sense={sense}
        />
      </Grid>
    </Grid>
  );
}
