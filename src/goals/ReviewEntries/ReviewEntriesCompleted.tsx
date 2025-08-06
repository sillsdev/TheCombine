import { ArrowRightAlt } from "@mui/icons-material";
import { Grid, List, ListItem, Typography } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { Word } from "api/models";
import { getWord, isInFrontier, updateWord } from "backend";
import { UndoButton } from "components/Buttons";
import WordCard from "components/WordCard";
import {
  EntriesEdited,
  EntryEdit,
} from "goals/ReviewEntries/ReviewEntriesTypes";
import { type StoreState } from "rootRedux/types";
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
      <List>
        {changes.entryEdits?.map((e) => (
          <EditedEntry edit={e} key={e.newId} />
        ))}
      </List>
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
  const { oldId, newId } = props.edit;

  const [oldWord, setOldWord] = useState<Word | undefined>();
  const [newWord, setNewWord] = useState<Word | undefined>();

  useEffect(() => {
    getWord(oldId).then(setOldWord);
  }, [oldId]);
  useEffect(() => {
    getWord(newId).then(setNewWord);
  }, [newId]);

  return (
    <ListItem>
      <Grid container rowSpacing={4} wrap="nowrap">
        <Grid item>{!!oldWord && <WordCard word={oldWord} />}</Grid>
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
        <Grid item>{!!newWord && <WordCard word={newWord} />}</Grid>
        <UndoButton
          buttonIdEnabled={`edit-undo-${props.edit.newId}`}
          buttonIdCancel="edit-undo-cancel"
          buttonIdConfirm="edit-undo-confirm"
          textIdDialog="reviewEntries.undo.undoDialog"
          textIdDisabled="reviewEntries.undo.undoDisabled"
          textIdEnabled="reviewEntries.undo.undo"
          isUndoAllowed={() => isInFrontier(newId)}
          undo={() => undoEdit(props.edit)}
        />
      </Grid>
    </ListItem>
  );
}
