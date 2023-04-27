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
  Project,
  SemanticDomain,
  SemanticDomainTreeNode,
  Sense,
  Status,
  Word,
  WritingSystem,
} from "api/models";
import * as backend from "backend";
import { getUserId } from "backend/localStorage";
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
  hasDrawerButton?: boolean;
  isTreeOpen?: boolean;
  hideQuestions: () => void;
  openTree: () => void;
  showExistingData: () => void;
}

interface SenseSwitch {
  oldGuid: string;
  newGuid: string;
}

export interface WordAccess {
  word: Word;
  senseGuid: string;
}

enum DefunctStatus {
  Recent = "RECENT",
  Retire = "RETIRE",
}

interface DataEntryTableState {
  // project properties
  analysisLang: WritingSystem;
  suggestVerns: boolean;
  vernacularLang: WritingSystem;
  // word data
  existingWords: Word[];
  recentWords: WordAccess[];
  // state management
  defunctUpdates: Hash<string>;
  defunctWordIds: Hash<DefunctStatus>;
  isFetchingFrontier: boolean;
  isReady: boolean;
  senseSwitches: SenseSwitch[];
}

/*** Add current semantic domain to specified sense within a word. */
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

/*** Filter out words that do not have at least one Active/Protected sense. */
function filterWords(words: Word[]): Word[] {
  return words.filter((w) =>
    w.senses.find((s) =>
      [Status.Active, Status.Protected].includes(s.accessibility)
    )
  );
}

/*** Return a copy of the semantic domain with current UserId and timestamp. */
export function makeSemDomCurrent(semDom: SemanticDomain): SemanticDomain {
  const created = new Date().toISOString();
  return { ...semDom, created, userId: getUserId() };
}

/*** Given a WordAccess and a new gloss, returns a copy of the word
 * with the gloss of the specified sense change to the new gloss.
 * If that sense has multiple semantic domains, split into two senses:
 * one with the specified domain and the new gloss,
 * a second with the other domains and the former gloss.
 */
export function updateEntryGloss(
  entry: WordAccess,
  def: string,
  semDomId: string
): Word {
  const sense = entry.word.senses.find((s) => s.guid === entry.senseGuid);
  if (!sense) {
    throw new Error("Word has no sense with specified guid");
  }

  const newSense: Sense = { ...sense };
  newSense.glosses = [{ ...sense.glosses[0], def }];
  const oldSense: Sense = { ...sense };

  // Move only the current semantic domain to the new sense.
  const doms = [...sense.semanticDomains];
  newSense.semanticDomains = [];
  oldSense.semanticDomains = [];
  for (const d of doms) {
    if (d.id === semDomId) {
      newSense.semanticDomains.push(d);
    } else {
      oldSense.semanticDomains.push(d);
    }
  }

  const senses = entry.word.senses.filter((s) => s.guid !== entry.senseGuid);
  // Check whether any other semantic domains are present.
  if (!oldSense.semanticDomains.length) {
    // If not, the word can simply be updated to the new sense.
    senses.push(newSense);
  } else {
    // Otherwise, the other semantic domains should be retained with the old sense.
    newSense.guid = v4();
    senses.push(oldSense, newSense);
  }
  return { ...entry.word, senses };
}

/*** A data entry table containing recent word entries. */
export default function DataEntryTable(
  props: DataEntryTableProps
): ReactElement {
  const [state, setState] = useState<DataEntryTableState>({
    // project properties to be set
    analysisLang: defaultWritingSystem,
    suggestVerns: true,
    vernacularLang: newWritingSystem("qaa", "Unknown"),
    // word data
    existingWords: [],
    recentWords: [],
    // state management
    defunctUpdates: {},
    defunctWordIds: {},
    isFetchingFrontier: false,
    isReady: false,
    senseSwitches: [],
  });

  const { enqueueSnackbar } = useSnackbar();
  const recorder = new Recorder();
  const refNewEntry = useRef<NewEntry>(null);
  const { t } = useTranslation();

  ////////////////////////////////////
  // State-updating functions
  // These are preferably non-async function that return void.
  ////////////////////////////////////

  /*** Apply language and autocomplete setting from the project.
   * Then trigger the initial fetch of frontier data.
   */
  const applyProjSettings = useCallback((proj: Project): void => {
    setState((prevState) => ({
      ...prevState,
      analysisLang: proj.analysisWritingSystems[0] ?? defaultWritingSystem,
      isFetchingFrontier: true,
      suggestVerns: proj.autocompleteSetting === AutocompleteSetting.On,
      vernacularLang: proj.vernacularWritingSystem,
    }));
  }, []);

  /*** Use this without newId before updating any word on the backend,
   * to make sure that word doesn't get edited by two different functions.
   * Use this with newId to specify the replacement of a defunct word.
   */
  const defunctWord = (oldId: string, newId?: string): void => {
    if (!newId && state.defunctWordIds[oldId]) {
      return;
    }
    if (!newId) {
      setState((prevState) => {
        const defunctWordIds = { ...prevState.defunctWordIds };
        defunctWordIds[oldId] = DefunctStatus.Recent;
        return { ...prevState, defunctWordIds };
      });
      return;
    }
    setState((prevState) => {
      const defunctUpdates = { ...prevState.defunctUpdates };
      const defunctWordIds = { ...prevState.defunctWordIds };
      defunctUpdates[oldId] = newId;
      defunctWordIds[oldId] = DefunctStatus.Recent;
      return { ...prevState, defunctUpdates, defunctWordIds };
    });
  };

  /*** Update whether the exit button is highlighted. */
  const setIsReady = (isReady: boolean): void => {
    if (isReady !== state.isReady) {
      setState((prevState) => ({ ...prevState, isReady }));
    }
  };

  /*** Update a recent entry to a different sense of the same word. */
  const switchSense = useCallback(
    (oldGuid: string, newGuid: string): void => {
      const entry = state.recentWords.find((w) => w.senseGuid === oldGuid);
      if (!entry || !entry.word.senses.find((s) => s.guid === newGuid)) {
        return;
      }
      setState((prevState) => {
        const recentWords = prevState.recentWords.map((w) =>
          w.senseGuid === oldGuid ? { ...w, senseGuid: newGuid } : w
        );
        const senseSwitches = prevState.senseSwitches.filter(
          (s) => s.oldGuid !== oldGuid
        );
        return { ...prevState, recentWords, senseSwitches };
      });
    },
    [state.recentWords]
  );

  /*** Add to recent entries every sense of the word with the current semantic domain. */
  const addAllSensesToDisplay = (word: Word): void => {
    const domId = props.semanticDomain.id;
    setState((prevState) => {
      const recentWords = [...prevState.recentWords];
      word.senses.forEach((s) => {
        if (s.semanticDomains.find((dom) => dom.id === domId)) {
          recentWords.push({ word, senseGuid: s.guid });
        }
      });
      return { ...prevState, recentWords };
    });
  };

  /*** Add one-sense word to the display of recent entries. */
  const addToDisplay = (wordAccess: WordAccess, insertIndex?: number): void => {
    setState((prevState) => {
      const recentWords = [...prevState.recentWords];
      if (insertIndex !== undefined && insertIndex < recentWords.length) {
        recentWords.splice(insertIndex, 0, wordAccess);
      } else {
        recentWords.push(wordAccess);
      }
      return { ...prevState, isFetchingFrontier: true, recentWords };
    });
  };

  /*** Remove recent entry from specified index. */
  const removeRecentEntry = (index: number): void => {
    setState((prevState) => {
      const recentWords = prevState.recentWords.filter((_w, i) => i !== index);
      return { ...prevState, recentWords };
    });
  };

  /*** Add a senseSwitch to the queue to be processed when possible. */
  const queueSenseSwitch = (oldGuid: string, newGuid: string): void => {
    if (!oldGuid || !newGuid) {
      return;
    }
    setState((prevState) => {
      const senseSwitches = [...prevState.senseSwitches, { newGuid, oldGuid }];
      return { ...prevState, senseSwitches };
    });
  };

  /*** Replace every displayed instance of a word. */
  const replaceInDisplay = (oldId: string, word: Word): void => {
    setState((prevState) => {
      const recentWords = prevState.recentWords.map((a) =>
        a.word.id === oldId ? { word, senseGuid: a.senseGuid } : a
      );
      return { ...prevState, isFetchingFrontier: true, recentWords };
    });
  };

  /*** Reset things specific to the current data entry session in the current semantic domain. */
  const resetEverything = (): void => {
    props.hideQuestions();
    setState((prevState) => ({
      ...prevState,
      defunctUpdates: {},
      defunctWordIds: {},
      senseSwitches: [],
      recentWords: [],
    }));
    if (refNewEntry.current) {
      refNewEntry.current.resetState();
    }
  };

  ////////////////////////////////////
  // useEffect functions to manage re-renders.
  // These cannot be async, so use asyncFunction().then(...) as needed.
  ////////////////////////////////////

  /*** Happens once on initial render to load in projectSettings. */
  useEffect(() => {
    backend.getProject().then(applyProjSettings);
  }, [applyProjSettings]);

  /*** Manages the senseSwitches queue. */
  useEffect(() => {
    if (!state.senseSwitches.length) {
      return;
    }
    const { oldGuid, newGuid } = state.senseSwitches[0];
    const oldEntry = state.recentWords.find((w) => w.senseGuid === oldGuid);
    if (!oldEntry) {
      return;
    }
    if (!oldEntry.word.senses.find((s) => s.guid === newGuid)) {
      return;
    }
    switchSense(oldGuid, newGuid);
  }, [switchSense, state.recentWords, state.senseSwitches]);

  /*** Manages fetching the frontier.
   * This is the ONLY place to update existingWords or switch isFetchingFrontier to false.
   */
  useEffect(() => {
    if (state.isFetchingFrontier) {
      backend.getFrontierWords().then((words) => {
        const existingWords = filterWords(words);
        setState((prevState) => {
          const defunctWordIds: Hash<DefunctStatus> = {};
          for (const id of Object.keys(prevState.defunctWordIds)) {
            // After a successful frontier fetch,
            // move Recent defunct ids to Retire,
            // and only keep Retire ids if they are still in the display.
            if (
              prevState.defunctWordIds[id] === DefunctStatus.Recent ||
              prevState.recentWords.find((w) => w.word.id === id)
            ) {
              defunctWordIds[id] = DefunctStatus.Retire;
            }
          }
          const defunctUpdates: Hash<string> = {};
          for (const id of Object.keys(prevState.defunctUpdates)) {
            // Only keep update mappings for ids that are still defunct.
            if (defunctWordIds[id]) {
              defunctUpdates[id] = prevState.defunctUpdates[id];
            }
          }
          return {
            ...prevState,
            isFetchingFrontier: false,
            existingWords,
            defunctUpdates,
            defunctWordIds,
          };
        });
      });
    }
  }, [state.isFetchingFrontier]);

  /*** Act on the defunctUpdates queue. */
  useEffect(() => {
    const ids = Object.keys(state.defunctUpdates);
    if (!ids.length) {
      return;
    }
    const oldId = ids.find((id) =>
      state.recentWords.find((w) => w.word.id === id)
    );
    if (oldId) {
      // Do an update if there's one to be done.
      let newId = oldId;
      while (state.defunctUpdates[newId]) {
        newId = state.defunctUpdates[newId];
      }
      backend.getWord(newId).then((w) => replaceInDisplay(oldId, w));
    } else {
      // When recent entries are up to date, update the list of all words
      setState((prevState) => {
        return { ...prevState, isFetchingFrontier: true };
      });
    } // eslint-disable-next-line
  }, [state.defunctUpdates]); // omitted: state.recentWords

  ////////////////////////////////////
  // Async functions that wrap around a backend update to a word.
  // Before the update, defunctWord(word.id).
  // After the update, defunctWord(updatedWord.id).
  ////////////////////////////////////

  /*** Given an array of audio file urls, add them all to specified word. */
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

  /*** Given a single audio file, add to specified word. */
  const addAudioFileToWord = async (
    oldId: string,
    audioFile: File
  ): Promise<void> => {
    defunctWord(oldId);
    const newId = await backend.uploadAudio(oldId, audioFile);
    defunctWord(oldId, newId);
  };

  /*** Add a word determined to be a duplicate.
   * Ensures the updated word has representation in the display.
   * Note: Only for use after backend.getDuplicateId().
   */
  const addDuplicateWord = async (
    word: Word,
    audioURLs: string[],
    oldId: string
  ): Promise<void> => {
    const isInDisplay =
      state.recentWords.findIndex((w) => w.word.id === oldId) > -1;

    defunctWord(oldId);
    const newWord = await backend.updateDuplicate(oldId, getUserId(), word);
    defunctWord(oldId, newWord.id);

    const newId = await addAudiosToBackend(newWord.id, audioURLs);

    if (!isInDisplay) {
      addAllSensesToDisplay(await backend.getWord(newId));
    }
  };

  /*** Deletes specified audio file from specified word. */
  const deleteAudioFromWord = async (
    oldId: string,
    fileName: string
  ): Promise<void> => {
    defunctWord(oldId);
    const newId = await backend.deleteAudio(oldId, fileName);
    defunctWord(oldId, newId);
  };

  /*** Updates word. */
  const updateWordInBackend = async (word: Word): Promise<Word> => {
    defunctWord(word.id);
    const newWord = await backend.updateWord(word);
    defunctWord(word.id, newWord.id);
    return newWord;
  };

  //////////////////////////
  // Other functions.
  /////////////////////////////////

  const addNewWord = async (
    wordToAdd: Word,
    audioURLs: string[],
    insertIndex?: number
    //ignoreRecent?: boolean,
  ): Promise<void> => {
    wordToAdd.note.language = state.analysisLang.bcp47;

    // Check if word is duplicate to existing word.
    const dupId = await backend.getDuplicateId(wordToAdd);
    if (dupId) {
      return await addDuplicateWord(wordToAdd, audioURLs, dupId);
    }

    let word = await backend.createWord(wordToAdd);
    const wordId = await addAudiosToBackend(word.id, audioURLs);
    // ToDo: Evaluate if the removed `ignoreRecent` functionality is still needed.
    /*if (ignoreRecent) {
      return;
    }*/
    if (wordId !== word.id) {
      word = await backend.getWord(wordId);
    }
    addToDisplay({ word, senseGuid: word.senses[0].guid }, insertIndex);
  };

  /*** Update the word in the backend and the frontend */
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

  /***  Checks if sense already exists with this gloss and semantic domain. */
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
      if (sense.glosses?.length && sense.glosses[0].def === gloss) {
        if (
          sense.semanticDomains.find((d) => d.id === props.semanticDomain.id)
        ) {
          // User is trying to add a sense that already exists
          enqueueSnackbar(
            `${t("addWords.senseInWord")}: ${existingWord.vernacular}, ${gloss}`
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
    defunctWord(existingWord.id);
    const semDom = makeSemDomCurrent(props.semanticDomain);
    const sense = newSense(gloss, state.analysisLang.bcp47, semDom);
    const senses = [...existingWord.senses, sense];
    const newWord: Word = { ...existingWord, senses };

    await updateWordBackAndFront(newWord, sense.guid, audioFileURLs);
    return;
  };

  const undoRecentEntry = async (eIndex: number): Promise<void> => {
    const { word, senseGuid } = state.recentWords[eIndex];
    const sIndex = word.senses.findIndex((s) => s.guid === senseGuid);
    if (sIndex === -1) {
      throw new Error("Entry does not have specified sense.");
    }
    defunctWord(word.id);
    removeRecentEntry(eIndex);
    const senses = [...word.senses];
    const oldSense = senses[sIndex];
    const oldDoms = oldSense.semanticDomains;
    if (oldDoms.length > 1) {
      // If there is more than one semantic domain in this sense, only remove the domain.
      const doms = oldDoms.filter((d) => d.id !== props.semanticDomain.id);
      const newSense: Sense = { ...oldSense, semanticDomains: doms };
      senses.splice(sIndex, 1, newSense);
      await updateWordInBackend({ ...word, senses });
    } else if (senses.length > 1) {
      // If there is more than one sense in this word, only remove this sense.
      senses.splice(sIndex, 1);
      await updateWordInBackend({ ...word, senses });
    } else {
      // Since this is the only sense, delete the word.
      await backend.deleteFrontierWord(word.id);
    }
  };

  const updateRecentVern = async (
    index: number,
    vernacular: string,
    targetWordId?: string
  ): Promise<void> => {
    if (targetWordId !== undefined) {
      throw new Error("VernDialog on RecentEntry is not yet supported.");
    }
    const oldEntry = state.recentWords[index];
    const oldSenses = oldEntry.word.senses;
    const oldSense = oldSenses.find((s) => s.guid === oldEntry.senseGuid);
    if (!oldSense) {
      throw new Error("Entry does not have specified sense.");
    }

    if (oldSenses.length === 1 && oldSense.semanticDomains.length === 1) {
      // The word can simply be updated as it stand
      await updateWordInBackend({ ...oldEntry.word, vernacular });
    } else {
      // Retract and replaced with a new entry.
      const word = simpleWord(vernacular, firstGlossText(oldSense));
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
    defunctWord(oldEntry.word.id);
    const newWord = updateEntryGloss(oldEntry, def, props.semanticDomain.id);
    await updateWordInBackend(newWord);

    // If a sense with a new guid was added, it needs to replace the old sense in the display.
    if (newWord.senses.length > oldEntry.word.senses.length) {
      const newSense = newWord.senses.find(
        (sense) => !oldEntry.word.senses.find((s) => s.guid === sense.guid)
      );
      if (newSense) {
        queueSenseSwitch(oldEntry.senseGuid, newSense.guid);
      }
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

  /*** Reset the entry table. If there is an un-submitted word then submit it. */
  const handleExit = async (): Promise<void> => {
    // Check if there is a new word, but user exited without pressing enter
    if (refNewEntry.current) {
      const newEntry = refNewEntry.current.state.newEntry;
      if (newEntry?.vernacular) {
        const existingWord = state.existingWords.find(
          (w) => w.vernacular === newEntry.vernacular
        );
        // existing word not found, create a new word
        if (!existingWord) {
          if (!newEntry.senses.length) {
            newEntry.senses.push(
              newSense(undefined, undefined, props.semanticDomain)
            );
          }
          const newEntryAudio = refNewEntry.current.state.audioFileURLs;
          await addNewWord(newEntry, newEntryAudio);
        } else {
          // found an existing word, update it
          await updateWordWithNewGloss(
            existingWord.id,
            newEntry.senses[0].glosses[0].def,
            refNewEntry.current.state.audioFileURLs
          );
        }
      }
    }
    resetEverything();
  };

  return (
    <form
      onSubmit={(e?: React.FormEvent<HTMLFormElement>) => e?.preventDefault()}
    >
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
                addAudioFileToWord(wordId, audioFile)
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
            setIsReadyState={(isReady: boolean) => setIsReady(isReady)}
            recorder={recorder}
            analysisLang={state.analysisLang}
            vernacularLang={state.vernacularLang}
          />
        </Grid>
      </Grid>

      <Grid container justifyContent="space-between" spacing={3}>
        <Grid item>
          {props.hasDrawerButton ? (
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
