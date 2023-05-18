import { ExitToApp, List as ListIcon } from "@mui/icons-material";
import { Button, Grid, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import {
  FormEvent,
  Fragment,
  ReactElement,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
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
} from "api/models";
import * as backend from "backend";
import { getUserId } from "backend/localStorage";
import NewEntry from "components/DataEntry/DataEntryTable/NewEntry/NewEntry";
import RecentEntry from "components/DataEntry/DataEntryTable/RecentEntry/RecentEntry";
import { getFileNameForWord } from "components/Pronunciations/AudioRecorder";
import Recorder from "components/Pronunciations/Recorder";
import { StoreState } from "types";
import { Hash } from "types/hash";
import { useAppSelector } from "types/hooks";
import theme from "types/theme";
import { newNote, newSense, newWord, simpleWord } from "types/word";
import { defaultWritingSystem } from "types/writingSystem";
import { LevenshteinDistance } from "utilities";
import { firstGlossText } from "utilities/wordUtilities";

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

/*** Focus on a specified object. */
export function focusInput(ref: RefObject<HTMLDivElement>): void {
  if (ref.current) {
    ref.current.focus();
    ref.current.scrollIntoView({ behavior: "smooth" });
  }
}

/*** Find suggestions for given text from a list of strings. */
const getSuggestions = (
  text: string,
  all: string[],
  dist: (a: string, b: string) => number
): string[] => {
  if (!text || !all.length) {
    return [];
  }
  const maxSuggestions = 5;
  const maxDistance = 3;

  const some = all
    .filter((s) => s.startsWith(text))
    .sort((a, b) => a.length - b.length);
  // Take 2 shortest and the rest longest (should make finding the long words easier).
  if (some.length > maxSuggestions) {
    some.splice(2, some.length - maxSuggestions);
  }

  if (some.length < maxSuggestions) {
    const viable = all
      .filter((s) => dist(s, text) < maxDistance && !some.includes(s))
      .sort((a, b) => dist(a, text) - dist(b, text));
    while (some.length < maxSuggestions && viable.length) {
      some.push(viable.shift()!);
    }
  }
  return some;
};

/*** Return a copy of the semantic domain with current UserId and timestamp. */
export function makeSemDomCurrent(semDom: SemanticDomain): SemanticDomain {
  const created = new Date().toISOString();
  return { ...semDom, created, userId: getUserId() };
}

/*** Given a WordAccess and a new gloss, returns a copy of the word
 * with the gloss of the specified sense changed to the new gloss.
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

interface DataEntryTableState {
  // word data
  allVerns: string[];
  allWords: Word[];
  recentWords: WordAccess[];
  // state management
  defunctUpdates: Hash<string>;
  defunctWordIds: Hash<DefunctStatus>;
  isFetchingFrontier: boolean;
  senseSwitches: SenseSwitch[];
  // new entry state
  newAudioUrls: string[];
  newGloss: string;
  newNote: string;
  newVern: string;
  selectedDup?: Word;
  suggestedVerns: string[];
  suggestedDups: Word[];
}

/*** A data entry table containing recent word entries. */
export default function DataEntryTable(
  props: DataEntryTableProps
): ReactElement {
  const { analysisLang, suggestVerns, vernacularLang } = useAppSelector(
    (state: StoreState) => {
      const proj = state.currentProjectState.project;
      return {
        analysisLang: proj.analysisWritingSystems[0] ?? defaultWritingSystem,
        suggestVerns: proj.autocompleteSetting === AutocompleteSetting.On,
        vernacularLang: proj.vernacularWritingSystem,
      };
    }
  );

  const [state, setState] = useState<DataEntryTableState>({
    // word data
    allVerns: [],
    allWords: [],
    recentWords: [],
    // state management
    defunctUpdates: {},
    defunctWordIds: {},
    isFetchingFrontier: true,
    senseSwitches: [],
    // new entry state
    newAudioUrls: [],
    newGloss: "",
    newNote: "",
    newVern: "",
    suggestedVerns: [],
    suggestedDups: [],
  });

  const { enqueueSnackbar } = useSnackbar();
  const levDist = useMemo(() => new LevenshteinDistance(), []);
  const newVernInput = useRef<HTMLDivElement>(null);
  const recorder = useMemo(() => new Recorder(), []);
  const { t } = useTranslation();

  ////////////////////////////////////
  // State-updating functions
  // These are preferably non-async function that return void.
  ////////////////////////////////////

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

  /*** Add an audio file to newAudioUrls. */
  const addNewAudioUrl = (file: File): void => {
    setState((prevState) => {
      const newAudioUrls = [...prevState.newAudioUrls];
      newAudioUrls.push(URL.createObjectURL(file));
      return { ...prevState, newAudioUrls };
    });
  };

  /*** Delete a url from newAudioUrls. */
  const delNewAudioUrl = (url: string): void => {
    setState((prevState) => {
      const newAudioUrls = prevState.newAudioUrls.filter((u) => u !== url);
      return { ...prevState, newAudioUrls };
    });
  };

  /*** Set the new entry gloss def. */
  const setNewGloss = (gloss: string): void => {
    if (gloss !== state.newGloss) {
      setState((prev) => ({ ...prev, newGloss: gloss }));
    }
  };

  /*** Set the new entry note text. */
  const setNewNote = (note: string): void => {
    if (note !== state.newNote) {
      setState((prev) => ({ ...prev, newNote: note }));
    }
  };

  /*** Set the new entry vernacular. */
  const setNewVern = (vern: string): void => {
    if (vern !== state.newVern) {
      setState((prev) => ({ ...prev, newVern: vern }));
    }
  };

  /*** Set or clear the selected vern-duplicate word. */
  const setSelectedDup = (id?: string): void => {
    setState((prev) => ({
      ...prev,
      selectedDup: id
        ? prev.suggestedDups.find((w) => w.id === id)
        : id === ""
        ? newWord(prev.newVern)
        : undefined,
    }));
  };

  /*** Reset things specific to the current data entry session in the current semantic domain. */
  const resetEverything = (): void => {
    props.openTree();
    props.hideQuestions();
    setState((prevState) => ({
      ...prevState,
      defunctUpdates: {},
      defunctWordIds: {},
      recentWords: [],
      senseSwitches: [],
      // new entry state:
      newAudioUrls: [],
      newGloss: "",
      newNote: "",
      newVern: "",
      selectedDup: undefined,
      suggestedDups: [],
      suggestedVerns: [],
    }));
  };

  ////////////////////////////////////
  // useEffect functions to manage re-renders.
  // These cannot be async, so use asyncFunction().then(...) as needed.
  ////////////////////////////////////

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
   * This is the ONLY place to update allWords and allVerns
   * or to switch isFetchingFrontier to false. */
  useEffect(() => {
    if (state.isFetchingFrontier) {
      backend.getFrontierWords().then((words) => {
        const allWords = filterWords(words);
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
            allWords,
            defunctUpdates,
            defunctWordIds,
          };
        });
      });
    }
  }, [state.isFetchingFrontier]);

  /*** If vern-autocomplete is on for the project, make list of all vernaculars. */
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      allVerns: suggestVerns
        ? [...new Set(prev.allWords.map((w) => w.vernacular))]
        : [],
    }));
  }, [state.allWords, suggestVerns]);

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
      setState((prevState) => ({ ...prevState, isFetchingFrontier: true }));
    }
  }, [state.defunctUpdates, state.recentWords]);

  /*** Update vern suggestions. */
  useEffect(() => {
    setState((prev) => {
      const trimmed = prev.newVern.trim();
      return {
        ...prev,
        selectedDup: undefined,
        suggestedDups: trimmed
          ? prev.allWords.filter(
              (w) =>
                w.vernacular.trim() === trimmed &&
                !Object.keys(prev.defunctWordIds).includes(w.id)
            )
          : [],
        suggestedVerns: getSuggestions(
          prev.newVern,
          prev.allVerns,
          (a: string, b: string) => levDist.getDistance(a, b)
        ),
      };
    });
  }, [levDist, state.newVern]);

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

  /////////////////////////////////
  // General async functions.
  /////////////////////////////////

  /*** Add a new word to the project, or update if new word is a duplicate. */
  const addNewWord = async (
    wordToAdd: Word,
    audioURLs: string[],
    insertIndex?: number
  ): Promise<void> => {
    wordToAdd.note.language = analysisLang.bcp47;

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
    addToDisplay({ word, senseGuid: word.senses[0].guid }, insertIndex);
  };

  /*** Update the word in the backend and the frontend. */
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

  /*** Reset the entry table. If there is an un-submitted word then submit it. */
  const handleExit = async (): Promise<void> => {
    // Check if there is a new word, but user exited without pressing enter.
    if (state.newVern) {
      const oldWord = state.allWords.find(
        (w) => w.vernacular === state.newVern
      );
      if (!oldWord) {
        // Existing word not found, so create a new word.
        addNewEntry();
      } else {
        // Found an existing word, so add a sense to it.
        await updateWordWithNewEntry(oldWord.id);
      }
    }
    resetEverything();
  };

  /////////////////////////////////
  // Async functions for handling changes of the NewEntry.
  /////////////////////////////////

  /*** Assemble a word from the new entry state and add it. */
  const addNewEntry = async (): Promise<void> => {
    const word = newWord(state.newVern);
    const lang = analysisLang.bcp47;
    word.senses.push(newSense(state.newGloss, lang, props.semanticDomain));
    word.note = newNote(state.newNote, lang);
    await addNewWord(word, state.newAudioUrls);
  };

  /***  Checks if sense already exists with this gloss and semantic domain. */
  const updateWordWithNewEntry = async (wordId: string): Promise<void> => {
    const oldWord = state.allWords.find((w: Word) => w.id === wordId);
    if (!oldWord) {
      throw new Error("You are trying to update a nonexistent word");
    }
    const semDom = makeSemDomCurrent(props.semanticDomain);

    // If this gloss matches a sense on the word, update that sense.
    for (const sense of oldWord.senses) {
      if (sense.glosses?.length && sense.glosses[0].def === state.newGloss) {
        if (sense.semanticDomains.find((d) => d.id === semDom.id)) {
          // User is trying to add a sense that already exists
          enqueueSnackbar(
            t("addWords.senseInWord", {
              val1: oldWord.vernacular,
              val2: state.newGloss,
            })
          );
          if (state.newAudioUrls.length) {
            await addAudiosToBackend(wordId, state.newAudioUrls);
          }
          return;
        } else {
          await updateWordBackAndFront(
            addSemanticDomainToSense(semDom, oldWord, sense.guid),
            sense.guid,
            state.newAudioUrls
          );
          return;
        }
      }
    }

    // The gloss is new for this word, so add a new sense.
    defunctWord(oldWord.id);
    const sense = newSense(state.newGloss, analysisLang.bcp47, semDom);
    const senses = [...oldWord.senses, sense];
    const newWord: Word = { ...oldWord, senses };

    await updateWordBackAndFront(newWord, sense.guid, state.newAudioUrls);
    return;
  };

  /////////////////////////////////
  // Async functions for handling changes of a RecentEntry.
  /////////////////////////////////

  /*** Retract a recent entry. */
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

  /*** Update the vernacular in a recent entry. */
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

  /*** Update the gloss def in a recent entry. */
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

  /*** Update the note text in a recent entry. */
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

  return (
    <form onSubmit={(e?: FormEvent<HTMLFormElement>) => e?.preventDefault()}>
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
              focusNewEntry={() => focusInput(newVernInput)}
              analysisLang={analysisLang}
              vernacularLang={vernacularLang}
              disabled={Object.keys(state.defunctWordIds).includes(
                wordAccess.word.id
              )}
            />
          </Grid>
        ))}

        <Grid item xs={12}>
          <NewEntry
            recorder={recorder}
            analysisLang={analysisLang}
            vernacularLang={vernacularLang}
            // Parent handles new entry state of child:
            addNewEntry={addNewEntry}
            updateWordWithNewGloss={updateWordWithNewEntry}
            newAudioUrls={state.newAudioUrls}
            addNewAudioUrl={addNewAudioUrl}
            delNewAudioUrl={delNewAudioUrl}
            newGloss={state.newGloss}
            setNewGloss={setNewGloss}
            newNote={state.newNote}
            setNewNote={setNewNote}
            newVern={state.newVern}
            setNewVern={setNewVern}
            vernInput={newVernInput}
            // Parent handles vern suggestion state of child:
            selectedDup={state.selectedDup}
            setSelectedDup={setSelectedDup}
            suggestedDups={state.suggestedDups}
            suggestedVerns={state.suggestedVerns}
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
          ) : (
            <Fragment />
          )}
        </Grid>
        <Grid item>
          <Button
            id={exitButtonId}
            type="submit"
            variant="contained"
            color={state.newVern.trim() ? "primary" : "secondary"}
            style={{ marginTop: theme.spacing(2) }}
            endIcon={<ExitToApp />}
            tabIndex={-1}
            onClick={handleExit}
          >
            {t("buttons.exit")}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
