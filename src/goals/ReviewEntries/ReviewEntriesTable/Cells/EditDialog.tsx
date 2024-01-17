import { Check, Close, CloseFullscreen, OpenInFull } from "@mui/icons-material";
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
  type SelectChangeEvent,
} from "@mui/material";
import { ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { Flag, Pronunciation, Sense, Status, Word } from "api/models";
import { deleteAudio, updateWord } from "backend";
import { FlagButton } from "components/Buttons";
import {
  addEntryEditToGoal,
  asyncUpdateGoal,
} from "components/GoalTimeline/Redux/GoalActions";
import PronunciationsBackend from "components/Pronunciations/PronunciationsBackend";
import PronunciationsFrontend from "components/Pronunciations/PronunciationsFrontend";
import { uploadFileFromPronunciation } from "components/Pronunciations/utilities";
import SenseCard from "components/WordCard/SenseCard";
import SummarySenseCard from "components/WordCard/SummarySenseCard";
import { StoreState } from "types";
import { StoreStateDispatch } from "types/Redux/actions";
import { useAppDispatch, useAppSelector } from "types/hooks";
import {
  FileWithSpeakerId,
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

/** Return the translation code for our error, or undefined if there is no error */
export function getSenseError(
  sense: Sense,
  checkGlosses = true,
  checkDomains = false
): string | undefined {
  if (checkGlosses && sense.glosses.length === 0) {
    return "reviewEntries.error.gloss";
  }
  if (checkDomains && sense.semanticDomains.length === 0) {
    return "reviewEntries.error.domain";
  }
  return undefined;
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
    newSense.definitions = newSense.definitions.filter((d) => d.text.length);
    newSense.glosses = newSense.glosses.filter((g) => g.def.length);
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

    const error = getSenseError(newSense);
    if (error) {
      return error;
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

  return { ...word, note, senses, vernacular };
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

  const saveAndClose = async (): Promise<void> => {
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
              <Check style={{ color: "green" }} />
            </IconButton>
            <IconButton onClick={cancelAndClose}>
              <Close style={{ color: "red" }} />
            </IconButton>
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent>
        <Grid container direction="column" justifyContent="flex-start">
          {/* Vernacular */}
          <Grid item>
            <Card>
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
            <Card>
              <CardHeader
                action={
                  newWord.senses.length > 1 && (
                    <IconButton onClick={() => setShowSenses((prev) => !prev)}>
                      {showSenses ? (
                        <CloseFullscreen style={{ color: "gray" }} />
                      ) : (
                        <OpenInFull style={{ color: "gray" }} />
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
            <Card>
              <CardHeader title={t("reviewEntries.columns.pronunciations")} />
              <CardContent>
                <PronunciationsFrontend
                  elemBetweenRecordAndPlay={
                    <PronunciationsBackend
                      audio={newWord.audio}
                      overrideMemo
                      playerOnly
                      wordId={newWord.id}
                      deleteAudio={delOldAudio}
                      replaceAudio={repOldAudio}
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
            <Card>
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
            <Card>
              <CardHeader title={t("reviewEntries.columns.flag")} />
              <CardContent>
                <FlagButton
                  flag={newWord.flag}
                  updateFlag={(flag: Flag) =>
                    setNewWord((prev) => ({ ...prev, flag }))
                  }
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
