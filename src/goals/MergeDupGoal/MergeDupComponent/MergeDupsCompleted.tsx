import {
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

import { getWord } from "backend";
import { CompletedMerge, MergesCompleted } from "goals/MergeDupGoal/MergeDups";
import { StoreState } from "types";
import { Sense, Word } from "types/word";
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

function MergesMade(changes: MergesCompleted) {
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

function MergeChange(change: CompletedMerge) {
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
