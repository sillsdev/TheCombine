import { MenuItem, Paper, Select, Typography } from "@material-ui/core";
import { Droppable } from "react-beautiful-dnd";
import { Translate } from "react-localize-redux";
import { useDispatch } from "react-redux";

import DragSense from "goals/MergeDupGoal/MergeDupStep/DragDropComponents/DragSense";
import { setVern } from "goals/MergeDupGoal/Redux/MergeDupActions";
import { MergeTreeState } from "goals/MergeDupGoal/Redux/MergeDupReduxTypes";
import theme from "types/theme";

interface DropWordProps {
  mergeState: MergeTreeState;
  wordId: string;
  portrait: boolean;
}

export default function DropWord(props: DropWordProps) {
  const dispatch = useDispatch();
  const treeWords = props.mergeState.tree.words;
  const data = props.mergeState.data;
  const filled = !!treeWords[props.wordId];
  let verns: string[] = [];
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
    <Droppable
      key={props.wordId}
      droppableId={props.wordId}
      isCombineEnabled={true}
    >
      {(provided) => (
        <Paper
          ref={provided.innerRef}
          style={{
            backgroundColor: "lightgrey",
            paddingBottom: theme.spacing(1),
          }}
          {...provided.droppableProps}
        >
          <Paper
            square
            style={{ padding: theme.spacing(1), height: 44, minWidth: 150 }}
          >
            {filled && (
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
            )}
          </Paper>
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
        </Paper>
      )}
    </Droppable>
  );
}
