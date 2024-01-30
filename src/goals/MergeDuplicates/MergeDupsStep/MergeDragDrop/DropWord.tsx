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
import { MergeTreeWord } from "goals/MergeDuplicates/MergeDupsTreeTypes";
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
  // `treeWord` is undefined in the extra empty column.
  const treeWord = useAppSelector(
    (state: StoreState) => state.mergeDuplicateGoal.tree.words[props.wordId]
  );
  const { t } = useTranslation();

  const sensesGuids = treeWord?.sensesGuids ?? {};
  const protectedWithOneChild =
    treeWord?.protected && Object.keys(sensesGuids).length === 1;

  return (
    <Card
      style={{
        backgroundColor: "lightgrey",
        paddingBottom: theme.spacing(1),
      }}
    >
      <DropWordCardHeader
        protectedWithOneChild={protectedWithOneChild}
        treeWord={treeWord}
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
                {Object.keys(sensesGuids).map((id, index) => {
                  const senses = sensesGuids[id].map((g) => dataSenses[g]);
                  return (
                    <DragSense
                      key={id}
                      index={index}
                      wordId={props.wordId}
                      mergeSenseId={id}
                      mergeSenses={senses}
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
  treeWord?: MergeTreeWord;
  wordId: string;
}

export function DropWordCardHeader(
  props: DropWordCardHeaderProps
): ReactElement {
  const dispatch = useAppDispatch();
  const { senses, words } = useAppSelector(
    (state: StoreState) => state.mergeDuplicateGoal.data
  );

  const dispatchFlagWord = (flag: Flag): void => {
    dispatch(flagWord({ wordId: props.wordId, flag }));
  };
  const dispatchSetVern = (vern: string): void => {
    dispatch(setVern({ wordId: props.wordId, vern }));
  };

  const treeWord = props.treeWord;
  const guids = Object.values(treeWord?.sensesGuids ?? {}).flatMap((sg) => sg);
  const verns = [
    ...new Set(guids.map((g) => words[senses[g].srcWordId].vernacular)),
  ];

  // Reset vern if not in vern list.
  if (treeWord && !verns.includes(treeWord.vern)) {
    dispatchSetVern(verns.length ? verns[0] : "");
  }

  const headerTitle = treeWord ? (
    verns.length > 1 && verns.includes(treeWord.vern) ? (
      <Select
        onChange={(e) => dispatchSetVern(e.target.value as string)}
        value={treeWord.vern}
        variant="standard"
      >
        {verns.map((vern) => (
          <MenuItem key={props.wordId + vern} value={vern}>
            <TypographyWithFont variant="h5" vernacular>
              {vern}
            </TypographyWithFont>
          </MenuItem>
        ))}
      </Select>
    ) : (
      <TypographyWithFont variant="h5" vernacular>
        {treeWord.vern}
      </TypographyWithFont>
    )
  ) : (
    <div />
  );

  const headerAction = treeWord ? (
    <>
      {props.protectedWithOneChild && (
        <IconButtonWithTooltip
          buttonId={`word-${props.wordId}-protected`}
          icon={<WarningOutlined />}
          side="top"
          size="small"
          textId="mergeDups.helpText.protectedWord"
        />
      )}
      <FlagButton
        buttonId={`word-${props.wordId}-flag`}
        flag={treeWord.flag}
        updateFlag={dispatchFlagWord}
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
        height: 44,
        minWidth: 150,
        padding: theme.spacing(1),
      }}
    />
  );
}
