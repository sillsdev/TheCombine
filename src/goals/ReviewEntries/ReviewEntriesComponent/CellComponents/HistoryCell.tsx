import { History } from "@mui/icons-material";
import { Dialog, Grid } from "@mui/material";
import { Fragment, ReactElement, useState } from "react";

import { Pedigree } from "api/models";
import { getWordHistory } from "backend";
import { IconButtonWithTooltip } from "components/Buttons";
import WordCard from "components/WordCard";

interface HistoryCellProps {
  wordId: string;
}

export default function HistoryCell(props: HistoryCellProps): ReactElement {
  const [history, setHistory] = useState<Pedigree | undefined>();
  const getHistory = async (): Promise<void> => {
    await getWordHistory(props.wordId).then(setHistory);
  };
  return (
    <>
      <IconButtonWithTooltip
        buttonId={`word-${props.wordId}-history`}
        icon={<History />}
        onClick={getHistory}
      />
      <Dialog fullScreen onClose={() => setHistory(undefined)} open={!!history}>
        {history ? <WordTree tree={history} /> : <Fragment />}
      </Dialog>
    </>
  );
}

function WordTree(props: { tree: Pedigree }): ReactElement {
  return (
    <>
      <Grid container justifyContent="space-around">
        <WordCard provenance word={props.tree.word} />
      </Grid>
      {props.tree.parents ? (
        <Grid alignItems="flex-start" container justifyContent="space-around">
          {props.tree.parents.map((p) => (
            <Grid item key={p.word.id}>
              <WordTree tree={p} />
            </Grid>
          ))}
        </Grid>
      ) : null}
    </>
  );
}
