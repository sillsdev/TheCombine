import { WarningOutlined } from "@mui/icons-material";
import {
  Card,
  CardContent,
  CardHeader,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
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
import { StoreState } from "types";
import { useAppDispatch, useAppSelector } from "types/hooks";
import theme from "types/theme";
import { TypographyWithFont } from "utilities/fontComponents";

interface DropWordProps {
  wordId: string;
}

export default function DropWord(props: DropWordProps): ReactElement {
  const dataSenses = useAppSelector(
    (state: StoreState) => state.mergeDuplicateGoal.data.senses
  );
  const protectedWithOneChild = useAppSelector((state: StoreState) => {
    const treeWord = state.mergeDuplicateGoal.tree.words[props.wordId];
    return (
      treeWord?.protected && Object.keys(treeWord.sensesGuids).length === 1
    );
  });
  const sensesGuids = useAppSelector((state: StoreState) => {
    const treeWord = state.mergeDuplicateGoal.tree.words[props.wordId];
    return treeWord?.sensesGuids;
  });
  const { t } = useTranslation();

  return (
    <Card
      style={{
        backgroundColor: "lightgrey",
        paddingBottom: theme.spacing(1),
      }}
    >
      <DropWordCardHeader
        protectedWithOneChild={protectedWithOneChild}
        wordId={props.wordId}
      />
      <CardContent>
        <Droppable
          key={props.wordId}
          droppableId={props.wordId}
          isCombineEnabled
        >
          {(provided): ReactElement => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              <div style={{ maxHeight: "55vh", overflowY: "auto" }}>
                {!!sensesGuids &&
                  Object.keys(sensesGuids).map((id, index) => {
                    const senses = sensesGuids[id].map((g) => dataSenses[g]);
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
      </CardContent>
    </Card>
  );
}

interface DropWordCardHeaderProps {
  protectedWithOneChild: boolean;
  wordId: string;
}

export function DropWordCardHeader(
  props: DropWordCardHeaderProps
): ReactElement {
  const dispatch = useAppDispatch();
  const data = useAppSelector(
    (state: StoreState) => state.mergeDuplicateGoal.data
  );
  const treeWord = useAppSelector(
    (state: StoreState) => state.mergeDuplicateGoal.tree.words[props.wordId]
  );

  const verns: string[] = [];
  if (treeWord) {
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

  const headerTitle = treeWord ? (
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
  ) : (
    <div />
  );

  const headerAction = treeWord ? (
    <>
      {props.protectedWithOneChild && (
        <IconButtonWithTooltip
          icon={<WarningOutlined />}
          side="top"
          size="small"
          textId="mergeDups.helpText.protectedWord"
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
    </>
  ) : (
    <div />
  );

  return (
    <CardHeader
      title={headerTitle}
      action={headerAction}
      style={{
        backgroundColor: treeWord?.protected ? "lightyellow" : "white",
        padding: theme.spacing(1),
        height: 44,
        minWidth: 150,
      }}
    />
  );
}
