import { ArrowRightAlt } from "@mui/icons-material";
import { Button, Grid, Typography } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { getFrontierWords, getWord, updateWord } from "backend";
import { CancelConfirmDialog } from "components/Dialogs";
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
      <Typography>
        {t("reviewEntries.completed.number")}
        {changes.entryEdits?.length ?? 0}
      </Typography>
      {changes.entryEdits?.map((e) => <EditedEntry edit={e} key={e.newId} />)}
    </>
  );
}

function EditedEntry(props: { edit: EntryEdit }): ReactElement {
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
        edit={props.edit}
        textId="reviewEntries.undo.undo"
        dialogId="reviewEntries.undo.undoDialog"
        disabledId="reviewEntries.undo.undoDisabled"
      />
    </Grid>
  );
}

interface UndoButtonProps {
  edit: EntryEdit;
  textId: string;
  dialogId: string;
  disabledId: string;
}

function UndoButton(props: UndoButtonProps): ReactElement {
  const [isUndoEnabled, setUndoEnabled] = useState<boolean>(false);
  const [undoDialogOpen, setUndoDialogOpen] = useState<boolean>(false);
  const { t } = useTranslation();

  useEffect(() => {
    function checkFrontier(): void {
      getFrontierWords().then((words) =>
        setUndoEnabled(words.findIndex((w) => w.id === props.edit.newId) !== -1)
      );
    }
    checkFrontier();
  });

  return isUndoEnabled ? (
    <Grid container direction="column" justifyContent="center">
      <>
        <Button
          variant="outlined"
          id={`edit-undo-${props.edit.newId}`}
          onClick={() => setUndoDialogOpen(true)}
        >
          {t(props.textId)}
        </Button>
        <CancelConfirmDialog
          open={undoDialogOpen}
          textId={props.dialogId}
          handleCancel={() => setUndoDialogOpen(false)}
          handleConfirm={() =>
            undoEdit(props.edit).then(() => setUndoDialogOpen(false))
          }
          buttonIdCancel="edit-undo-cancel"
          buttonIdConfirm="edit-undo-confirm"
        />
      </>
    </Grid>
  ) : (
    <Grid container direction="column" justifyContent="center">
      <>
        <Button disabled>{t(props.disabledId)}</Button>
      </>
    </Grid>
  );
}

const undoEdit = async (edit: EntryEdit): Promise<void> => {
  const oldWord = await getWord(edit.oldId);
  await updateWord({ ...oldWord, id: edit.newId });
};
