import { WarningOutlined } from "@mui/icons-material";
import { Grid, MenuItem, Paper, Select, Typography } from "@mui/material";
import { ReactElement } from "react";
import { Droppable } from "react-beautiful-dnd";
import { useTranslation } from "react-i18next";

import { Flag } from "api/models";
import FlagButton from "components/Buttons/FlagButton";
import IconButtonWithTooltip from "components/Buttons/IconButtonWithTooltip";
import DragSense from "goals/MergeDupGoal/MergeDupStep/DragDropComponents/DragSense";
import { flagWord, setVern } from "goals/MergeDupGoal/Redux/MergeDupActions";
import { MergeTreeState } from "goals/MergeDupGoal/Redux/MergeDupReduxTypes";
import { useAppDispatch } from "types/hooks";
import theme from "types/theme";
import { newFlag } from "types/word";

interface DropWordProps {
  mergeState: MergeTreeState;
  wordId: string;
}

export default function DropWord(props: DropWordProps): ReactElement {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const treeWord = props.mergeState.tree.words[props.wordId];
  const data = props.mergeState.data;
  const flag = data.words[props.wordId]?.flag ?? newFlag();
  var protectedWithOneChild = false;
  const verns: string[] = [];
  if (treeWord) {
    protectedWithOneChild =
      treeWord.protected && Object.keys(treeWord.sensesGuids).length === 1;
    verns.push(
      ...new Set(
        Object.values(treeWord.sensesGuids).flatMap((guids) =>
          guids.map((g) => data.words[data.senses[g].srcWordId].vernacular)
        )
      )
    );
  }

  // reset vern if not in vern list
  if (treeWord && !verns.includes(treeWord.vern)) {
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
        style={{
          backgroundColor: treeWord?.protected ? "lightyellow" : "white",
          padding: theme.spacing(1),
          height: 44,
          minWidth: 150,
        }}
      >
        {!!treeWord && (
          <Grid container justifyContent="space-between">
            <Grid>
              <Select
                variant="standard"
                value={treeWord.vern}
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
              {protectedWithOneChild && (
                <IconButtonWithTooltip
                  icon={<WarningOutlined />}
                  textId={"mergeDups.helpText.protectedWord"}
                  side={"top"}
                  small
                />
              )}
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
              {!!treeWord &&
                Object.keys(treeWord.sensesGuids).map((id, index) => {
                  const senses = treeWord.sensesGuids[id].map(
                    (g) => data.senses[g]
                  );
                  return (
                    <DragSense
                      key={id}
                      index={index}
                      wordId={props.wordId}
                      mergeSenseId={id}
                      senses={senses}
                      isDragDisabled={
                        protectedWithOneChild || senses[0].protected
                      }
                    />
                  );
                })}
              {provided.placeholder}
            </div>
            <div style={{ padding: 16, textAlign: "center" }}>
              <Typography variant="subtitle1">
                {t("mergeDups.helpText.dragCard")}
              </Typography>
            </div>
          </div>
        )}
      </Droppable>
    </Paper>
  );
}
