import { ArrowRightAlt } from "@mui/icons-material";
import { Grid, Typography } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { getFrontierWords, getWord, updateWord } from "backend";
import { UndoButton } from "components/Buttons";
import {
  EntriesEdited,
  EntryEdit,
} from "goals/ReviewEntries/ReviewEntriesTypes";
import { StoreState } from "types";
import theme from "types/theme";

export default function ReviewEntriesCompleted(): ReactElement {
  const changes = useSelector(
    (state: StoreState) => state.goalsState.currentGoal.changes as EntriesEdited
  );
  const { t } = useTranslation();

  return (
    <>
      <Typography component="h1" variant="h4">
        {t("reviewEntries.title")}
      </Typography>
      {EditsCount(changes)}
      {changes.entryEdits?.map((e) => <EditedEntry edit={e} key={e.newId} />)}
    </>
  );
}

export function EditsCount(changes: EntriesEdited): ReactElement {
  const { t } = useTranslation();

  return (
    <Typography>
      {t("reviewEntries.completed.number")}
      {changes.entryEdits?.length ?? 0}
    </Typography>
  );
}

async function undoEdit(edit: EntryEdit): Promise<void> {
  const oldWord = await getWord(edit.oldId);
  await updateWord({ ...oldWord, id: edit.newId });
}

function EditedEntry(props: { edit: EntryEdit }): ReactElement {
  const handleIsUndoAllowed = (): Promise<boolean> =>
    getFrontierWords().then(
      (words) => words.findIndex((w) => w.id === props.edit.newId) !== -1
    );

  return (
    <Grid container style={{ flexWrap: "nowrap", overflow: "auto" }}>
      <Typography>{props.edit.oldId}</Typography>
      <Grid key={"arrow"} style={{ margin: theme.spacing(1) }}>
        <ArrowRightAlt
          fontSize="large"
          style={{
            position: "relative",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      </Grid>
      <Typography>{props.edit.newId}</Typography>
      <UndoButton
        buttonIdEnabled={`edit-undo-${props.edit.newId}`}
        buttonIdCancel="edit-undo-cancel"
        buttonIdConfirm="edit-undo-confirm"
        textIdDialog="reviewEntries.undo.undoDialog"
        textIdDisabled="reviewEntries.undo.undoDisabled"
        textIdEnabled="reviewEntries.undo.undo"
        isUndoAllowed={handleIsUndoAllowed}
        undo={() => undoEdit(props.edit)}
      />
    </Grid>
  );
}
