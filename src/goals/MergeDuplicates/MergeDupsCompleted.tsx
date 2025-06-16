import { ArrowRightAlt } from "@mui/icons-material";
import { Box, Card, Grid2, Paper, Stack, Typography } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { Flag, MergeUndoIds, Sense, Word } from "api/models";
import { getFrontierWords, getWord, undoMerge } from "backend";
import { FlagButton, UndoButton } from "components/Buttons";
import SenseCardContent from "goals/MergeDuplicates/MergeDupsStep/SenseCardContent";
import { MergesCompleted } from "goals/MergeDuplicates/MergeDupsTypes";
import { type StoreState } from "rootRedux/types";
import theme from "types/theme";
import { newFlag } from "types/word";
import { TypographyWithFont } from "utilities/fontComponents";

export default function MergeDupsCompleted(): ReactElement {
  const changes = useSelector(
    (state: StoreState) =>
      state.goalsState.currentGoal.changes as MergesCompleted
  );
  const { t } = useTranslation();

  return (
    <>
      <Typography component="h1" variant="h4">
        {t("mergeDups.title")}
      </Typography>
      {MergesCount(changes)}
      {changes.merges?.map((m, i) => (
        <MergeChange change={m} key={m.parentIds[0] ?? i} />
      ))}
    </>
  );
}

export function MergesCount(changes: MergesCompleted): ReactElement {
  const { t } = useTranslation();

  return (
    <Typography>
      {t("mergeDups.completed.number")}
      {changes.merges?.length ?? 0}
    </Typography>
  );
}

export function MergeChange(props: { change: MergeUndoIds }): ReactElement {
  const change = props.change;
  const { t } = useTranslation();
  const handleIsUndoAllowed = (): Promise<boolean> =>
    getFrontierWords().then((words) => doWordsIncludeMerges(words, change));
  const isDeletion = !change.parentIds.length;

  return (
    <Grid2 container style={{ flexWrap: "nowrap", overflow: "auto" }}>
      {isDeletion && <Typography>{t("mergeDups.undo.deleted")}</Typography>}
      {change.childIds.map((id) => (
        <WordBox key={id} wordId={id} />
      ))}
      {!isDeletion && (
        <>
          <Box alignContent="center" style={{ margin: theme.spacing(1) }}>
            <ArrowRightAlt fontSize="large" />
          </Box>
          {change.parentIds.map((id) => (
            <WordBox key={id} wordId={id} />
          ))}
        </>
      )}
      <Box alignContent="center">
        <UndoButton
          buttonIdEnabled={`merge-undo-${change.parentIds.join("-")}`}
          buttonIdCancel="merge-undo-cancel"
          buttonIdConfirm="merge-undo-confirm"
          textIdDialog={
            isDeletion
              ? "mergeDups.undo.undoDeleteDialog"
              : "mergeDups.undo.undoDialog"
          }
          textIdDisabled="mergeDups.undo.undoDisabled"
          textIdEnabled={
            isDeletion ? "mergeDups.undo.undoDelete" : "mergeDups.undo.undo"
          }
          isUndoAllowed={handleIsUndoAllowed}
          undo={async () => {
            await undoMerge(change);
          }}
        />
      </Box>
    </Grid2>
  );
}

export function doWordsIncludeMerges(
  words: Word[],
  merge: MergeUndoIds
): boolean {
  const wordIds = words.map((word) => word.id);
  // The undo operation will fail if any of the children are in the frontier.
  return (
    merge.parentIds.every((id) => wordIds.includes(id)) &&
    merge.childIds.every((id) => !wordIds.includes(id))
  );
}

function WordBox(props: { wordId: string }): ReactElement {
  const [word, setWord] = useState<Word | undefined>();
  const [flag, setFlag] = useState<Flag>(newFlag());

  useEffect(() => {
    getWord(props.wordId).then(setWord);
  }, [props.wordId]);
  useEffect(() => {
    setFlag(word?.flag ?? newFlag());
  }, [word]);

  return (
    <Box style={{ margin: theme.spacing(1) }}>
      <Paper
        style={{
          backgroundColor: "lightgrey",
          paddingBottom: theme.spacing(1),
        }}
      >
        <Paper
          square
          style={{ padding: theme.spacing(1), height: 44, minWidth: 100 }}
        >
          <Stack direction="row" justifyContent="space-between">
            <TypographyWithFont variant="h5" vernacular>
              {word?.vernacular}
            </TypographyWithFont>
            <FlagButton flag={flag} buttonId={`word-${props.wordId}-flag`} />
          </Stack>
        </Paper>
        <div style={{ maxHeight: "55vh", overflowY: "auto" }}>
          {word?.senses?.map(SenseCard)}
        </div>
      </Paper>
    </Box>
  );
}

function SenseCard(sense: Sense): ReactElement {
  return (
    <Card
      key={sense.guid}
      style={{
        margin: theme.spacing(1),
        userSelect: "none",
        minWidth: 150,
        maxWidth: 300,
        background: "white",
      }}
    >
      <SenseCardContent senses={[sense]} />
    </Card>
  );
}
