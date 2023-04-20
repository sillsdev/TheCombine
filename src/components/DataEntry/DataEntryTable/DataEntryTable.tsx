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
import { Hash } from "types/hash";
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
  senseGuid: string;
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
  defunctWordIds: Hash<string>;
  fetchFrontier: FetchStatus;
}

export function addSemanticDomainToSense(
  semDom: SemanticDomain,
  word: Word,
  senseGuid: string
): Word {
  const sense = word.senses.find((s) => s.guid === senseGuid);
  if (!sense) {
    throw new Error("Word has no sense with specified guid");
  }
  sense.semanticDomains.push(makeSemDomCurrent(semDom));
  const senses = word.senses.map((s) => (s.guid === senseGuid ? sense : s));
  return { ...word, senses };
}

// Update the UserId and timestamp for a semantic domain
function makeSemDomCurrent(semDom: SemanticDomain): SemanticDomain {
  const created = new Date().toISOString();
  const userId = getCurrentUser()?.id;
  return { ...semDom, created, userId };
}

/** Filter out words that do not have at least 1 Active/Protected sense */
function filterWords(words: Word[]): Word[] {
  return words.filter((w) =>
    w.senses.find((s) =>
      [Status.Active, Status.Protected].includes(s.accessibility)
    )
  );
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
    defunctWordIds: {},
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

  // Use this before updating any word on the backend,
  // to make sure that word doesn't get edited by two different functions
  const defunctWord = (wordId: string, newWordId?: string): void => {
    if (newWordId || !Object.keys(state.defunctWordIds).includes(wordId)) {
      setState((prevState) => {
        const defunctWordIds = prevState.defunctWordIds;
        if (!defunctWordIds[wordId]) {
          defunctWordIds[wordId] = newWordId ?? "";
        }
        return { ...prevState, defunctWordIds };
      });
    }
  };

  const addAudiosToBackend = async (
    oldId: string,
    audioURLs: string[]
  ): Promise<string> => {
    if (!audioURLs.length) {
      return oldId;
    }
    defunctWord(oldId);
    let newId = oldId;
    for (const audioURL of audioURLs) {
      const audioBlob = await fetch(audioURL).then((result) => result.blob());
      const fileName = getFileNameForWord(newId);
      const audioFile = new File([audioBlob], fileName, {
        type: audioBlob.type,
        lastModified: Date.now(),
      });
      newId = await backend.uploadAudio(newId, audioFile);
      URL.revokeObjectURL(audioURL);
    }
    defunctWord(oldId, newId);
    return newId;
  };

  const addDuplicateWord = async (
    word: Word,
    audioURLs: string[],
    oldId: string
  ): Promise<void> => {
    const isInDisplay =
      state.recentWords.findIndex((w) => w.word.id === oldId) > -1;
    if (isInDisplay) {
      defunctWord(oldId);
    }
    const userId = getCurrentUser()?.id ?? "";
    const newWord = await backend.updateDuplicate(oldId, userId, word);
    var newId = newWord.id;
    if (isInDisplay) {
      defunctWord(oldId, newId);
    }
    newId = await addAudiosToBackend(newWord.id, audioURLs);

    if (!isInDisplay) {
      const word = await backend.getWord(newId);
      const domId = props.semanticDomain.id;
      setState((prevState) => {
        const recentWords = prevState.recentWords;
        word.senses.forEach((s) => {
          if (s.semanticDomains.find((dom) => dom.id === domId)) {
            recentWords.push({ word, senseGuid: s.guid });
          }
        });
        return { ...prevState, recentWords };
      });
    }
  };

  /** Add one-sense word to the display of recent entries. */
  const addToDisplay = (wordAccess: WordAccess, insertIndex?: number): void => {
    setState((prevState) => {
      const fetchFrontier = startFetch(prevState.fetchFrontier);
      const recentWords = [...prevState.recentWords];
      if (insertIndex !== undefined && insertIndex < recentWords.length) {
        recentWords.splice(insertIndex, 0, wordAccess);
      } else {
        recentWords.push(wordAccess);
      }
      return { ...prevState, fetchFrontier, recentWords };
    });
  };

  const addNewWord = async (
    wordToAdd: Word,
    audioURLs: string[],
    insertIndex?: number
  ): Promise<void> => {
    wordToAdd.note.language = state.analysisLang.bcp47;

    // Check if word is duplicate to existing word.
    const dupId = await backend.getDuplicateId(wordToAdd);
    if (dupId) {
      return await addDuplicateWord(wordToAdd, audioURLs, dupId);
    }

    let word = await backend.createWord(wordToAdd);
    const wordId = await addAudiosToBackend(word.id, audioURLs);
    if (wordId !== word.id) {
      word = await backend.getWord(wordId);
    }
    /*if (ignoreRecent) {
      await updateExisting();
      return;
    }
    const word = await backend.getWord(wordId);*/
    addToDisplay({ word, senseGuid: word.senses[0].guid }, insertIndex);
  };

  /** Finished with this page of words, select new semantic domain */
  const submit = (e?: React.FormEvent<HTMLFormElement>): void => {
    e?.preventDefault();
  };

  /** Update the word in the backend and the frontend */
  const updateWordBackAndFront = async (
    wordToUpdate: Word,
    senseGuid: string,
    audioURLs?: string[]
  ): Promise<void> => {
    let word = await updateWordInBackend(wordToUpdate);
    if (audioURLs?.length) {
      const wordId = await addAudiosToBackend(word.id, audioURLs);
      word = await backend.getWord(wordId);
    }
    addToDisplay({ word, senseGuid });
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

    for (const sense of existingWord.senses) {
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
            sense.guid
          );
          await updateWordBackAndFront(updatedWord, sense.guid, audioFileURLs);
          return;
        }
      }
    }
    // The gloss is new for this word, so add a new sense.
    const senses = [...existingWord.senses];
    const semDom = makeSemDomCurrent(props.semanticDomain);
    const sense = newSense(gloss, state.analysisLang.bcp47, semDom);
    senses.push(sense);
    const newWord: Word = { ...existingWord, senses };

    await updateWordBackAndFront(newWord, sense.guid, audioFileURLs);
    return;
  };

  const addAudioToWord = async (
    oldId: string,
    audioFile: File
  ): Promise<void> => {
    defunctWord(oldId);
    const newId = await backend.uploadAudio(oldId, audioFile);
    defunctWord(oldId, newId);
  };

  const deleteAudioFromWord = async (
    oldId: string,
    fileName: string
  ): Promise<void> => {
    defunctWord(oldId);
    const newId = await backend.deleteAudio(oldId, fileName);
    defunctWord(oldId, newId);
  };

  const updateWordInBackend = async (oldWord: Word): Promise<Word> => {
    defunctWord(oldWord.id);
    const newWord = await backend.updateWord(oldWord);
    defunctWord(oldWord.id, newWord.id);
    return newWord;
  };

  const removeRecentEntry = (index: number): void => {
    if (index < 0 || index >= state.recentWords.length) {
      throw new RangeError("Entry doesn't exist in recent entries.");
    }
    setState((prevState) => {
      const recentWords = prevState.recentWords;
      recentWords.splice(index, 1);
      return { ...prevState, recentWords };
    });
  };

  const undoRecentEntry = async (index: number): Promise<void> => {
    const recentEntry = state.recentWords[index];
    const oldWord = recentEntry.word;
    defunctWord(oldWord.id);
    removeRecentEntry(index);
    const guid = recentEntry.senseGuid;
    const oldSenses = oldWord.senses;
    const oldSense = oldSenses.find((s) => s.guid === guid)!;
    const oldDoms = oldSense.semanticDomains;
    if (oldDoms.length > 1) {
      // If there is more than one semantic domain in this sense, only remove the domain
      const doms = oldDoms.filter((d) => d.id !== props.semanticDomain.id);
      const newSense: Sense = { ...oldSense, semanticDomains: doms };
      const senses = oldSenses.map((s) => (s.guid === guid ? newSense : s));
      await updateWordInBackend({ ...oldWord, senses });
    } else if (oldSenses.length > 1) {
      // If there is more than one sense in this word, only remove this sense.
      const senses = oldSenses.filter((s) => s.guid !== guid);
      await updateWordInBackend({ ...oldWord, senses });
    } else {
      // Since this is the only sense, delete the word.
      await backend.deleteFrontierWord(oldWord.id);
    }
  };

  const updateRecentVern = async (
    index: number,
    newVern: string,
    targetWordId?: string
  ): Promise<void> => {
    if (targetWordId !== undefined) {
      throw new Error("VernDialog on RecentEntry is not yet supported.");
    }
    const oldEntry = state.recentWords[index];
    const oldWord = oldEntry.word;
    const oldSense = oldWord.senses.find((s) => s.guid === oldEntry.senseGuid);
    if (!oldSense) {
      throw new Error("Entry does not have specified sense.");
    }

    if (oldWord.senses.length === 1 && oldSense.semanticDomains.length === 1) {
      // The word can simply be updated as it stand
      await updateWordInBackend({ ...oldWord, vernacular: newVern });
    } else {
      // This is a modification that has to be retracted and replaced with a new entry
      const word = simpleWord(newVern, firstGlossText(oldSense));
      word.id = "";
      await undoRecentEntry(index);
      await addNewWord(word, [], index);
    }
  };

  const updateRecentGloss = async (
    index: number,
    def: string
  ): Promise<void> => {
    const oldEntry = state.recentWords[index];
    const oldWord = oldEntry.word;
    const oldSense = oldWord.senses.find((s) => s.guid === oldEntry.senseGuid);
    if (!oldSense) {
      throw new Error("Word has no sense with specified guid");
    }
    defunctWord(oldEntry.word.id);
    const newSense: Sense = { ...oldSense };
    newSense.glosses = [{ ...oldSense.glosses[0], def }];
    const allDoms = oldSense.semanticDomains;
    if (oldSense.semanticDomains.length === 1) {
      // The word can simply be updated as it stands
      await updateWordInBackend({ ...oldWord, senses: [newSense] });
    } else {
      // The other semantic domains should be retained with the former sense
      const domIndex = allDoms.findIndex(
        (d) => d.id === props.semanticDomain.id
      );
      const currentDom = allDoms.splice(domIndex, 1);
      newSense.guid = v4();
      newSense.semanticDomains = [currentDom[0]];
      const senses = oldWord.senses.map((s) =>
        s.guid === oldEntry.senseGuid ? newSense : s
      );
      const newWord = await updateWordInBackend({ ...oldWord, senses });
      newWord.senses.push(oldSense);
      await updateWordInBackend(newWord);
    }
  };

  const updateRecentNote = async (
    index: number,
    text: string
  ): Promise<void> => {
    const oldWord = state.recentWords[index].word;
    if (text !== oldWord.note.text) {
      const note: Note = { ...oldWord.note, text };
      await updateWordInBackend({ ...oldWord, note });
    }
  };

  /** Replace every displayed instance of a word. */
  const replaceInDisplay = useCallback(
    async (oldId: string, newId: string): Promise<void> => {
      const word = await backend.getWord(newId);
      setState((prevState) => {
        const defunctWordIds = prevState.defunctWordIds;
        delete defunctWordIds[oldId];
        const fetchFrontier = startFetch(prevState.fetchFrontier);
        const recentWords = prevState.recentWords.map((a) =>
          a.word.id === oldId ? { word, senseGuid: a.senseGuid } : a
        );
        return { ...prevState, defunctWordIds, fetchFrontier, recentWords };
      });
    },
    [state.defunctWordIds, state.recentWords]
  );

  function resetEverything() {
    // Reset everything
    props.hideQuestions();
    setState((prevState) => ({
      ...prevState,
      recentWords: [],
      defunctWordIds: {},
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
          await addNewWord(newEntry, newEntryAudio);
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
    if (state.fetchFrontier === FetchStatus.ToFetch) {
      updateExisting();
    } // eslint-disable-next-line
  }, [state.fetchFrontier]);

  useEffect(() => {
    const allIds = Object.keys(state.defunctWordIds);
    if (!allIds.length) {
      return;
    }

    const oldId = allIds.find(
      (id) =>
        state.defunctWordIds[id] &&
        state.recentWords.find((w) => w.word.id === id)
    );
    if (oldId) {
      // Do an update if there's one to be done.
      let newId = oldId;
      while (state.defunctWordIds[newId]) {
        newId = state.defunctWordIds[newId];
      }
      replaceInDisplay(oldId, newId);
    } else {
      // When recent entries are up to date, update the list of all words
      setState((prevState) => {
        const defunctWordIds = prevState.defunctWordIds;
        for (const id in Object.keys(defunctWordIds)) {
          if (!prevState.recentWords.find((w) => w.word.id === id)) {
            delete defunctWordIds[id];
          }
        }
        const fetchFrontier = startFetch(prevState.fetchFrontier);
        return { ...prevState, defunctWordIds, fetchFrontier };
      });
    }
  }, [replaceInDisplay, state.defunctWordIds]);

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
              key={wordAccess.word.id + "_" + wordAccess.senseGuid}
              rowIndex={index}
              entry={wordAccess.word}
              senseGuid={wordAccess.senseGuid}
              updateGloss={(newDef: string) => updateRecentGloss(index, newDef)}
              updateNote={(newText: string) => updateRecentNote(index, newText)}
              updateVern={(newVernacular: string, targetWordId?: string) =>
                updateRecentVern(index, newVernacular, targetWordId)
              }
              removeEntry={() => undoRecentEntry(index)}
              addAudioToWord={(wordId: string, audioFile: File) =>
                addAudioToWord(wordId, audioFile)
              }
              deleteAudioFromWord={(wordId: string, fileName: string) =>
                deleteAudioFromWord(wordId, fileName)
              }
              recorder={recorder}
              focusNewEntry={() => {
                if (refNewEntry.current) {
                  refNewEntry.current.focus(FocusTarget.Vernacular);
                }
              }}
              analysisLang={state.analysisLang}
              vernacularLang={state.vernacularLang}
              disabled={Object.keys(state.defunctWordIds).includes(
                wordAccess.word.id
              )}
            />
          </Grid>
        ))}

        <Grid item xs={12}>
          <NewEntry
            ref={refNewEntry}
            allWords={state.suggestVerns ? state.existingWords : []}
            defunctWordIds={Object.keys(state.defunctWordIds)}
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
