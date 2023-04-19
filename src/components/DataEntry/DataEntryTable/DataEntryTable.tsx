import { ExitToApp, List as ListIcon } from "@mui/icons-material";
import { Button, Grid, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import React, {
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { v4 } from "uuid";

import {
  AutocompleteSetting,
  Note,
  SemanticDomain,
  SemanticDomainTreeNode,
  Sense,
  Status,
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
import theme from "types/theme";
import { newSense, simpleWord } from "types/word";
import { firstGlossText } from "types/wordUtilities";
import { defaultWritingSystem, newWritingSystem } from "types/writingSystem";

export const exitButtonId = "exit-to-domain-tree";

interface DataEntryTableProps {
  semanticDomain: SemanticDomainTreeNode;
  treeIsOpen?: boolean;
  openTree: () => void;
  showExistingData: () => void;
  isSmallScreen?: boolean;
  hideQuestions: () => void;
}

interface WordAccess {
  word: Word;
  senseIndex: number;
}

interface WordReplacement {
  word: Word;
  formerId: string;
  removedSenseIndex?: number;
}

enum FetchStatus {
  Default = "DEFAULT",
  Fetching = "FETCHING",
  ToFetch = "TO_FETCH",
}

function startFetch(status: FetchStatus) {
  if (status === FetchStatus.Default) {
    return FetchStatus.ToFetch;
  }
  return status;
}

interface DataEntryTableState {
  existingWords: Word[];
  recentWords: WordAccess[];
  isReady: boolean;
  suggestVerns: boolean;
  analysisLang: WritingSystem;
  vernacularLang: WritingSystem;
  defunctWordIds: string[];
  fetchFrontier: FetchStatus;
  wordReplacement?: WordReplacement;
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
    // Update the UserId and timestamp for new semanticDomain
    semanticDomain.userId = getCurrentUser()?.id;
    semanticDomain.created = new Date().toISOString();
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

function makeSemDomCurrent(semDom: SemanticDomain): SemanticDomain {
  const created = new Date().toISOString();
  const userId = getCurrentUser()?.id;
  return { ...semDom, created, userId };
}

export function addSenseToWord(
  semDom: SemanticDomain,
  existingWord: Word,
  gloss: string,
  language: string
): Word {
  // Update the UserId and timestamp for new semanticDomain
  const word: Word = { ...existingWord, senses: [...existingWord.senses] };
  word.senses.push(newSense(gloss, language, makeSemDomCurrent(semDom)));
  return word;
}

/**
 * A data entry table containing recent word entries
 */
export default function DataEntryTable(
  props: DataEntryTableProps
): ReactElement {
  const [state, setState] = useState<DataEntryTableState>({
    existingWords: [],
    recentWords: [],
    isReady: false,
    suggestVerns: true,
    analysisLang: defaultWritingSystem,
    vernacularLang: newWritingSystem("qaa", "Unknown"),
    defunctWordIds: [],
    fetchFrontier: FetchStatus.Default,
  });
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const refNewEntry = useRef<NewEntry>(null);
  const recorder = new Recorder();

  const getProjectSettings = useCallback(async (): Promise<void> => {
    const proj = await backend.getProject();
    const suggestVerns = proj.autocompleteSetting === AutocompleteSetting.On;
    const analysisLang = proj.analysisWritingSystems[0] ?? defaultWritingSystem;
    const vernacularLang = proj.vernacularWritingSystem;
    setState((prevState) => ({
      ...prevState,
      analysisLang,
      vernacularLang,
      suggestVerns,
      fetchFrontier: FetchStatus.ToFetch,
    }));
  }, []);

  const innerGetWordsFromBackend = useCallback(async (): Promise<Word[]> => {
    const existingWords = await backend.getFrontierWords();
    return filterWords(existingWords);
  }, []);

  const updateExisting = useCallback(async (): Promise<void> => {
    if (state.fetchFrontier !== FetchStatus.Fetching) {
      setState((prevState) => ({
        ...prevState,
        fetchFrontier: FetchStatus.Fetching,
      }));
      const existingWords = await innerGetWordsFromBackend();
      setState((prevState) => ({
        ...prevState,
        fetchFrontier: FetchStatus.Default,
        existingWords,
      }));
    }
  }, [innerGetWordsFromBackend, state.fetchFrontier]);

  /** Filter out words that do not have at least 1 Active/Protected sense */
  function filterWords(words: Word[]): Word[] {
    return words.filter((w) =>
      w.senses.find((s) =>
        [Status.Active, Status.Protected].includes(s.accessibility)
      )
    );
  }

  // Use this before updating any word on the backend,
  // to make sure that word doesn't get edited by two different functions
  const defunctWord = (wordId: string): void => {
    const defunctWordIds = state.defunctWordIds;
    if (!defunctWordIds.includes(wordId)) {
      defunctWordIds.push(wordId);
      setState((prevState) => ({ ...prevState, defunctWordIds }));
    }
  };

  const addAudiosToBackend = async (
    wordId: string,
    audioURLs: string[]
  ): Promise<string> => {
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
  };

  /** Replace every displayed instance of a word, or add if not already there. */
  const addOrReplaceInDisplay = (oldWordId: string, word: Word): void => {
    const recentWords = [...state.recentWords];
    let defunctWordIds = state.defunctWordIds;

    if (recentWords.find((w) => w.word.id === oldWordId)) {
      recentWords.forEach((entry) => {
        if (entry.word.id === oldWordId) {
          entry.word = word;
        }
      });
      defunctWordIds = defunctWordIds.filter((id) => id !== oldWordId);
    } else {
      const thisDomId = props.semanticDomain.id;
      word.senses.forEach((sense, senseIndex) => {
        if (sense.semanticDomains.find((dom) => dom.id === thisDomId)) {
          recentWords.push({ word, senseIndex });
        }
      });
    }
    setState((prevState) => ({ ...prevState, recentWords, defunctWordIds }));
  };

  const addDuplicateWord = async (
    wordToAdd: Word,
    audioURLs: string[],
    duplicatedId: string,
    ignoreRecent?: boolean
  ): Promise<void> => {
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
  };

  /** Add one-sense word to the display of recent entries. */
  const addToDisplay = (
    wordAccess: WordAccess,
    insertIndex?: number,
    formerId?: string
  ): void => {
    const recentWords = [...state.recentWords];
    if (insertIndex !== undefined && insertIndex < recentWords.length) {
      recentWords.splice(insertIndex, 0, wordAccess);
    } else {
      recentWords.push(wordAccess);
    }
    const wordReplacement = formerId
      ? { word: wordAccess.word, formerId }
      : undefined;
    setState((prevState) => ({
      ...prevState,
      fetchFrontier: startFetch(prevState.fetchFrontier),
      recentWords,
      wordReplacement,
    }));
  };

  const addNewWord = async (
    wordToAdd: Word,
    audioURLs: string[],
    insertIndex?: number,
    ignoreRecent?: boolean
  ): Promise<void> => {
    wordToAdd.note.language = state.analysisLang.bcp47;

    // Check if word is duplicate to existing word.
    const dupId = await backend.getDuplicateId(wordToAdd);
    if (dupId) {
      await addDuplicateWord(wordToAdd, audioURLs, dupId, ignoreRecent);
      return;
    }

    const addedWord = await backend.createWord(wordToAdd);
    const wordId = await addAudiosToBackend(addedWord.id, audioURLs);

    if (ignoreRecent) {
      await updateExisting();
      return;
    }

    const word = await backend.getWord(wordId);
    addToDisplay({ word, senseIndex: 0 }, insertIndex);
  };

  /** Finished with this page of words, select new semantic domain */
  const submit = (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) {
      e.preventDefault();
    }
  };

  /** Update the word in the backend and the frontend */
  const updateWordBackAndFront = async (
    wordToUpdate: Word,
    senseIndex: number,
    audioURLs?: string[]
  ): Promise<void> => {
    let word = await updateWordInBackend(wordToUpdate);
    if (audioURLs && audioURLs.length) {
      const wordId = await addAudiosToBackend(word.id, audioURLs);
      word = await backend.getWord(wordId);
    }
    addToDisplay({ word, senseIndex }, undefined, wordToUpdate.id);
  };

  const updateWordBackAndFrontSimple = async (oldWord: Word): Promise<void> => {
    const word = await updateWordInBackend(oldWord);
    setState((prevState) => ({
      ...prevState,
      wordReplacement: { formerId: oldWord.id, word },
    }));
  };

  // Checks if sense already exists with this gloss and semantic domain
  // returns false if encounters duplicate
  const updateWordWithNewGloss = async (
    wordId: string,
    gloss: string,
    audioFileURLs?: string[]
  ): Promise<void> => {
    const existingWord = state.existingWords.find((w: Word) => w.id === wordId);
    if (!existingWord) {
      throw new Error("You are trying to update a nonexistent word");
    }

    for (const [senseIndex, sense] of existingWord.senses.entries()) {
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
            t("addWords.senseInWord") + `: ${existingWord.vernacular}, ${gloss}`
          );
          return;
        } else {
          const updatedWord = addSemanticDomainToSense(
            props.semanticDomain,
            existingWord,
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
      existingWord,
      gloss,
      state.analysisLang.bcp47
    );
    await updateWordBackAndFront(
      updatedWord,
      updatedWord.senses.length - 1, // Was added at the end of the sense list
      audioFileURLs
    );
    return;
  };

  const addAudioToRecentWord = async (
    formerId: string,
    audioFile: File
  ): Promise<void> => {
    defunctWord(formerId);
    await backend.uploadAudio(formerId, audioFile).then(async (newWordId) => {
      const word = await backend.getWord(newWordId);
      replaceInDisplay({ formerId, word });
    });
  };

  const deleteAudioFromRecentWord = async (
    formerId: string,
    fileName: string
  ): Promise<void> => {
    defunctWord(formerId);
    await backend.deleteAudio(formerId, fileName).then(async (newWordId) => {
      const word = await backend.getWord(newWordId);
      replaceInDisplay({ formerId, word });
    });
  };

  const updateWordInBackend = async (wordToUpdate: Word): Promise<Word> => {
    defunctWord(wordToUpdate.id);
    const updatedWord = await backend.updateWord(wordToUpdate);
    return updatedWord;
  };

  const undoRecentEntry = async (entryIndex: number): Promise<string> => {
    if (entryIndex >= state.recentWords.length) {
      throw new RangeError("Entry doesn't exist in recent entries.");
    }
    const recentEntry = state.recentWords[entryIndex];

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
  };

  const updateRecentEntryVern = async (
    entryIndex: number,
    newVern: string,
    targetWordId?: string
  ): Promise<void> => {
    if (targetWordId !== undefined) {
      throw new Error("VernDialog on RecentEntry is not yet supported.");
    }
    const oldEntry = state.recentWords[entryIndex];
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
  };

  const updateRecentEntryGloss = async (
    entryIndex: number,
    def: string
  ): Promise<void> => {
    const oldEntry = state.recentWords[entryIndex];
    const oldWord = oldEntry.word;
    const senseIndex = oldEntry.senseIndex;
    const oldSense = oldWord.senses[senseIndex];
    const newSense: Sense = { ...oldSense };
    newSense.glosses = [{ ...oldSense.glosses[0], def }];
    const allDoms = oldSense.semanticDomains;
    if (oldSense.semanticDomains.length === 1) {
      // The word can simply be updated as it stands
      await updateSense(oldWord, senseIndex, newSense);
    } else {
      // The other semantic domains should be retained with the former def
      const domIndex = allDoms.findIndex(
        (d) => d.id === props.semanticDomain.id
      );
      const currentDom = allDoms.splice(domIndex, 1);
      newSense.guid = v4();
      newSense.semanticDomains = [currentDom[0]];
      const wordId = await updateSense(oldWord, senseIndex, newSense);
      const word = await backend.getWord(wordId);
      word.senses.push(oldSense);
      await updateWordBackAndFrontSimple(word);
    }
  };

  const updateRecentEntryNote = async (
    entryIndex: number,
    newText: string
  ): Promise<void> => {
    const oldEntry = state.recentWords[entryIndex];
    const oldWord = oldEntry.word;
    const oldNote = oldWord.note;
    if (newText !== oldNote.text) {
      const updatedNote: Note = { ...oldNote, text: newText };
      const updatedWord: Word = { ...oldWord, note: updatedNote };
      await updateWordBackAndFrontSimple(updatedWord);
    }
  };

  const removeRecentEntry = (entryIndex: number): void => {
    const recentWords = [...state.recentWords];
    recentWords.splice(entryIndex, 1);
    setState((prevState) => ({ ...prevState, recentWords }));
  };

  /** Update a vern in a word and replace every displayed instance of that word. */
  const updateVernacular = async (
    oldWord: Word,
    vernacular: string
  ): Promise<void> => {
    const word = await updateWordInBackend({ ...oldWord, vernacular });
    setState((prevState) => ({
      ...prevState,
      wordReplacement: { formerId: oldWord.id, word },
    }));
  };

  /** Update a sense in a word and replace every displayed instance of that word. */
  const updateSense = async (
    oldWord: Word,
    senseIndex: number,
    updatedSense: Sense
  ): Promise<string> => {
    const senses = [...oldWord.senses];
    senses.splice(senseIndex, 1, updatedSense);
    const word = await updateWordInBackend({ ...oldWord, senses });
    setState((prevState) => ({
      ...prevState,
      wordReplacement: { formerId: oldWord.id, word },
    }));
    return word.id;
  };

  /** Remove a sense from a word and replace every displayed instance of that word. */
  const removeSense = async (
    oldWord: Word,
    removedSenseIndex: number
  ): Promise<string> => {
    const senses = [...oldWord.senses];
    senses.splice(removedSenseIndex, 1);
    const word = await updateWordInBackend({ ...oldWord, senses });
    setState((prevState) => ({
      ...prevState,
      wordReplacement: { formerId: oldWord.id, word, removedSenseIndex },
    }));
    return word.id;
  };

  /** Replace every displayed instance of a word.
   * If removedSenseIndex is provided, that sense was removed. */
  const replaceInDisplay = useCallback(
    (rep: WordReplacement): void => {
      const recentWords = [...state.recentWords];
      recentWords.forEach((entry, index) => {
        if (entry.word.id === rep.formerId) {
          let senseIndex = entry.senseIndex;
          if (
            rep.removedSenseIndex !== undefined &&
            senseIndex >= rep.removedSenseIndex
          ) {
            senseIndex--;
          }
          const newEntry: WordAccess = { ...entry, word: rep.word, senseIndex };
          recentWords.splice(index, 1, newEntry);
        }
      });
      const defunctWordIds = state.defunctWordIds.filter(
        (id) => id !== rep.formerId
      );

      setState((prevState) => ({
        ...prevState,
        defunctWordIds,
        fetchFrontier: startFetch(prevState.fetchFrontier),
        recentWords,
        wordReplacement: undefined,
      }));
    },
    [state.defunctWordIds, state.recentWords]
  );

  /** Delete specified word and clear from recent words. */
  const deleteWord = async (word: Word): Promise<void> => {
    defunctWord(word.id);
    await backend.deleteFrontierWord(word.id);
    await updateExisting();
  };

  function resetEverything() {
    // Reset everything
    props.hideQuestions();
    setState((prevState) => ({
      ...prevState,
      recentWords: [],
      defunctWordIds: [],
    }));
    if (refNewEntry.current) {
      refNewEntry.current.resetState();
    }
  }

  // Reset the entry table. If there is an un-submitted word then submit it.
  const handleExit = async (): Promise<void> => {
    // Check if there is a new word, but user exited without pressing enter
    if (refNewEntry.current) {
      const newEntry = refNewEntry.current.state.newEntry;
      const existingWord = state.existingWords.find(
        (word: Word) => word.vernacular === newEntry.vernacular
      );
      // existing word not found, create a new word
      if (!existingWord) {
        if (!newEntry.senses.length) {
          newEntry.senses.push(
            newSense(undefined, undefined, props.semanticDomain)
          );
        }
        const newEntryAudio = refNewEntry.current.state.audioFileURLs;
        if (newEntry?.vernacular) {
          await addNewWord(newEntry, newEntryAudio, undefined, true);
        }
      } else {
        // found an existing word, update it
        await updateWordWithNewGloss(
          existingWord.id,
          newEntry.senses[0].glosses[0].def,
          refNewEntry.current.state.audioFileURLs
        );
      }
    }
    return resetEverything();
  };

  useEffect(() => {
    getProjectSettings();
  }, [getProjectSettings]);

  useEffect(() => {
    if (state.wordReplacement) {
      replaceInDisplay(state.wordReplacement);
    }
  }, [replaceInDisplay, state.wordReplacement]);

  useEffect(() => {
    if (state.fetchFrontier === FetchStatus.ToFetch) {
      updateExisting();
    } // eslint-disable-next-line
  }, [state.fetchFrontier]);

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

        {state.recentWords.map((wordAccess, index) => (
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
              analysisLang={state.analysisLang}
              vernacularLang={state.vernacularLang}
              disabled={state.defunctWordIds.includes(wordAccess.word.id)}
            />
          </Grid>
        ))}

        <Grid item xs={12}>
          <NewEntry
            ref={refNewEntry}
            allWords={state.suggestVerns ? state.existingWords : []}
            defunctWordIds={state.defunctWordIds}
            updateWordWithNewGloss={(
              wordId: string,
              gloss: string,
              audioFileURLs: string[]
            ) => updateWordWithNewGloss(wordId, gloss, audioFileURLs)}
            addNewWord={(word: Word, audioFileURLs: string[]) =>
              addNewWord(word, audioFileURLs)
            }
            semanticDomain={makeSemDomCurrent(props.semanticDomain)}
            setIsReadyState={(isReady: boolean) => {
              if (isReady && !state.isReady) {
                setState((prevState) => ({ ...prevState, isReady }));
              }
            }}
            recorder={recorder}
            analysisLang={state.analysisLang}
            vernacularLang={state.vernacularLang}
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
            color={state.isReady ? "primary" : "secondary"}
            style={{ marginTop: theme.spacing(2) }}
            endIcon={<ExitToApp />}
            tabIndex={-1}
            onClick={() => {
              props.openTree();
              handleExit();
            }}
          >
            {t("buttons.exit")}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
