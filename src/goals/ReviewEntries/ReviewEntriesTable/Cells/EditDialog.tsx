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
  Grid,
  IconButton,
  MenuItem,
  Select,
  TextField,
  type SelectChangeEvent,
} from "@mui/material";
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
import {
  addEntryEditToGoal,
  asyncUpdateGoal,
} from "components/GoalTimeline/Redux/GoalActions";
import PronunciationsBackend from "components/Pronunciations/PronunciationsBackend";
import PronunciationsFrontend from "components/Pronunciations/PronunciationsFrontend";
import { uploadFileFromPronunciation } from "components/Pronunciations/utilities";
import SenseCard from "components/WordCard/SenseCard";
import SummarySenseCard from "components/WordCard/SummarySenseCard";
import {
  trimDefinitions,
  trimGlosses,
} from "goals/ReviewEntries/ReviewEntriesTable/Cells/EditSensesCardContent";
import { type StoreState } from "types";
import { type StoreStateDispatch } from "types/Redux/actions";
import { useAppDispatch, useAppSelector } from "types/hooks";
import { themeColors } from "types/theme";
import {
  type FileWithSpeakerId,
  newFlag,
  newNote,
  newPronunciation,
  updateSpeakerInAudio,
} from "types/word";
import { TextFieldWithFont } from "utilities/fontComponents";

/** Add word update to the current goal. */
function asyncUpdateWord(oldId: string, newId: string) {
  return async (dispatch: StoreStateDispatch) => {
    dispatch(addEntryEditToGoal({ newId, oldId }));
    await dispatch(asyncUpdateGoal());
  };
}

/** Return a cleaned array of senses ready to be saved (none with .deleted=true):
 * - If a sense is marked as deleted or is utterly blank, it is removed
 * - If a sense lacks gloss, return error
 * - If the user attempts to delete all senses, return old senses with deleted senses removed */
function cleanSenses(newSenses: Sense[]): Sense[] | string {
  const cleanedSenses: Sense[] = [];

  for (const newSense of newSenses) {
    // Skip deleted senses.
    if (newSense.accessibility === Status.Deleted) {
      continue;
    }

    // Remove empty definitions, empty glosses, and duplicate domains.
    newSense.definitions = trimDefinitions(newSense.definitions);
    newSense.glosses = trimGlosses(newSense.glosses);
    const domainIds = [
      ...new Set(newSense.semanticDomains.map((dom) => dom.id)),
    ];
    domainIds.sort();
    newSense.semanticDomains = domainIds.map(
      (id) => newSense.semanticDomains.find((dom) => dom.id === id)!
    );

    // Skip empty senses.
    if (
      newSense.definitions.length === 0 &&
      newSense.glosses.length === 0 &&
      newSense.semanticDomains.length === 0
    ) {
      continue;
    }

    // Don't allow senses without a gloss.
    if (!newSense.glosses.length) {
      return "reviewEntries.error.gloss";
    }

    cleanedSenses.push(newSense);
  }

  return cleanedSenses;
}

/** Clean a word. Return error string id if:
 * - the vernacular field is empty
 * - all senses are empty/deleted */
function cleanWord(word: Word): Word | string {
  // Make sure vernacular isn't empty.
  const vernacular = word.vernacular.trim();
  if (!vernacular.length) {
    return "reviewEntries.error.vernacular";
  }

  // Clean senses and check for problems.
  const senses = cleanSenses(word.senses);
  if (typeof senses === "string") {
    return senses;
  }

  // Clear note language if text empty.
  const noteText = word.note.text.trim();
  const note = newNote(noteText, noteText ? word.note.language : "");

  // Clear flag text if flag not active.
  const flagActive = word.flag.active;
  const flag = newFlag(flagActive ? word.flag.text.trim() : undefined);
  flag.active = flagActive;

  return { ...word, flag, note, senses, vernacular };
}

/** Update word in the backend */
export async function updateFrontierWord(
  newWord: Word,
  newAudio: Pronunciation[],
  oldAudio: Pronunciation[]
): Promise<string> {
  let newId = newWord.id;
  for (const o of oldAudio) {
    if (!newWord.audio.find((n) => n.fileName === o.fileName)) {
      newId = await deleteAudio(newId, o.fileName);
    }
  }
  newId = (await updateWord({ ...newWord, id: newId })).id;
  for (const pro of newAudio) {
    newId = await uploadFileFromPronunciation(newId, pro);
  }
  return newId;
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
  cancel: () => void;
  confirm: (newId: string) => Promise<void>;
  open: boolean;
  word: Word;
}

export default function EditDialog(props: EditDialogProps): ReactElement {
  const dispatch = useAppDispatch();

  const analysisWritingSystems = useAppSelector(
    (state: StoreState) =>
      state.currentProjectState.project.analysisWritingSystems
  );
  const vernLang = useAppSelector(
    (state: StoreState) =>
      state.currentProjectState.project.vernacularWritingSystem.bcp47
  );

  const [newAudio, setNewAudio] = useState<Pronunciation[]>([]);
  const [newWord, setNewWord] = useState(props.word);
  const [showSenses, setShowSenses] = useState(true);
  const [changes, setChanges] = useState(defaultEditFieldChanged);

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
        !!newWord.audio.find((n) =>
          props.word.audio.find(
            (o) => n.fileName === o.fileName && n.speakerId !== o.speakerId
          )
        ),
      [EditField.Senses]: false, // TODO: compute once senses are editable
      [EditField.Vernacular]:
        newWord.vernacular.trim() !== props.word.vernacular.trim(),
    });
  }, [newAudio, newWord, props.word]);

  const bgStyle = (field: EditField): CSSProperties => ({
    backgroundColor: changes[field] ? "lightyellow" : "lightgray",
  });

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
    if (
      !changes[EditField.Flag] &&
      !changes[EditField.Note] &&
      !changes[EditField.Pronunciations] &&
      !changes[EditField.Senses] &&
      !changes[EditField.Vernacular]
    ) {
      cancelAndClose();
    }

    // Remove empty/deleted senses; confirm nonempty vernacular and senses
    const cleanedWord = cleanWord(newWord);
    if (typeof cleanedWord === "string") {
      toast.error(cleanedWord);
      return Promise.reject(cleanedWord);
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
    props.cancel();
  };

  /** Undo all edits and close the edit dialog. */
  const cancelAndClose = (): void => {
    setNewAudio([]);
    setNewWord(props.word);
    props.cancel();
  };

  const { t } = useTranslation();

  return (
    <Dialog fullWidth open={props.open}>
      <DialogTitle>
        <Grid container justifyContent="space-between">
          <Grid item>
            {t("reviewEntries.materialTable.body.edit")}
            {" : "}
            {props.word.vernacular}
          </Grid>
          <Grid item>
            <IconButton onClick={saveAndClose}>
              <Check style={{ color: themeColors.success }} />
            </IconButton>
            <IconButton onClick={cancelAndClose}>
              <Close style={{ color: themeColors.error }} />
            </IconButton>
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent>
        <Grid
          container
          direction="column"
          justifyContent="flex-start"
          spacing={3}
        >
          {/* Vernacular */}
          <Grid item>
            <Card sx={bgStyle(EditField.Vernacular)}>
              <CardHeader title={t("reviewEntries.columns.vernacular")} />
              <CardContent>
                <TextFieldWithFont
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
          </Grid>

          {/* Senses */}
          <Grid item>
            <Card sx={bgStyle(EditField.Senses)}>
              <CardHeader
                action={
                  newWord.senses.length > 1 && (
                    <IconButton onClick={() => setShowSenses((prev) => !prev)}>
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
              <CardContent>
                {showSenses ? (
                  newWord.senses.map((s) => (
                    <SenseCard key={s.guid} sense={s} />
                  ))
                ) : (
                  <SummarySenseCard senses={newWord.senses} />
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Pronunciations */}
          <Grid item>
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
          </Grid>

          {/* Note */}
          <Grid item>
            <Card sx={bgStyle(EditField.Note)}>
              <CardHeader title={t("reviewEntries.columns.note")} />
              <CardContent>
                <Select
                  onChange={(e: SelectChangeEvent) =>
                    updateNoteLang(e.target.value)
                  }
                  value={
                    newWord.note.language || analysisWritingSystems[0].bcp47
                  }
                >
                  {analysisWritingSystems.map((ws) => (
                    <MenuItem key={ws.bcp47} value={ws.bcp47}>
                      {ws.name ? `${ws.bcp47} : ${ws.name}` : ws.bcp47}
                    </MenuItem>
                  ))}
                </Select>
                <TextFieldWithFont
                  analysis
                  lang={newWord.note.language}
                  onChange={(e) => updateNoteText(e.target.value)}
                  value={newWord.note.text}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Flag */}
          <Grid item>
            <Card sx={bgStyle(EditField.Flag)}>
              <CardHeader title={t("reviewEntries.columns.flag")} />
              <CardContent>
                <IconButton onClick={toggleFlag}>
                  {newWord.flag.active ? (
                    <FlagFilled sx={{ color: themeColors.error }} />
                  ) : (
                    <FlagOutlined />
                  )}
                </IconButton>
                <TextField
                  onChange={(e) => updateFlag(e.target.value)}
                  value={newWord.flag.active ? newWord.flag.text : ""}
                ></TextField>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
