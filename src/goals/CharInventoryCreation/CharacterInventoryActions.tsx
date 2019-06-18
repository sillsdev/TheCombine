import { Dispatch } from "react";
import axios from "axios";
import { authHeader } from "../../components/Login/AuthHeaders";

export const SET_CHARACTER_INVENTORY = "SET_CHARACTER_INVENTORY";
export type SET_CHARACTER_INVENTORY = typeof SET_CHARACTER_INVENTORY;

export interface CharacterInventoryData {}

type CharacterInventoryType = SET_CHARACTER_INVENTORY;

//action types

export interface CharacterInventoryAction {
  type: CharacterInventoryType;
  inventory: string[];
}

// sends the character inventory to the server
export function uploadInventory() {
  alert("Uploading inventory");
}

export function setInventory(inventory: string[]): CharacterInventoryAction {
  return {
    type: SET_CHARACTER_INVENTORY,
    inventory
  };
}
