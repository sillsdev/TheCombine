import { ArrowRightAlt } from "@mui/icons-material";
import { Card, Grid, Paper, Typography } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { Flag, MergeUndoIds, Sense, Word } from "api/models";
import { getFrontierWords, getWord, undoMerge } from "backend";
import { FlagButton, UndoButton } from "components/Buttons";
import SenseCardContent from "goals/MergeDuplicates/MergeDupsStep/SenseCardContent";
import { MergesCompleted } from "goals/MergeDuplicates/MergeDupsTypes";
import { StoreState } from "types";
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
      {changes.merges?.map(MergeChange)}
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

function MergeChange(change: MergeUndoIds): ReactElement {
  const handleIsUndoAllowed = (): Promise<boolean> =>
    getFrontierWords().then((words) => doWordsIncludeMerges(words, change));

  return (
    <div key={change.parentIds[0] ?? "deleteOnly"}>
      <Grid
        container
        style={{
          flexWrap: "nowrap",
          overflow: "auto",
        }}
      >
        {change.childIds.map((id) => (
          <WordPaper key={id} wordId={id} />
        ))}
        <Grid key={"arrow"} style={{ margin: theme.spacing(1) }}>
          <ArrowRightAlt
            fontSize="large"
            style={{
              position: "relative",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        </Grid>
        {change.parentIds.length ? (
          change.parentIds.map((id) => <WordPaper key={id} wordId={id} />)
        ) : (
          <WordPaper key={"deleteOnly"} wordId={""} />
        )}
        <UndoButton
          buttonIdEnabled={`merge-undo-${change.parentIds.join("-")}`}
          buttonIdCancel="merge-undo-cancel"
          buttonIdConfirm="merge-undo-confirm"
          textIdDialog="mergeDups.undo.undoDialog"
          textIdDisabled="mergeDups.undo.undoDisabled"
          textIdEnabled="mergeDups.undo.undo"
          isUndoAllowed={handleIsUndoAllowed}
          undo={async () => {
            await undoMerge(change);
          }}
        />
      </Grid>
    </div>
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
    !merge.childIds.some((id) => wordIds.includes(id))
  );
}

interface WordPaperProps {
  wordId: string;
}

function WordPaper(props: WordPaperProps): ReactElement {
  const [word, setWord] = useState<Word | undefined>();
  const [flag, setFlag] = useState<Flag>(newFlag());
  useEffect(() => {
    getWord(props.wordId).then(setWord);
  }, [props.wordId, setWord]);
  useEffect(() => {
    setFlag(word?.flag ?? newFlag());
  }, [word, setFlag]);

  return (
    <Grid key={props.wordId} style={{ margin: theme.spacing(1) }}>
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
          <Grid container justifyContent="space-between">
            <Grid>
              <TypographyWithFont variant="h5" vernacular>
                {word?.vernacular}
              </TypographyWithFont>
            </Grid>
            <Grid>
              <FlagButton flag={flag} buttonId={`word-${props.wordId}-flag`} />
            </Grid>
          </Grid>
        </Paper>
        <div style={{ maxHeight: "55vh", overflowY: "auto" }}>
          {word?.senses?.map(SenseCard)}
        </div>
      </Paper>
    </Grid>
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
