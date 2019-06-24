import { Dispatch } from "react";
import { StoreState } from "../../types";
import {
  setCurrentProject,
  ProjectAction
} from "../../components/Project/ProjectActions";
import { updateProject } from "../../backend";

export const SET_CHARACTER_INVENTORY = "SET_CHARACTER_INVENTORY";
export type SET_CHARACTER_INVENTORY = typeof SET_CHARACTER_INVENTORY;

export interface CharacterInventoryData {}

type CharacterInventoryType = SET_CHARACTER_INVENTORY;

//action types

export interface CharacterInventoryAction {
  type: CharacterInventoryType;
  payload: string[];
}

/**
 * Sends the character inventory to the server
 */
export function uploadInventory() {
  return async (
    dispatch: Dispatch<CharacterInventoryAction | ProjectAction>,
    getState: () => StoreState
  ) => {
    let project = getState().currentProject;
    let inv = getState().characterInventoryState.inventory;
    project.characterSet = inv;

    updateProject(project);

    dispatch(setCurrentProject(project));
    //alert("Uploading inventory");
  };
}

export function setInventory(inventory: string[]): CharacterInventoryAction {
  return {
    type: SET_CHARACTER_INVENTORY,
    payload: inventory
  };
}
