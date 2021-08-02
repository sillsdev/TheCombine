import { Card, Grid, Paper, Typography } from "@material-ui/core";
import { ArrowRightAlt } from "@material-ui/icons";
import React, { useEffect, useState } from "react";
import { Translate } from "react-localize-redux";
import { useSelector } from "react-redux";

import { Sense, Word } from "api/models";
import { getWord } from "backend";
import SenseCardContent from "goals/MergeDupGoal/MergeDupStep/SenseCardContent";
import {
  CompletedMerge,
  MergesCompleted,
} from "goals/MergeDupGoal/MergeDupsTypes";
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
      <Typography>
        <Translate id="mergeDups.completed.number" />
        {changes.merges?.length ?? 0}
      </Typography>
      {changes.merges?.map(MergeChange)}
    </div>
  );
}

function MergeChange(change: CompletedMerge): JSX.Element {
  return (
    <div key={change.parentIds[0]}>
      <Grid
        container
        style={{
          flexWrap: "nowrap",
          overflow: "auto",
        }}
      >
        {change.childrenIds.map((id) => (
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

interface WordPaperProps {
  wordId: string;
}

function WordPaper(props: WordPaperProps) {
  const [word, setWord] = useState<Word | undefined>();
  const showDefinitions = useSelector(
    (state: StoreState) => state.currentProjectState.project.definitionsEnabled
  );
  useEffect(() => {
    getWord(props.wordId).then(setWord);
  }, [props.wordId, setWord]);

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
          {word?.senses.map((s) => SenseCard(s, showDefinitions))}
        </div>
      </Paper>
    </Grid>
  );
}

function SenseCard(sense: Sense, showDefinitions: boolean): JSX.Element {
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
      <SenseCardContent senses={[sense]} includeDefinitions={showDefinitions} />
    </Card>
  );
}
