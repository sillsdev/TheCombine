import { Project } from "api/models";
import { getFrontierWords } from "backend";
import router from "browserRouter";
import {
  addCharInvChangesToGoal,
  asyncUpdateGoal,
} from "components/GoalTimeline/Redux/GoalActions";
import { asyncUpdateCurrentProject } from "components/Project/ProjectActions";
import {
  CharacterStatus,
  CharacterChange,
} from "goals/CharacterInventory/CharacterInventoryTypes";
import {
  CharacterInventoryState,
  CharacterSetEntry,
  CharacterInventoryAction,
  CharacterInventoryType,
  getCharacterStatus,
} from "goals/CharacterInventory/Redux/CharacterInventoryReduxTypes";
import { StoreState } from "types";
import { StoreStateDispatch } from "types/Redux/actions";
import { Path } from "types/path";

// Action Creators

export function addToValidCharacters(
  chars: string[]
): CharacterInventoryAction {
  return {
    type: CharacterInventoryType.ADD_TO_VALID_CHARACTERS,
    payload: chars,
  };
}

export function addToRejectedCharacters(
  chars: string[]
): CharacterInventoryAction {
  return {
    type: CharacterInventoryType.ADD_TO_REJECTED_CHARACTERS,
    payload: chars,
  };
}

export function setValidCharacters(chars: string[]): CharacterInventoryAction {
  return {
    type: CharacterInventoryType.SET_VALID_CHARACTERS,
    payload: chars,
  };
}

export function setRejectedCharacters(
  chars: string[]
): CharacterInventoryAction {
  return {
    type: CharacterInventoryType.SET_REJECTED_CHARACTERS,
    payload: chars,
  };
}

export function setAllWords(words: string[]): CharacterInventoryAction {
  return {
    type: CharacterInventoryType.SET_ALL_WORDS,
    payload: words,
  };
}

export function setSelectedCharacter(
  character: string
): CharacterInventoryAction {
  return {
    type: CharacterInventoryType.SET_SELECTED_CHARACTER,
    payload: [character],
  };
}

export function setCharacterSet(
  characterSet: CharacterSetEntry[]
): CharacterInventoryAction {
  return {
    type: CharacterInventoryType.SET_CHARACTER_SET,
    payload: [],
    characterSet,
  };
}

export function resetInState(): CharacterInventoryAction {
  return {
    type: CharacterInventoryType.RESET,
    payload: [],
  };
}

// Dispatch Functions

export function setCharacterStatus(character: string, status: CharacterStatus) {
  return (dispatch: StoreStateDispatch, getState: () => StoreState) => {
    switch (status) {
      case CharacterStatus.Accepted:
        dispatch(addToValidCharacters([character]));
        break;
      case CharacterStatus.Rejected:
        dispatch(addToRejectedCharacters([character]));
        break;
      case CharacterStatus.Undecided:
        const state = getState().characterInventoryState;
        const valid = state.validCharacters.filter(
          (c: string) => c !== character
        );
        if (valid.length < state.validCharacters.length) {
          dispatch(setValidCharacters(valid));
        }
        const rejected = state.rejectedCharacters.filter(
          (c: string) => c !== character
        );
        if (rejected.length < state.rejectedCharacters.length) {
          dispatch(setRejectedCharacters(rejected));
        }
        break;
    }
  };
}

// Sends the character inventory to the server.
export function uploadInventory() {
  return async (dispatch: StoreStateDispatch, getState: () => StoreState) => {
    const state = getState();
    const changes = getChangesFromState(state);
    if (!changes.length) {
      exit();
      return;
    }
    const updatedProject = updateCurrentProject(state);
    await dispatch(asyncUpdateCurrentProject(updatedProject));
    dispatch(addCharInvChangesToGoal(changes));
    await dispatch(asyncUpdateGoal());
    exit();
  };
}

export function fetchWords() {
  return async (dispatch: StoreStateDispatch) => {
    const words = await getFrontierWords();
    dispatch(setAllWords(words.map((word) => word.vernacular)));
  };
}

export function getAllCharacters() {
  return async (dispatch: StoreStateDispatch, getState: () => StoreState) => {
    const state = getState();
    const words = await getFrontierWords();
    const charactersWithDuplicates: string[] = [];
    words.forEach((word) => charactersWithDuplicates.push(...word.vernacular));
    const characters = [...new Set(charactersWithDuplicates)];

    const characterSet: CharacterSetEntry[] = [];
    characters.forEach((letter) => {
      characterSet.push({
        character: letter,
        occurrences: countCharacterOccurrences(
          letter,
          words.map((word) => word.vernacular)
        ),
        status: getCharacterStatus(
          letter,
          state.currentProjectState.project.validCharacters,
          state.currentProjectState.project.rejectedCharacters
        ),
      });
    });
    dispatch(setCharacterSet(characterSet));
  };
}

export function loadCharInvData() {
  return async (dispatch: StoreStateDispatch, getState: () => StoreState) => {
    const project = getState().currentProjectState.project;
    await dispatch(fetchWords());
    dispatch(setValidCharacters(project.validCharacters));
    dispatch(setRejectedCharacters(project.rejectedCharacters));
    await dispatch(getAllCharacters());
    dispatch(setSelectedCharacter(""));
  };
}

// Helper Functions

export function exit() {
  router.navigate(Path.Goals);
}

function countCharacterOccurrences(char: string, words: string[]) {
  let count = 0;
  for (const word of words) {
    for (const letter of word) {
      if (letter === char) {
        count++;
      }
    }
  }
  return count;
}

function getChangesFromState(state: StoreState): CharacterChange[] {
  const proj = state.currentProjectState.project;
  const charInvState = state.characterInventoryState;
  return getChanges(proj, charInvState);
}

export function getChanges(
  proj: Project,
  charInvState: CharacterInventoryState
): CharacterChange[] {
  const oldAcc = proj.validCharacters;
  const newAcc = charInvState.validCharacters;
  const oldRej = proj.rejectedCharacters;
  const newRej = charInvState.rejectedCharacters;
  const allCharacters = [
    ...new Set([...oldAcc, ...newAcc, ...oldRej, ...newRej]),
  ];
  const changes: CharacterChange[] = [];
  allCharacters.forEach((char) => {
    const change = getChange(char, oldAcc, newAcc, oldRej, newRej);
    if (change) {
      changes.push(change);
    }
  });
  return changes;
}

// Returns undefined if CharacterStatus unchanged.
function getChange(
  c: string,
  oldAcc: string[],
  newAcc: string[],
  oldRej: string[],
  newRej: string[]
): CharacterChange | undefined {
  if (oldAcc.includes(c)) {
    if (!newAcc.includes(c)) {
      if (newRej.includes(c)) {
        return [c, CharacterStatus.Accepted, CharacterStatus.Rejected];
      }
      return [c, CharacterStatus.Accepted, CharacterStatus.Undecided];
    }
    return;
  }
  if (oldRej.includes(c)) {
    if (!newRej.includes(c)) {
      if (newAcc.includes(c)) {
        return [c, CharacterStatus.Rejected, CharacterStatus.Accepted];
      }
      return [c, CharacterStatus.Rejected, CharacterStatus.Undecided];
    }
    return;
  }
  if (newAcc.includes(c)) {
    return [c, CharacterStatus.Undecided, CharacterStatus.Accepted];
  }
  if (newRej.includes(c)) {
    return [c, CharacterStatus.Undecided, CharacterStatus.Rejected];
  }
  return undefined;
}

function updateCurrentProject(state: StoreState): Project {
  const project = state.currentProjectState.project;
  project.validCharacters = state.characterInventoryState.validCharacters;
  project.rejectedCharacters = state.characterInventoryState.rejectedCharacters;
  return project;
}
