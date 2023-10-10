import { History } from "@mui/icons-material";
import { Grid, ListItem, Modal, Paper } from "@mui/material";
import { Fragment, ReactElement, useState } from "react";

import { Pedigree } from "api/models";
import { getWordHistory } from "backend";
import { IconButtonWithTooltip } from "components/Buttons";
import WordCard from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/WordCard";

interface HistoryCellProps {
  wordId: string;
}

export default function HistoryCell(props: HistoryCellProps): ReactElement {
  const [history, setHistory] = useState<Pedigree | undefined>();
  const getHistory = async () => {
    await getWordHistory(props.wordId).then(setHistory);
  };
  return (
    <>
      <IconButtonWithTooltip
        buttonId={`word-${props.wordId}-history`}
        icon={<History />}
        onClick={getHistory}
      />
      <Modal onClose={() => setHistory(undefined)} open={!!history}>
        {history ? (
          <Paper>
            <WordTree tree={history} />
          </Paper>
        ) : (
          <Fragment />
        )}
      </Modal>
    </>
  );
}

function WordTree(props: { tree: Pedigree }): ReactElement {
  return (
    <>
      {props.tree.parents ? (
        <Grid container>
          {props.tree.parents.map((p) => (
            <Grid item key={p.word.id}>
              <WordTree tree={p} />
            </Grid>
          ))}
        </Grid>
      ) : null}
      <ListItem>
        <WordCard word={props.tree.word} />
      </ListItem>
    </>
  );
}
