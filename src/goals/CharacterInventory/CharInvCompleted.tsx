import { ArrowRightAlt } from "@mui/icons-material";
import { Divider, Grid2, Stack, Typography } from "@mui/material";
import {
  Fragment,
  type ReactElement,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

import { type Word } from "api/models";
import { areInFrontier, getWord, revertWords } from "backend";
import { UndoButton } from "components/Buttons";
import WordCard from "components/WordCard";
import CharacterStatusText from "goals/CharacterInventory/CharInv/CharacterList/CharacterStatusText";
import {
  type CharInvChanges,
  type CharacterChange,
  type FindAndReplaceChange,
  defaultCharInvChanges,
} from "goals/CharacterInventory/CharacterInventoryTypes";
import { useAppSelector } from "rootRedux/hooks";
import { type StoreState } from "rootRedux/types";

export enum CharInvCompletedId {
  TypographyNoCharChanges = "no-char-changes-typography",
  TypographyNoWordChanges = "no-word-changes-typography",
  TypographyWordChanges = "word-changes-typography",
  TypographyWordsUndo = "words-undo-typography",
}

/** Component to display the full details of changes made during one session of the
 * Create Character Inventory goal. This includes:
 * - Changes to inventory status of a character (accepted vs. rejected vs. undecided);
 * - Words changed with the find-and-replace tool. */
export default function CharInvCompleted(): ReactElement {
  const stateChanges = useAppSelector(
    (state: StoreState) => state.goalsState.currentGoal.changes
  );
  const { t } = useTranslation();

  const changes: CharInvChanges = { ...defaultCharInvChanges, ...stateChanges };

  return (
    <Stack spacing={1} sx={{ p: 2 }}>
      {/* Title */}
      <Typography component="h1" variant="h4">
        {t("charInventory.title")}
      </Typography>

      {/* Inventory changes */}
      <div>
        {changes.charChanges.length ? (
          changes.charChanges.map((c) => <CharChange change={c} key={c[0]} />)
        ) : (
          <Typography id={CharInvCompletedId.TypographyNoCharChanges}>
            {t("charInventory.changes.noCharChanges")}
          </Typography>
        )}
      </div>

      {/* Find-and-replace changes */}
      {changes.wordChanges.length ? (
        changes.wordChanges.map((wc, i) => (
          <Fragment key={i}>
            <Divider />
            <WordChanges wordChanges={wc} />
          </Fragment>
        ))
      ) : (
        <Box sx={{ borderTop: "1px solid #ccc", p: 1 }}>
          <Typography id={CharInvCompletedId.TypographyNoWordChanges}>
            {t("charInventory.changes.noWordChangesFindReplace")}
          </Typography>
        </Box>
      )}
    </Stack>
  );
}

/** Typography summarizing find-and-replace word changes for goal history
 * (or null if no words changed). */
function WordChangesTypography(props: {
  wordChanges?: FindAndReplaceChange[];
}): ReactElement | null {
  const { t } = useTranslation();

  const changes = props.wordChanges?.filter(
    (wc) => Object.keys(wc.words).length
  );
  if (!changes?.length) {
    return null;
  }

  const wordCount = changes.flatMap((wc) => Object.keys(wc.words)).length;
  const description =
    changes.length === 1
      ? t("charInventory.changes.wordChangesWithStrings", {
          val1: changes[0].find,
          val2: changes[0].replace,
        })
      : t("charInventory.changes.wordChanges");

  return (
    <Typography id={CharInvCompletedId.TypographyWordChanges}>
      {`${description} ${wordCount}`}
    </Typography>
  );
}

/** Component for the goal history timeline, to display a summary of changes made during
 * one session of the Create Character Inventory goal. This includes:
 * - Changes to inventory status of a character (up to 3);
 * - Number of words changed with the find-and-replace tool (only if more than 0). */
export function CharInvChangesGoalList(changes: CharInvChanges): ReactElement {
  const { charChanges, wordChanges } = changes;
  const { t } = useTranslation();

  const noChanges = !(charChanges?.length || wordChanges?.length);
  return noChanges ? (
    <Typography id={CharInvCompletedId.TypographyNoCharChanges}>
      {t("charInventory.changes.noCharChanges")}
    </Typography>
  ) : (
    <Stack alignItems="flex-start">
      <CharChangesRows changeLimit={changeLimit} charChanges={charChanges} />
      <WordChangesTypography wordChanges={wordChanges} />
    </Stack>
  );
}

/** Components summarizing changes to status of inventory characters
 * (or null if no status changes). */
export function CharChangesRows(props: {
  changeLimit: number;
  charChanges?: CharacterChange[];
}): ReactElement | null {
  const { changeLimit, charChanges } = props;
  const { t } = useTranslation();

  if (!charChanges?.length) {
    return null;
  }

  return charChanges.length > changeLimit ? (
    <>
      {charChanges.slice(0, changeLimit - 1).map((c) => (
        <CharChange change={c} key={c[0]} />
      ))}
      <Typography>
        {`+${charChanges.length - (changeLimit - 1)} `}
        {t("charInventory.changes.more")}
      </Typography>
    </>
  ) : (
    <>
      {charChanges.map((c) => (
        <CharChange change={c} key={c[0]} />
      ))}
    </>
  );
}

/** One-line display of the inventory status change of a character. */
export function CharChange(props: { change: CharacterChange }): ReactElement {
  return (
    <div>
      <Typography display="inline">{`${props.change[0]}: `}</Typography>
      <CharacterStatusText status={props.change[1]} inline />
      <Typography display="inline" variant="body2">
        <ArrowRightAlt fontSize="inherit" />
      </Typography>
      <CharacterStatusText status={props.change[2]} inline />
    </div>
  );
}

/** Component to display words (max 5) changed by a single find-and-replace, with a
 * button to undo (if at least one word is still in the project frontier). */
function WordChanges(props: {
  wordChanges: FindAndReplaceChange;
}): ReactElement {
  const [inFrontier, setInFrontier] = useState<string[]>([]);
  const [entries] = useState(Object.entries(props.wordChanges.words));
  const { t } = useTranslation();
  const wordLimit = 5;

  const undoWordsTypography = inFrontier.length ? (
    <Typography id={CharInvCompletedId.TypographyWordsUndo}>
      {t("charInventory.undo.undoWords", {
        val1: inFrontier.length,
        val2: entries.length,
      })}
    </Typography>
  ) : null;

  /** Fetches which of the new words are still in the project frontier;
   * returns true if there are any. */
  const isUndoAllowed = useCallback(async (): Promise<boolean> => {
    const ids = await areInFrontier(Object.values(props.wordChanges.words));
    setInFrontier(ids);
    return ids.length > 0;
  }, [props.wordChanges.words]);

  /** Reverts all changes for which the new word is still in the project frontier. */
  const undo = async (): Promise<void> => {
    await revertWords(props.wordChanges.words);
  };

  return (
    <div>
      <Typography id={CharInvCompletedId.TypographyWordChanges}>
        {t("charInventory.changes.wordChangesWithStrings", {
          val1: props.wordChanges.find,
          val2: props.wordChanges.replace,
        })}
      </Typography>
      <Grid2 container spacing={2}>
        {entries.slice(0, wordLimit).map(([oldId, newId]) => (
          <WordChange key={newId} oldId={oldId} newId={newId} />
        ))}
        {entries.length > wordLimit ? (
          <Typography>
            {`+${entries.length - wordLimit} ${t(
              "charInventory.changes.more"
            )}`}
          </Typography>
        ) : null}
      </Grid2>
      {undoWordsTypography}
      <UndoButton
        isUndoAllowed={isUndoAllowed}
        textIdDialog="charInventory.undo.undoDialog"
        textIdDisabled="charInventory.undo.undoDisabled"
        textIdEnabled="charInventory.undo.undo"
        undo={undo}
      />
    </div>
  );
}

/** Component to show a word update that only involved a change in vernacular form. */
function WordChange(props: { newId: string; oldId: string }): ReactElement {
  const [oldVern, setOldVern] = useState("");
  const [newWord, setNewWord] = useState<Word | undefined>();

  useEffect(() => {
    getWord(props.oldId).then((w) => setOldVern(w.vernacular));
    getWord(props.newId).then(setNewWord);
  }, [props]);

  const vernacular = `${oldVern}  →  ${newWord?.vernacular}`;

  return (
    <div>{newWord ? <WordCard word={{ ...newWord, vernacular }} /> : null}</div>
  );
}
