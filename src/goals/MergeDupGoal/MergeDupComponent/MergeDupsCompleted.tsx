import {
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Typography,
} from "@material-ui/core";
import { ArrowRightAlt } from "@material-ui/icons";
import React, { useEffect, useState } from "react";
import { Translate } from "react-localize-redux";
import { useSelector } from "react-redux";

import { MergeUndoIds, Sense, Word } from "api/models";
import { getFrontierWords, getWord, undoMerges } from "backend";
import CancelConfirmDialog from "components/Buttons/CancelConfirmDialog";
import { MergesCompleted } from "goals/MergeDupGoal/MergeDupsTypes";
import { StoreState } from "types";
import theme from "types/theme";

export default function MergeDupsCompleted() {
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

function MergesMade(changes: MergesCompleted): JSX.Element {
  return (
    <div>
      {MergesCount(changes)}
      {changes.merges?.map(MergeChange)}
      <UndoButton merges={changes.merges} />
    </div>
  );
}

export function MergesCount(changes: MergesCompleted): JSX.Element {
  return (
    <Typography>
      <Translate id="mergeDups.completed.number" />
      {changes.merges?.length ?? 0}
    </Typography>
  );
}

function MergeChange(change: MergeUndoIds): JSX.Element {
  return (
    <div key={change.parentIds[0]}>
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
        <Grid
          key={"arrow"}
          style={{
            margin: theme.spacing(1),
          }}
        >
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
        {change.parentIds.map((id) => (
          <WordPaper key={id} wordId={id} />
        ))}
      </Grid>
    </div>
  );
}

interface UndoButtonProps {
  merges: MergeUndoIds[];
}

function UndoButton(props: UndoButtonProps) {
  const [undoBtn, setUndoBtn] = useState<boolean>(false);
  const [undoDialogOpen, setUndoDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    function checkFrontier() {
      getFrontierWords().then((words) =>
        setUndoBtn(doWordsIncludeMerges(words, props.merges))
      );
    }
    checkFrontier();
  });

  if (undoBtn) {
    return (
      <div>
        <Button onClick={() => setUndoDialogOpen(true)}>
          <Translate id="mergeDups.undo.undoMerges" />
        </Button>
        <CancelConfirmDialog
          open={undoDialogOpen}
          textId={"mergeDups.undo.undoMerges"}
          handleCancel={() => setUndoDialogOpen(false)}
          handleAccept={() =>
            undoMerges(props.merges).then(() => setUndoDialogOpen(false))
          }
        />
      </div>
    );
  }
  return (
    <Button disabled>
      <Translate id="mergeDups.undo.undoDisabled" />
    </Button>
  );
}

function doWordsIncludeMerges(words: Word[], merges: MergeUndoIds[]): boolean {
  const frontierIds = words.map((word) => word.id);
  for (const merge of merges) {
    for (const id of merge.parentIds) {
      if (!frontierIds.includes(id)) {
        return false;
      }
    }
  }
  return true;
}

interface WordPaperProps {
  wordId: string;
}
function WordPaper(props: WordPaperProps) {
  const [word, setWord] = useState<Word | undefined>();
  useEffect(() => {
    async function fetchWord() {
      const fetchedWord = await getWord(props.wordId);
      setWord(fetchedWord);
    }
    fetchWord();
    // eslint-disable-next-line
  }, []);

  return (
    <Grid
      key={props.wordId}
      style={{
        margin: theme.spacing(1),
      }}
    >
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
          {word?.senses.map(SenseCard)}
        </div>
      </Paper>
    </Grid>
  );
}

function SenseCard(sense: Sense) {
  const semDoms = [
    ...new Set(sense.semanticDomains.map((dom) => `${dom.id}: ${dom.name}`)),
  ];
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
      <CardContent style={{ position: "relative", paddingRight: 40 }}>
        {/* List glosses */}
        {sense.glosses.map((g, index) => (
          <div key={index}>
            <Typography variant="caption">{`${g.language}: `}</Typography>
            <Typography display="inline" variant="h5">
              {g.def}
            </Typography>
          </div>
        ))}
        {/* List semantic domains */}
        <Grid container spacing={2}>
          {semDoms.map((dom) => (
            <Grid item key={dom}>
              <Chip label={dom} />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
