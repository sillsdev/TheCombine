import {
  Check,
  Close,
  CloseFullscreen,
  Flag as FlagFilled,
  FlagOutlined,
  OpenInFull,
} from "@mui/icons-material";
import {
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid2,
  IconButton,
  MenuItem,
  Select,
  Stack,
  type SelectChangeEvent,
} from "@mui/material";
import { grey, yellow } from "@mui/material/colors";
import {
  type CSSProperties,
  type ReactElement,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { type Pronunciation, type Sense, Status, type Word } from "api/models";
import { deleteAudio, updateWord } from "backend";
import { CancelConfirmDialog } from "components/Dialogs";
import PronunciationsBackend from "components/Pronunciations/PronunciationsBackend";
import PronunciationsFrontend from "components/Pronunciations/PronunciationsFrontend";
import { uploadFileFromPronunciation } from "components/Pronunciations/utilities";
import { addEntryEditToGoal, asyncUpdateGoal } from "goals/Redux/GoalActions";
import EditSensesCardContent from "goals/ReviewEntries/ReviewEntriesTable/Cells/EditCell/EditSensesCardContent";
import {
  cleanWord,
  isSenseChanged,
} from "goals/ReviewEntries/ReviewEntriesTable/Cells/EditCell/utilities";
import { useAppDispatch, useAppSelector } from "rootRedux/hooks";
import { type StoreState, type StoreStateDispatch } from "rootRedux/types";
import {
  type FileWithSpeakerId,
  newPronunciation,
  updateSpeakerInAudio,
} from "types/word";
import {
  NormalizedTextField,
  TextFieldWithFont,
} from "utilities/fontComponents";

/** Add word update to the current goal. */
function asyncUpdateWord(oldId: string, newId: string) {
  return async (dispatch: StoreStateDispatch) => {
    dispatch(addEntryEditToGoal({ newId, oldId }));
    await dispatch(asyncUpdateGoal());
  };
}

/** Update word in the backend */
export async function updateFrontierWord(
  newWord: Word,
  newAudio: Pronunciation[],
  oldAudio: Pronunciation[]
): Promise<string> {
  let newId = newWord.id;
  for (const o of oldAudio) {
    if (!newWord.audio.some((n) => n.fileName === o.fileName)) {
      newId = await deleteAudio(newId, o.fileName);
    }
  }
  newId = (await updateWord({ ...newWord, id: newId })).id;
  for (const pro of newAudio) {
    newId = await uploadFileFromPronunciation(newId, pro);
  }
  return newId;
}

export enum EditDialogId {
  ButtonCancel = "edit-dialog-cancel-button",
  ButtonCancelDialogCancel = "edit-dialog-cancel-dialog-cancel-button",
  ButtonCancelDialogConfirm = "edit-dialog-cancel-dialog-confirm-button",
  ButtonSave = "edit-dialog-save-button",
  ButtonSensesViewToggle = "edit-dialog-senses-view-toggle-button",
  TextFieldFlag = "edit-dialog-flag-textfield",
  TextFieldNote = "edit-dialog-note-textfield",
  TextFieldVernacular = "edit-dialog-vernacular-textfield",
}

enum EditField {
  Flag,
  Note,
  Pronunciations,
  Senses,
  Vernacular,
}

type EditFieldChanged = Record<EditField, boolean>;
const defaultEditFieldChanged: EditFieldChanged = {
  [EditField.Flag]: false,
  [EditField.Note]: false,
  [EditField.Pronunciations]: false,
  [EditField.Senses]: false,
  [EditField.Vernacular]: false,
};

interface EditDialogProps {
  close: () => void;
  confirm: (newId: string) => Promise<void>;
  word: Word;
}

export default function EditDialog(props: EditDialogProps): ReactElement {
  const dispatch = useAppDispatch();

  const analysisWritingSystems = useAppSelector(
    (state: StoreState) =>
      state.currentProjectState.project.analysisWritingSystems
  );
  const definitionsEnabled = useAppSelector(
    (state: StoreState) => state.currentProjectState.project.definitionsEnabled
  );
  const vernLang = useAppSelector(
    (state: StoreState) =>
      state.currentProjectState.project.vernacularWritingSystem.bcp47
  );

  const [cancelDialog, setCancelDialog] = useState(false);
  const [changes, setChanges] = useState(defaultEditFieldChanged);
  const [newAudio, setNewAudio] = useState<Pronunciation[]>([]);
  const [newWord, setNewWord] = useState(props.word);
  const [showSenses, setShowSenses] = useState(true);

  useEffect(() => {
    setChanges({
      [EditField.Flag]:
        newWord.flag.active !== props.word.flag.active ||
        (newWord.flag.active &&
          newWord.flag.text.trim() !== props.word.flag.text.trim()),
      [EditField.Note]:
        newWord.note.text.trim() !== props.word.note.text.trim() ||
        (newWord.note.text.trim().length > 0 &&
          newWord.note.language !== props.word.note.language),
      [EditField.Pronunciations]:
        newAudio.length > 0 ||
        newWord.audio.length !== props.word.audio.length ||
        newWord.audio.some((n) =>
          props.word.audio.some(
            (o) => n.fileName === o.fileName && n.speakerId !== o.speakerId
          )
        ),
      [EditField.Senses]:
        newWord.senses.length !== props.word.senses.length ||
        newWord.senses.some((s, i) => isSenseChanged(props.word.senses[i], s)),
      [EditField.Vernacular]:
        newWord.vernacular.trim() !== props.word.vernacular.trim(),
    });
  }, [newAudio, newWord, props.word]);

  const bgStyle = (field: EditField): CSSProperties => ({
    backgroundColor: changes[field] ? yellow[50] : grey[200],
  });

  // Functions for handling senses is the edit state.
  const moveSense = (from: number, to: number): void => {
    if (from < 0 || to < 0 || from === to) {
      return;
    }
    setNewWord((prev) => {
      if (from >= prev.senses.length || to >= prev.senses.length) {
        return prev;
      }
      const senses = [...prev.senses];
      senses.splice(to, 0, senses.splice(from, 1)[0]);
      return { ...prev, senses };
    });
  };
  const toggleDeleted = (s: Sense): Sense => ({
    ...s,
    accessibility:
      s.accessibility === Status.Deleted ? Status.Active : Status.Deleted,
  });
  const toggleSenseDeleted = (index: number): void => {
    setNewWord((prev) => {
      if (index < 0 || index >= prev.senses.length) {
        console.error("Sense doesn't exist.");
        return prev;
      }
      if (prev.senses[index].accessibility === Status.Protected) {
        console.error("Sense is protected.");
        return prev;
      }

      return {
        ...prev,
        senses: prev.senses.map((s, i) => (i === index ? toggleDeleted(s) : s)),
      };
    });
  };
  const updateOrAddSense = (sense: Sense): void => {
    setNewWord((prev) => {
      const oldSense = prev.senses.find((s) => s.guid === sense.guid);

      if (oldSense && oldSense.accessibility !== sense.accessibility) {
        console.error("Cannot change a sense status with this method.");
        return prev;
      }

      return {
        ...prev,
        senses: oldSense
          ? prev.senses.map((s) => (s.guid === sense.guid ? sense : s))
          : [...prev.senses, sense],
      };
    });
  };

  // Functions for handling pronunciations in the edit state.
  const delOldAudio = (fileName: string): void =>
    setNewWord((prev) => ({
      ...prev,
      audio: prev.audio.filter((pro) => pro.fileName !== fileName),
    }));
  const repOldAudio = (pro: Pronunciation): void =>
    setNewWord((prev) => {
      const audio = updateSpeakerInAudio(prev.audio, pro);
      return audio ? { ...prev, audio } : prev;
    });
  const delNewAudio = (url: string): void =>
    setNewAudio((prev) => prev.filter((pro) => pro.fileName !== url));
  const repNewAudio = (pro: Pronunciation): void =>
    setNewAudio((prev) => updateSpeakerInAudio(prev, pro) ?? prev);
  const uplNewAudio = (file: FileWithSpeakerId): void =>
    setNewAudio((prev) => [
      ...prev,
      newPronunciation(URL.createObjectURL(file), file.speakerId),
    ]);

  // Functions for handling the note in the edit state.
  const updateNoteLang = (language: string): void => {
    setNewWord((prev) => ({
      ...prev,
      note: { ...prev.note, language },
    }));
  };
  const updateNoteText = (text: string): void => {
    setNewWord((prev) => ({
      ...prev,
      note: {
        language: prev.note.language || analysisWritingSystems[0].bcp47,
        text,
      },
    }));
  };

  // Functions for handling the flag in the edit state.
  const toggleFlag = (): void => {
    setNewWord((prev) => ({
      ...prev,
      flag: { ...prev.flag, active: !prev.flag.active },
    }));
  };
  const updateFlag = (text: string): void => {
    setNewWord((prev) => ({
      ...prev,
      flag: { active: prev.flag.active || !!text, text },
    }));
  };

  /** Clean up the edited word and update it backend and frontend. */
  const saveAndClose = async (): Promise<void> => {
    // If no changes, just close
    if (Object.values(changes).every((change) => !change)) {
      cancelAndClose();
      return;
    }

    // Remove empty/deleted senses; confirm nonempty vernacular and senses
    const cleanedWord = cleanWord(newWord, {
      definitionsEnabled,
      exemptProtected: true,
    });
    if (typeof cleanedWord === "string") {
      toast.error(t(cleanedWord));
      return;
    }

    // Update in backend
    const newId = await updateFrontierWord(
      cleanedWord,
      newAudio,
      props.word.audio
    );

    // Update in goal
    await dispatch(asyncUpdateWord(props.word.id, newId));

    // Update in ReviewEntries state
    await props.confirm(newId);

    // Close
    props.close();
  };

  /** Open dialog to ask to discard changes, or close if no changes. */
  const conditionalCancel = (): void => {
    if (Object.values(changes).some((change) => change)) {
      setCancelDialog(true);
    } else {
      cancelAndClose();
    }
  };

  /** Undo all edits and close the edit dialog. */
  const cancelAndClose = (): void => {
    setNewAudio([]);
    setNewWord(props.word);
    setCancelDialog(false);
    props.close();
  };

  const { t } = useTranslation();

  const noteLangSelect = (
    <Select
      onChange={(e: SelectChangeEvent) => updateNoteLang(e.target.value)}
      value={newWord.note.language || analysisWritingSystems[0].bcp47}
    >
      {analysisWritingSystems.map((ws) => (
        <MenuItem key={ws.bcp47} value={ws.bcp47}>
          {ws.name ? `${ws.bcp47} : ${ws.name}` : ws.bcp47}
        </MenuItem>
      ))}
    </Select>
  );

  return (
    <>
      <CancelConfirmDialog
        buttonIdCancel={EditDialogId.ButtonCancelDialogCancel}
        buttonIdConfirm={EditDialogId.ButtonCancelDialogConfirm}
        handleCancel={() => setCancelDialog(false)}
        handleConfirm={cancelAndClose}
        open={cancelDialog}
        text="reviewEntries.discardChanges"
      />
      <Dialog fullWidth maxWidth="lg" open>
        <DialogTitle>
          <Grid2 container justifyContent="space-between">
            {`${t("reviewEntries.columns.edit")} : ${props.word.vernacular}`}

            <div>
              <IconButton
                data-testid={EditDialogId.ButtonSave}
                id={EditDialogId.ButtonSave}
                onClick={saveAndClose}
              >
                <Check sx={{ color: "success.main" }} />
              </IconButton>

              <IconButton
                data-testid={EditDialogId.ButtonCancel}
                id={EditDialogId.ButtonCancel}
                onClick={conditionalCancel}
              >
                <Close sx={{ color: "error.main" }} />
              </IconButton>
            </div>
          </Grid2>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3}>
            {/* Vernacular */}
            <Card sx={bgStyle(EditField.Vernacular)}>
              <CardHeader title={t("reviewEntries.columns.vernacular")} />
              <CardContent>
                <TextFieldWithFont
                  id={EditDialogId.TextFieldVernacular}
                  inputProps={{
                    "data-testid": EditDialogId.TextFieldVernacular,
                  }}
                  label={vernLang}
                  onChange={(e) =>
                    setNewWord((prev) => ({
                      ...prev,
                      vernacular: e.target.value,
                    }))
                  }
                  value={newWord.vernacular}
                  vernacular
                />
              </CardContent>
            </Card>

            {/* Senses */}
            <Card sx={bgStyle(EditField.Senses)}>
              <CardHeader
                action={
                  newWord.senses.length > 1 && (
                    <IconButton
                      data-testid={EditDialogId.ButtonSensesViewToggle}
                      id={EditDialogId.ButtonSensesViewToggle}
                      onClick={() => setShowSenses((prev) => !prev)}
                    >
                      {showSenses ? (
                        <CloseFullscreen sx={{ color: "gray" }} />
                      ) : (
                        <OpenInFull sx={{ color: "gray" }} />
                      )}
                    </IconButton>
                  )
                }
                title={t("reviewEntries.columns.senses")}
              />
              <EditSensesCardContent
                moveSense={moveSense}
                newSenses={newWord.senses}
                oldSenses={props.word.senses}
                showSenses={showSenses}
                toggleSenseDeleted={toggleSenseDeleted}
                updateOrAddSense={updateOrAddSense}
              />
            </Card>

            {/* Pronunciations */}
            <Card sx={bgStyle(EditField.Pronunciations)}>
              <CardHeader title={t("reviewEntries.columns.pronunciations")} />
              <CardContent>
                <PronunciationsFrontend
                  elemBetweenRecordAndPlay={
                    <PronunciationsBackend
                      audio={newWord.audio}
                      deleteAudio={delOldAudio}
                      overrideMemo
                      playerOnly
                      replaceAudio={repOldAudio}
                      wordId={newWord.id}
                    />
                  }
                  audio={newAudio}
                  deleteAudio={delNewAudio}
                  replaceAudio={repNewAudio}
                  uploadAudio={uplNewAudio}
                />
              </CardContent>
            </Card>

            {/* Note */}
            <Card sx={bgStyle(EditField.Note)}>
              <CardHeader
                action={noteLangSelect}
                title={t("reviewEntries.columns.note")}
              />
              <CardContent>
                <TextFieldWithFont
                  analysis
                  fullWidth
                  id={EditDialogId.TextFieldNote}
                  inputProps={{ "data-testid": EditDialogId.TextFieldNote }}
                  lang={newWord.note.language}
                  multiline
                  onChange={(e) => updateNoteText(e.target.value)}
                  value={newWord.note.text}
                />
              </CardContent>
            </Card>

            {/* Flag */}
            <Card sx={bgStyle(EditField.Flag)}>
              <CardHeader title={t("reviewEntries.columns.flag")} />
              <CardContent>
                <IconButton onClick={toggleFlag}>
                  {newWord.flag.active ? (
                    <FlagFilled sx={{ color: "error.main" }} />
                  ) : (
                    <FlagOutlined />
                  )}
                </IconButton>
                <NormalizedTextField
                  id={EditDialogId.TextFieldFlag}
                  inputProps={{ "data-testid": EditDialogId.TextFieldFlag }}
                  onChange={(e) => updateFlag(e.target.value)}
                  value={newWord.flag.active ? newWord.flag.text : ""}
                />
              </CardContent>
            </Card>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
