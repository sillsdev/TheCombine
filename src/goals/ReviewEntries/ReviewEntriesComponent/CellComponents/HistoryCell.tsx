import { Close, History, Merge, Straight } from "@mui/icons-material";
import { Dialog, Grid } from "@mui/material";
import { Fragment, ReactElement, useState } from "react";

import { Pedigree } from "api/models";
import { getWordHistory } from "backend";
import { IconButtonWithTooltip } from "components/Buttons";
import WordCard from "components/WordCard";

export const buttonId = (wordId: string): string => `row-${wordId}-history`;
export const buttonIdExit = "history-exit";

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
        buttonId={buttonId(props.wordId)}
        icon={<History />}
        onClick={getHistory}
      />
      <Dialog fullScreen onClose={() => setHistory(undefined)} open={!!history}>
        <Grid container justifyContent="flex-end">
          <IconButtonWithTooltip
            buttonId={buttonIdExit}
            icon={<Close />}
            onClick={() => setHistory(undefined)}
            textId={"buttons.exit"}
          />
        </Grid>
        {history ? <WordTree tree={history} /> : <Fragment />}
      </Dialog>
    </>
  );
}

function WordTree(props: { tree: Pedigree }): ReactElement {
  const { parents, word } = props.tree;

  const [showParents, setShowParents] = useState(true);

  const arrowStyle = { color: showParents ? "black" : "gray" };

  return (
    <>
      {/* Word */}
      <Grid container justifyContent="space-around">
        <WordCard provenance word={word} />
      </Grid>

      {parents.length > 0 && (
        <>
          {/* Arrow */}
          <Grid container justifyContent="space-around">
            <IconButtonWithTooltip
              buttonId={`word-${word.id}`}
              icon={
                parents.length > 1 ? (
                  <Merge fontSize="large" style={arrowStyle} />
                ) : (
                  <Straight fontSize="large" style={arrowStyle} />
                )
              }
              onClick={() => setShowParents(!showParents)}
              text={parents.length}
            />
          </Grid>

          {/* Parent word(s) */}
          {showParents && (
            <Grid
              alignItems="flex-start"
              container
              justifyContent="space-around"
              wrap="nowrap"
            >
              {parents.map((p) => (
                <Grid item key={p.word.id}>
                  <WordTree tree={p} />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
    </>
  );
}
