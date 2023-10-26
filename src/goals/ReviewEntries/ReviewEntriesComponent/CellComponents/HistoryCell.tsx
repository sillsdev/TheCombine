import { Close, History, Merge, Straight } from "@mui/icons-material";
import { Badge, Dialog, Grid, IconButton } from "@mui/material";
import { Fragment, ReactElement, useState } from "react";

import { Pedigree } from "api/models";
import { getWordHistory } from "backend";
import { IconButtonWithTooltip } from "components/Buttons";
import WordCard from "components/WordCard";

export const buttonId = (wordId: string): string => `row-${wordId}-history`;
export const buttonIdExit = "history-exit";

interface HistoryCellProps {
  historyCount: number;
  wordId: string;
}

export default function HistoryCell(props: HistoryCellProps): ReactElement {
  const [pedigree, setPedigree] = useState<Pedigree | undefined>();

  const getHistory = async (): Promise<void> => {
    await getWordHistory(props.wordId).then(setPedigree);
  };

  return (
    <>
      <IconButton
        disabled={!props.historyCount}
        id={buttonId(props.wordId)}
        onClick={getHistory}
      >
        <Badge badgeContent={props.historyCount}>
          <History />
        </Badge>
      </IconButton>
      <Dialog
        fullScreen
        onClose={() => setPedigree(undefined)}
        open={!!pedigree}
      >
        <Grid container justifyContent="flex-end">
          <IconButtonWithTooltip
            buttonId={buttonIdExit}
            icon={<Close />}
            onClick={() => setPedigree(undefined)}
            textId={"buttons.exit"}
          />
        </Grid>
        {pedigree ? (
          <Grid container justifyContent="space-around">
            <Grid item>
              <WordTree pedigree={pedigree} />
            </Grid>
          </Grid>
        ) : (
          <Fragment />
        )}
      </Dialog>
    </>
  );
}

function WordTree(props: { pedigree: Pedigree }): ReactElement {
  const { parents, word } = props.pedigree;

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

          {showParents && (
            <>
              {/* Bracket */}
              {parents.length > 1 && (
                <div
                  style={{
                    border: "2px solid black",
                    borderBottom: "0px",
                    height: "16px",
                    width: "100%",
                  }}
                />
              )}

              {/* Parent word(s) */}
              <Grid
                alignItems="flex-start"
                columnSpacing="8px"
                container
                justifyContent="space-around"
                wrap="nowrap"
              >
                {parents.map((p) => (
                  <Grid item key={p.word.id}>
                    <WordTree pedigree={p} />
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </>
      )}
    </>
  );
}
