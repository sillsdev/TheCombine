import { ArrowRightAlt } from "@mui/icons-material";
import { Box, List, ListItem, Stack, Typography } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { Word } from "api/models";
import { getWord, isInFrontier, restoreWord, updateWord } from "backend";
import UndoButton from "components/Buttons/UndoButton";
import WordCard from "components/WordCard";
import {
  EntriesEdited,
  EntryEdit,
} from "goals/ReviewEntries/ReviewEntriesTypes";
import { type StoreState } from "rootRedux/types";

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
          <EditedEntry edit={e} key={e.oldId} />
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
  const { oldId, newId } = edit;
  if (newId) {
    await updateWord({ ...(await getWord(oldId)), id: newId });
  } else {
    await restoreWord(oldId);
  }
}

function EditedEntry(props: { edit: EntryEdit }): ReactElement {
  const { oldId, newId } = props.edit;

  const [oldWord, setOldWord] = useState<Word | undefined>();
  const [newWord, setNewWord] = useState<Word | undefined>();

  const { t } = useTranslation();

  useEffect(() => {
    getWord(oldId).then(setOldWord);
  }, [oldId]);
  useEffect(() => {
    if (newId) {
      getWord(newId).then(setNewWord);
    }
  }, [newId]);

  return (
    <ListItem>
      <Stack direction="row" spacing={1}>
        {!newId && <Typography>{t("mergeDups.undo.deleted")}</Typography>}

        {!!oldWord && (
          <Box>
            <WordCard word={oldWord} />
          </Box>
        )}

        {!!newId && (
          <Box alignContent="center">
            <ArrowRightAlt fontSize="large" />
          </Box>
        )}

        {!!newWord && (
          <Box>
            <WordCard word={newWord} />
          </Box>
        )}

        <Box alignContent="center">
          <UndoButton
            buttonIdEnabled={`edit-undo-${props.edit.newId}`}
            buttonIdCancel="edit-undo-cancel"
            buttonIdConfirm="edit-undo-confirm"
            textIdDialog={
              newId
                ? "reviewEntries.undo.undoDialog"
                : "mergeDups.undo.undoDeleteDialog"
            }
            textIdDisabled="reviewEntries.undo.undoDisabled"
            textIdEnabled={
              newId ? "reviewEntries.undo.undo" : "mergeDups.undo.undoDelete"
            }
            isUndoAllowed={async () => {
              return newId
                ? await isInFrontier(newId)
                : !(await isInFrontier(oldId));
            }}
            undo={() => undoEdit(props.edit)}
          />
        </Box>
      </Stack>
    </ListItem>
  );
}
