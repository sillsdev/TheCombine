import { Grid, MenuItem, Paper, Select, Typography } from "@material-ui/core";
import { ReactElement } from "react";
import { Droppable } from "react-beautiful-dnd";
import { Translate } from "react-localize-redux";
import { useDispatch } from "react-redux";

import { Flag } from "api/models";
import FlagButton from "components/Buttons/FlagButton";
import DragSense from "goals/MergeDupGoal/MergeDupStep/DragDropComponents/DragSense";
import { flagWord, setVern } from "goals/MergeDupGoal/Redux/MergeDupActions";
import { MergeTreeState } from "goals/MergeDupGoal/Redux/MergeDupReduxTypes";
import theme from "types/theme";
import { newFlag } from "types/word";

interface DropWordProps {
  mergeState: MergeTreeState;
  wordId: string;
}

export default function DropWord(props: DropWordProps): ReactElement {
  const dispatch = useDispatch();
  const treeWords = props.mergeState.tree.words;
  const data = props.mergeState.data;
  const filled = !!treeWords[props.wordId];
  const flag = data.words[props.wordId]?.flag ?? newFlag();
  const verns: string[] = [];
  if (filled) {
    verns.push(
      ...new Set(
        Object.values(treeWords[props.wordId].sensesGuids).flatMap((guids) =>
          guids.map((g) => data.words[data.senses[g].srcWordId].vernacular)
        )
      )
    );
  }

  // reset vern if not in vern list
  if (
    treeWords[props.wordId] &&
    !verns.includes(treeWords[props.wordId].vern)
  ) {
    dispatch(setVern(props.wordId, verns[0] || ""));
  }

  return (
    <Paper
      style={{
        backgroundColor: "lightgrey",
        paddingBottom: theme.spacing(1),
      }}
    >
      <Paper
        square
        style={{ padding: theme.spacing(1), height: 44, minWidth: 150 }}
      >
        {filled && (
          <Grid container justifyContent="space-between">
            <Grid>
              <Select
                value={treeWords[props.wordId].vern}
                onChange={(e) =>
                  dispatch(setVern(props.wordId, e.target.value as string))
                }
              >
                {verns.map((vern) => (
                  <MenuItem value={vern} key={props.wordId + vern}>
                    <Typography variant="h5">{vern}</Typography>
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid>
              <FlagButton
                flag={flag}
                updateFlag={(newFlag: Flag) => {
                  dispatch(flagWord(props.wordId, newFlag));
                }}
                buttonId={`word-${props.wordId}-flag`}
              />
            </Grid>
          </Grid>
        )}
      </Paper>
      <Droppable key={props.wordId} droppableId={props.wordId} isCombineEnabled>
        {(provided): ReactElement => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            <div style={{ maxHeight: "55vh", overflowY: "auto" }}>
              {filled &&
                Object.keys(treeWords[props.wordId].sensesGuids).map(
                  (id, index) => {
                    const senses = treeWords[props.wordId].sensesGuids[id].map(
                      (g) => data.senses[g]
                    );
                    return (
                      <DragSense
                        key={id}
                        index={index}
                        wordId={props.wordId}
                        mergeSenseId={id}
                        senses={senses}
                      />
                    );
                  }
                )}
              {provided.placeholder}
            </div>
            <div style={{ padding: 16, textAlign: "center" }}>
              <Typography variant="subtitle1">
                <Translate id="mergeDups.helpText.dragCard" />
              </Typography>
            </div>
          </div>
        )}
      </Droppable>
    </Paper>
  );
}
