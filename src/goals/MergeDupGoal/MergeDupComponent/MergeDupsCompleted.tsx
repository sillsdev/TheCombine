import { Button, Card, Grid, Paper, Typography } from "@material-ui/core";
import { ArrowRightAlt } from "@material-ui/icons";
import React, { ReactElement, useEffect, useState } from "react";
import { Translate } from "react-localize-redux";
import { useSelector } from "react-redux";

import { MergeUndoIds, Sense, Word } from "api/models";
import { getFrontierWords, getWord, undoMerge } from "backend";
import CancelConfirmDialog from "components/Buttons/CancelConfirmDialog";
import SenseCardContent from "goals/MergeDupGoal/MergeDupStep/SenseCardContent";
import { MergesCompleted } from "goals/MergeDupGoal/MergeDupsTypes";
import { StoreState } from "types";
import theme from "types/theme";

export default function MergeDupsCompleted(): ReactElement {
  const changes = useSelector(
    (state: StoreState) =>
      state.goalsState.currentGoal.changes as MergesCompleted
  );
  return (
    <React.Fragment>
      <Typography component="h1" variant="h4">
        <Translate id="mergeDups.title" />
      </Typography>
      {MergesMade(changes)}
    </React.Fragment>
  );
}

function MergesMade(changes: MergesCompleted): ReactElement {
  return (
    <div>
      {MergesCount(changes)}
      {changes.merges?.map(MergeChange)}
    </div>
  );
}

export function MergesCount(changes: MergesCompleted): ReactElement {
  return (
    <Typography>
      <Translate id="mergeDups.completed.number" />
      {changes.merges?.length ?? 0}
    </Typography>
  );
}

function MergeChange(change: MergeUndoIds): ReactElement {
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
          merge={change}
          textId="mergeDups.undo.undo"
          dialogId="mergeDups.undo.undoDialog"
          disabledId="mergeDups.undo.undoDisabled"
        />
      </Grid>
    </div>
  );
}

interface UndoButtonProps {
  merge: MergeUndoIds;
  textId: string;
  dialogId: string;
  disabledId: string;
}

function UndoButton(props: UndoButtonProps): ReactElement {
  const [isUndoBtnEnabled, setUndoBtnEnabled] = useState<boolean>(false);
  const [undoDialogOpen, setUndoDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    function checkFrontier() {
      getFrontierWords().then((words) =>
        setUndoBtnEnabled(
          props.merge ? doWordsIncludeMerges(words, props.merge) : false
        )
      );
    }
    checkFrontier();
  });

  if (isUndoBtnEnabled) {
    return (
      <Grid container direction="column" justifyContent="center">
        <div>
          <Button
            variant="outlined"
            id={`merge-undo-${props.merge.parentIds.join("-")}`}
            onClick={() => setUndoDialogOpen(true)}
          >
            <Translate id={props.textId} />
          </Button>
          <CancelConfirmDialog
            open={undoDialogOpen}
            textId={props.dialogId}
            handleCancel={() => setUndoDialogOpen(false)}
            handleConfirm={() =>
              undoMerge(props.merge).then(() => setUndoDialogOpen(false))
            }
            buttonIdCancel="merge-undo-cancel"
            buttonIdConfirm="merge-undo-confirm"
          />
        </div>
      </Grid>
    );
  }
  return (
    <Grid container direction="column" justifyContent="center">
      <div>
        <Button disabled>
          <Translate id={props.disabledId} />
        </Button>
      </div>
    </Grid>
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
  useEffect(() => {
    getWord(props.wordId).then(setWord);
  }, [props.wordId, setWord]);

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
          <Typography variant="h5">{word?.vernacular}</Typography>
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
