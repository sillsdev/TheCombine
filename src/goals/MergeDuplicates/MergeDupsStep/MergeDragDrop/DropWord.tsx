import { WarningOutlined } from "@mui/icons-material";
import { Grid, MenuItem, Paper, Select, Typography } from "@mui/material";
import { ReactElement } from "react";
import { Droppable } from "react-beautiful-dnd";
import { useTranslation } from "react-i18next";

import { Flag } from "api/models";
import { FlagButton, IconButtonWithTooltip } from "components/Buttons";
import DragSense from "goals/MergeDuplicates/MergeDupsStep/MergeDragDrop/DragSense";
import {
  flagWord,
  setVern,
} from "goals/MergeDuplicates/Redux/MergeDupsActions";
import { MergeTreeState } from "goals/MergeDuplicates/Redux/MergeDupsReduxTypes";
import { useAppDispatch } from "types/hooks";
import theme from "types/theme";
import { TypographyWithFont } from "utilities/fontComponents";

interface DropWordProps {
  mergeState: MergeTreeState;
  wordId: string;
}

export default function DropWord(props: DropWordProps): ReactElement {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const treeWord = props.mergeState.tree.words[props.wordId];
  const data = props.mergeState.data;
  let protectedWithOneChild = false;
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
    dispatch(setVern({ wordId: props.wordId, vern: verns[0] || "" }));
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
                  dispatch(
                    setVern({
                      wordId: props.wordId,
                      vern: e.target.value as string,
                    })
                  )
                }
              >
                {verns.map((vern) => (
                  <MenuItem value={vern} key={props.wordId + vern}>
                    <TypographyWithFont variant="h5" vernacular>
                      {vern}
                    </TypographyWithFont>
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
                  buttonId={`word-${props.wordId}-protected`}
                />
              )}
              <FlagButton
                flag={treeWord.flag}
                updateFlag={(newFlag: Flag) => {
                  dispatch(flagWord({ wordId: props.wordId, flag: newFlag }));
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
                      isOnlySenseInProtectedWord={protectedWithOneChild}
                      isProtectedSense={senses[0].protected}
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
