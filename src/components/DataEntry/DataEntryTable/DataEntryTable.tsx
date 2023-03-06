import { ExitToApp, List as ListIcon } from "@mui/icons-material";
import { Button, Grid, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import React, {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

import {
  AutocompleteSetting,
  Note,
  SemanticDomain,
  SemanticDomainTreeNode,
  Sense,
  Word,
  WritingSystem,
} from "api/models";
import * as backend from "backend";
import { getCurrentUser } from "backend/localStorage";
import NewEntry, {
  FocusTarget,
} from "components/DataEntry/DataEntryTable/NewEntry/NewEntry";
import RecentEntry from "components/DataEntry/DataEntryTable/RecentEntry/RecentEntry";
import { getFileNameForWord } from "components/Pronunciations/AudioRecorder";
import Recorder from "components/Pronunciations/Recorder";
import theme, { themeColors } from "types/theme";
import { newSense, simpleWord } from "types/word";
import { firstGlossText } from "types/wordUtilities";
import { defaultWritingSystem, newWritingSystem } from "types/writingSystem";

export const exitButtonId = "exit-to-domain-tree";

interface DataEntryTableProps {
  semanticDomain: SemanticDomainTreeNode;
  treeIsOpen?: boolean;
  openTree: () => void;
  getWordsFromBackend: () => Promise<Word[]>;
  showExistingData: () => void;
  isSmallScreen?: boolean;
  hideQuestions: () => void;
}

interface WordAccess {
  word: Word;
  senseIndex: number;
}

interface DataEntryTableState {
  existingWords: Word[];
  recentlyAddedWords: WordAccess[];
  isReady: boolean;
  suggestVerns: boolean;
  analysisLang: WritingSystem;
  vernacularLang: WritingSystem;
  defunctWordIds: string[];
  isFetchingFrontier: boolean;
}

export function addSemanticDomainToSense(
  semanticDomain: SemanticDomain,
  existingWord: Word,
  senseIndex: number
): Word {
  if (senseIndex >= existingWord.senses.length) {
    throw new RangeError("senseIndex too large");
  } else {
    const oldSense = existingWord.senses[senseIndex];
    const updatedDomains = [...oldSense.semanticDomains];
    // Update the UserId for new semanticDomain
    semanticDomain.userId = getCurrentUser()?.id;
    updatedDomains.push(semanticDomain);
    const updatedSense: Sense = {
      ...oldSense,
      semanticDomains: updatedDomains,
    };
    const updatedSenses = [...existingWord.senses];
    updatedSenses.splice(senseIndex, 1, updatedSense);
    return { ...existingWord, senses: updatedSenses };
  }
}

export function addSenseToWord(
  semanticDomain: SemanticDomain,
  existingWord: Word,
  gloss: string,
  language: string
): Word {
  // Update the UserId for new semanticDomain
  semanticDomain.userId = getCurrentUser()?.id;
  const word: Word = { ...existingWord, senses: [...existingWord.senses] };
  word.senses.push(newSense(gloss, language, semanticDomain));
  return word;
}

export default function DataEntryTable(
  props: DataEntryTableProps
): ReactElement {
  const [existingWords, setExistingWords] = useState<Word[]>([]);
  const [recentlyAddedWords, setRecentlyAddedWords] = useState<WordAccess[]>(
    []
  );
  const [isReady, setIsReady] = useState<boolean | null>(false);
  const [suggestVerns, setSuggestVerns] = useState<boolean>(true);
  const [analysisLang, setAnalysisLang] =
    useState<WritingSystem>(defaultWritingSystem);
  const [vernacularLang, setVernacularLang] = useState<WritingSystem>(
    newWritingSystem("qaa", "Unknown")
  );
  const [defunctWordIds, setDefunctWordIds] = useState<string[]>([]);
  const [isFetchingFrontier, setIsFetchingFrontier] = useState<boolean>(false);
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const refNewEntry = useRef<NewEntry>(null);
  const recorder = new Recorder();

  useEffect(() => {
    async function fetchData() {
      await updateExisting();
      await getProjectSettings();
    }
    console.log(1);
    fetchData();
  }, []);

  async function getProjectSettings(): Promise<void> {
    const proj = await backend.getProject();
    const suggestVerns = proj.autocompleteSetting === AutocompleteSetting.On;
    const analysisLang = proj.analysisWritingSystems[0] ?? defaultWritingSystem;
    const vernacularLang = proj.vernacularWritingSystem;
    setSuggestVerns(suggestVerns);
    setAnalysisLang(analysisLang);
    setVernacularLang(vernacularLang);
  }

  /** Finished with this page of words, select new semantic domain */
  // TODO: Implement
  function submit(e?: React.FormEvent<HTMLFormElement>) {
    if (e) {
      e.preventDefault();
    }
  }

  // Use this before updating any word on the backend,
  // to make sure that word doesn't get edited by two different functions
  function defunctWord(wordId: string): void {
    const defunctWordIdsTemp = defunctWordIds;
    if (!defunctWordIdsTemp.includes(wordId)) {
      defunctWordIdsTemp.push(wordId);
      setDefunctWordIds(defunctWordIdsTemp);
    }
  }

  async function addNewWord(
    wordToAdd: Word,
    audioURLs: string[],
    insertIndex?: number,
    ignoreRecent?: boolean
  ): Promise<void> {
    wordToAdd.note.language = analysisLang.bcp47;

    // Check if word is duplicate to existing word.
    const dupId = await backend.getDuplicateId(wordToAdd);
    if (dupId) {
      await addDuplicateWord(wordToAdd, audioURLs, dupId, ignoreRecent);
      return;
    }

    const addedWord = await backend.createWord(wordToAdd);
    const wordId = await addAudiosToBackend(addedWord.id, audioURLs);

    await updateExisting();

    if (ignoreRecent) {
      return;
    }

    const word = await backend.getWord(wordId);
    await backend.updateWord(word);

    addToDisplay({ word, senseIndex: 0 }, insertIndex);
  }

  async function addDuplicateWord(
    wordToAdd: Word,
    audioURLs: string[],
    duplicatedId: string,
    ignoreRecent?: boolean
  ): Promise<void> {
    // Get UserId and passing userId parameter to updateDuplicate
    var userId = getCurrentUser()?.id;
    const updatedWord = await backend.updateDuplicate(
      duplicatedId,
      userId ?? "",
      wordToAdd
    );
    const wordId = await addAudiosToBackend(updatedWord.id, audioURLs);
    await updateExisting();

    if (ignoreRecent) {
      return;
    }

    addOrReplaceInDisplay(duplicatedId, await backend.getWord(wordId));
  }

  /** Update the word in the backend and the frontend */
  async function updateWordBackAndFront(
    wordToUpdate: Word,
    senseIndex: number,
    audioURLs?: string[]
  ): Promise<void> {
    let word = await updateWordInBackend(wordToUpdate);
    if (audioURLs && audioURLs.length) {
      const wordId = await addAudiosToBackend(word.id, audioURLs);
      word = await backend.getWord(wordId);
    }

    addToDisplay({ word, senseIndex }, undefined, () => {
      replaceInDisplay(wordToUpdate.id, word);
    });
  }
  async function updateWordBackAndFrontSimple(
    wordToUpdate: Word
  ): Promise<void> {
    const updatedWord = await updateWordInBackend(wordToUpdate);
    replaceInDisplay(wordToUpdate.id, updatedWord);
  }

  // Checks if sense already exists with this gloss and semantic domain
  // returns false if encounters duplicate
  async function updateWordWithNewGloss(
    wordId: string,
    gloss: string,
    audioFileURLs?: string[]
  ): Promise<void> {
    const existingWordTemp = existingWords.find(
      (word: Word) => word.id === wordId
    );
    if (!existingWordTemp) {
      throw new Error("You are trying to update a nonexistent word");
    }

    for (const [senseIndex, sense] of existingWordTemp.senses.entries()) {
      if (
        sense.glosses &&
        sense.glosses.length &&
        sense.glosses[0].def === gloss
      ) {
        if (
          sense.semanticDomains
            .map((semanticDomain) => semanticDomain.id)
            .includes(props.semanticDomain.id)
        ) {
          // User is trying to add a sense that already exists
          enqueueSnackbar(
            t("addWords.senseInWord") +
              `: ${existingWordTemp.vernacular}, ${gloss}`
          );
          return;
        } else {
          const updatedWord = addSemanticDomainToSense(
            props.semanticDomain,
            existingWordTemp,
            senseIndex
          );
          await updateWordBackAndFront(updatedWord, senseIndex, audioFileURLs);
          return;
        }
      }
    }
    // The gloss is new for this word, so add a new sense.
    const updatedWord = addSenseToWord(
      props.semanticDomain,
      existingWordTemp,
      gloss,
      analysisLang.bcp47
    );
    await updateWordBackAndFront(
      updatedWord,
      updatedWord.senses.length - 1, // Was added at the end of the sense list
      audioFileURLs
    );
    return;
  }

  async function addAudiosToBackend(
    wordId: string,
    audioURLs: string[]
  ): Promise<string> {
    let updatedWordId = wordId;
    for (const audioURL of audioURLs) {
      const audioBlob = await fetch(audioURL).then((result) => result.blob());
      const fileName = getFileNameForWord(updatedWordId);
      const audioFile = new File([audioBlob], fileName, {
        type: audioBlob.type,
        lastModified: Date.now(),
      });
      defunctWord(updatedWordId);
      updatedWordId = await backend.uploadAudio(updatedWordId, audioFile);
      URL.revokeObjectURL(audioURL);
    }
    return updatedWordId;
  }

  async function addAudioToRecentWord(
    oldWordId: string,
    audioFile: File
  ): Promise<void> {
    defunctWord(oldWordId);
    await backend.uploadAudio(oldWordId, audioFile).then(async (newWordId) => {
      await backend.getWord(newWordId).then(async (w) => {
        replaceInDisplay(oldWordId, w);
        await updateExisting();
      });
    });
  }

  async function deleteAudioFromRecentWord(
    oldWordId: string,
    fileName: string
  ): Promise<void> {
    defunctWord(oldWordId);
    await backend.deleteAudio(oldWordId, fileName).then(async (newWordId) => {
      await backend.getWord(newWordId).then(async (w) => {
        replaceInDisplay(oldWordId, w);
        await updateExisting();
      });
    });
  }

  async function updateWordInBackend(wordToUpdate: Word): Promise<Word> {
    defunctWord(wordToUpdate.id);
    const updatedWord = await backend.updateWord(wordToUpdate);
    await updateExisting();
    return updatedWord;
  }

  async function updateExisting(): Promise<void> {
    if (!isFetchingFrontier) {
      setIsFetchingFrontier(true);
      const existingWords = await props.getWordsFromBackend();
      const isFetchingFrontier = false;
      setExistingWords(existingWords);
      setIsFetchingFrontier(isFetchingFrontier);
    }
  }

  async function undoRecentEntry(entryIndex: number): Promise<string> {
    if (entryIndex >= recentlyAddedWords.length) {
      throw new RangeError("Entry doesn't exist in recent entries.");
    }
    const recentEntry: WordAccess = recentlyAddedWords[entryIndex];

    // Copy all the parts we need
    const recentWord: Word = { ...recentEntry.word };
    const senseCount = recentWord.senses.length;
    const senseIndex = recentEntry.senseIndex;
    const recentSense: Sense = { ...recentWord.senses[senseIndex] };

    removeRecentEntry(entryIndex);

    if (recentSense.semanticDomains.length > 1) {
      // If there is more than one semantic domain in this sense, only remove the domain
      const updatedSemanticDomains: SemanticDomain[] =
        recentSense.semanticDomains.filter(
          (semDom) => semDom.id !== props.semanticDomain.id
        );
      const updatedSense: Sense = {
        ...recentSense,
        semanticDomains: updatedSemanticDomains,
      };
      return await updateSense(recentWord, senseIndex, updatedSense);
    } else if (senseCount > 1) {
      // If there is more than one sense in this word, only remove this sense.
      return await removeSense(recentWord, senseIndex);
    } else {
      // Since this is the only sense, delete the word.
      await deleteWord(recentWord);
      return "";
    }
  }

  async function updateRecentEntryVern(
    entryIndex: number,
    newVern: string,
    targetWordId?: string
  ): Promise<void> {
    if (targetWordId !== undefined) {
      throw new Error("VernDialog on RecentEntry is not yet supported.");
    }
    const oldEntry = recentlyAddedWords[entryIndex];
    const oldWord = oldEntry.word;
    const oldSense = oldWord.senses[oldEntry.senseIndex];

    if (
      oldWord.senses.length === 1 &&
      oldWord.senses[0].semanticDomains.length === 1
    ) {
      // The word can simply be updated as it stand
      await updateVernacular(oldWord, newVern);
    } else {
      // This is a modification that has to be retracted and replaced with a new entry
      const word = simpleWord(newVern, firstGlossText(oldSense));
      word.id = "";
      await undoRecentEntry(entryIndex).then(async () => {
        await addNewWord(word, [], entryIndex);
      });
    }
  }

  async function updateRecentEntryGloss(
    entryIndex: number,
    def: string
  ): Promise<void> {
    const oldEntry = recentlyAddedWords[entryIndex];
    const oldWord = oldEntry.word;
    const senseIndex = oldEntry.senseIndex;
    const oldSense = oldWord.senses[senseIndex];
    const oldGloss = oldSense.glosses[0];

    if (oldWord.senses.length === 1 && oldSense.semanticDomains.length === 1) {
      // The word can simply be updated as it stands
      const newSense: Sense = {
        ...oldSense,
        glosses: [{ ...oldGloss, def }],
      };
      await updateSense(oldWord, senseIndex, newSense);
    } else {
      // This is a modification that has to be retracted and replaced with a new entry
      await undoRecentEntry(entryIndex).then(async (wordId) => {
        await updateWordWithNewGloss(wordId, def);
      });
    }
  }

  async function updateRecentEntryNote(
    entryIndex: number,
    newText: string
  ): Promise<void> {
    const oldEntry = recentlyAddedWords[entryIndex];
    const oldWord = oldEntry.word;
    const oldNote = oldWord.note;
    if (newText !== oldNote.text) {
      const updatedNote: Note = { ...oldNote, text: newText };
      const updatedWord: Word = { ...oldWord, note: updatedNote };
      await updateWordBackAndFrontSimple(updatedWord);
    }
  }

  function removeRecentEntry(entryIndex: number): void {
    const recentlyAddedWordsTemp = recentlyAddedWords;
    recentlyAddedWordsTemp.splice(entryIndex, 1);
    setRecentlyAddedWords(recentlyAddedWordsTemp);
  }

  /** Update a vern in a word and replace every displayed instance of that word. */
  async function updateVernacular(
    word: Word,
    vernacular: string
  ): Promise<void> {
    const updatedWord: Word = { ...word, vernacular };
    await updateWordInBackend(updatedWord).then((updatedWord) =>
      replaceInDisplay(word.id, updatedWord)
    );
  }

  /** Update a sense in a word and replace every displayed instance of that word. */
  async function updateSense(
    word: Word,
    senseIndex: number,
    updatedSense: Sense
  ): Promise<string> {
    const senses = [...word.senses];
    senses.splice(senseIndex, 1, updatedSense);
    const updatedWord: Word = { ...word, senses };
    return await updateWordInBackend(updatedWord).then((w) => {
      replaceInDisplay(word.id, w);
      return w.id;
    });
  }

  /** Remove a sense from a word and replace every displayed instance of that word. */
  async function removeSense(word: Word, senseIndex: number): Promise<string> {
    const senses = [...word.senses];
    senses.splice(senseIndex, 1);
    const updatedWord: Word = { ...word, senses };
    return await updateWordInBackend(updatedWord).then((w) => {
      replaceInDisplay(word.id, w, senseIndex);
      return w.id;
    });
  }

  /** Add one-sense word to the display of recent entries. */
  function addToDisplay(
    wordAccess: WordAccess,
    insertIndex?: number,
    callback?: () => void
  ): void {
    const recentlyAddedWordsTemp = recentlyAddedWords;
    if (insertIndex !== undefined && insertIndex < recentlyAddedWords.length) {
      recentlyAddedWordsTemp.splice(insertIndex, 0, wordAccess);
      setRecentlyAddedWords(recentlyAddedWordsTemp);
    } else {
      recentlyAddedWordsTemp.push(wordAccess);
      setRecentlyAddedWords(recentlyAddedWordsTemp);
    }
    callback ?? (() => {});
  }

  /** Replace every displayed instance of a word, or add if not already there. */
  function addOrReplaceInDisplay(oldWordId: string, word: Word): void {
    const recentlyAddedWordsTemp = recentlyAddedWords;
    let defunctWordIdsTemp = defunctWordIds;

    if (recentlyAddedWordsTemp.find((w) => w.word.id === oldWordId)) {
      recentlyAddedWordsTemp.forEach((entry) => {
        if (entry.word.id === oldWordId) {
          entry.word = word;
        }
      });
      defunctWordIdsTemp = defunctWordIds.filter((id) => id !== oldWordId);
    } else {
      const thisDomId = props.semanticDomain.id;
      word.senses.forEach((sense, senseIndex) => {
        if (sense.semanticDomains.find((dom) => dom.id === thisDomId)) {
          recentlyAddedWordsTemp.push({ word, senseIndex });
        }
      });
    }
    setRecentlyAddedWords(recentlyAddedWordsTemp);
    setDefunctWordIds(defunctWordIdsTemp);
  }

  /** Replace every displayed instance of a word.
   * If removedSenseIndex is provided, that sense was removed. */
  function replaceInDisplay(
    oldWordId: string,
    word: Word,
    removedSenseIndex?: number
  ): void {
    const recentlyAddedWordsTemp = recentlyAddedWords;
    recentlyAddedWordsTemp.forEach((entry, index) => {
      if (entry.word.id === oldWordId) {
        let senseIndex = entry.senseIndex;
        if (
          removedSenseIndex !== undefined &&
          senseIndex >= removedSenseIndex
        ) {
          senseIndex--;
        }
        const newEntry: WordAccess = { ...entry, word, senseIndex };
        recentlyAddedWords.splice(index, 1, newEntry);
      }
    });
    const defunctWordIdsTemp = defunctWordIds.filter((id) => id !== oldWordId);

    setRecentlyAddedWords(recentlyAddedWordsTemp);
    setDefunctWordIds(defunctWordIdsTemp);
  }

  /** Delete specified word and clear from recent words. */
  async function deleteWord(word: Word): Promise<void> {
    defunctWord(word.id);
    await backend
      .deleteFrontierWord(word.id)
      .then(async () => await updateExisting());
  }

  async function exitGracefully(): Promise<void> {
    // Check if there is a new word, but user exited without pressing enter
    if (refNewEntry.current) {
      const newEntry = refNewEntry.current.state.newEntry;
      if (!newEntry.senses.length) {
        newEntry.senses.push(
          newSense(undefined, undefined, props.semanticDomain)
        );
      }
      const newEntryAudio = refNewEntry.current.state.audioFileURLs;
      if (newEntry?.vernacular) {
        await addNewWord(newEntry, newEntryAudio, undefined, true);
        refNewEntry.current.resetState();
      }
    }

    // Reset everything
    props.hideQuestions();
    setDefunctWordIds([]);
    setRecentlyAddedWords([]);
  }

  return (
    <form onSubmit={(e?: React.FormEvent<HTMLFormElement>) => submit(e)}>
      <input type="submit" style={{ display: "none" }} />

      <Grid container>
        <Grid item xs={4}>
          <Typography
            variant="h5"
            align="center"
            style={{
              marginTop: theme.spacing(2),
              marginBottom: theme.spacing(2),
            }}
          >
            {t("addWords.vernacular")}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography
            variant="h5"
            align="center"
            style={{
              marginTop: theme.spacing(2),
              marginBottom: theme.spacing(2),
            }}
          >
            {t("addWords.glosses")}
          </Typography>
        </Grid>

        {recentlyAddedWords.map((wordAccess, index) => (
          <Grid item xs={12} key={index}>
            <RecentEntry
              key={wordAccess.word.id + "_" + wordAccess.senseIndex}
              rowIndex={index}
              entry={wordAccess.word}
              senseIndex={wordAccess.senseIndex}
              updateGloss={(newDef: string) =>
                updateRecentEntryGloss(index, newDef)
              }
              updateNote={(newText: string) =>
                updateRecentEntryNote(index, newText)
              }
              updateVern={(newVernacular: string, targetWordId?: string) =>
                updateRecentEntryVern(index, newVernacular, targetWordId)
              }
              removeEntry={() => undoRecentEntry(index)}
              addAudioToWord={(wordId: string, audioFile: File) =>
                addAudioToRecentWord(wordId, audioFile)
              }
              deleteAudioFromWord={(wordId: string, fileName: string) =>
                deleteAudioFromRecentWord(wordId, fileName)
              }
              recorder={recorder}
              focusNewEntry={() => {
                if (refNewEntry.current) {
                  refNewEntry.current.focus(FocusTarget.Vernacular);
                }
              }}
              analysisLang={analysisLang}
              vernacularLang={vernacularLang}
              disabled={defunctWordIds.includes(wordAccess.word.id)}
            />
          </Grid>
        ))}

        <Grid item xs={12}>
          <NewEntry
            ref={refNewEntry}
            allWords={suggestVerns ? existingWords : []}
            defunctWordIds={defunctWordIds}
            updateWordWithNewGloss={(
              wordId: string,
              gloss: string,
              audioFileURLs: string[]
            ) => updateWordWithNewGloss(wordId, gloss, audioFileURLs)}
            addNewWord={(word: Word, audioFileURLs: string[]) =>
              addNewWord(word, audioFileURLs)
            }
            semanticDomain={(() => {
              var tempSemanticDomain: SemanticDomain = props.semanticDomain;
              tempSemanticDomain.userId = getCurrentUser()?.id;
              return tempSemanticDomain;
            })()}
            setIsReadyState={(isReadyYet: boolean) => {
              const temp = isReady === isReadyYet ? null : isReadyYet;
              setIsReady(temp);
            }}
            recorder={recorder}
            analysisLang={analysisLang}
            vernacularLang={vernacularLang}
          />
        </Grid>
      </Grid>

      <Grid container justifyContent="space-between" spacing={3}>
        <Grid item>
          {props.isSmallScreen ? (
            <Button
              id="toggle-existing-data"
              style={{ marginTop: theme.spacing(2) }}
              onClick={props.showExistingData}
            >
              <ListIcon fontSize={"medium"} color={"inherit"} />
            </Button>
          ) : null}
        </Grid>
        <Grid item>
          <Button
            id={exitButtonId}
            type="submit"
            variant="contained"
            color={isReady ? "primary" : "secondary"}
            style={{ marginTop: theme.spacing(2) }}
            endIcon={<ExitToApp />}
            tabIndex={-1}
            onClick={props.openTree}
          >
            {t("buttons.exit")}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
