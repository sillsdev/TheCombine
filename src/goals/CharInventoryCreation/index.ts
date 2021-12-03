import { connect } from "react-redux";

import CharacterInventory from "goals/CharInventoryCreation/CharacterInventoryComponent";
import * as Actions from "goals/CharInventoryCreation/Redux/CharacterInventoryActions";
import { StoreState } from "types";
import { StoreStateDispatch } from "types/Redux/actions";
import { Goal } from "types/goals";

function mapStateToProps(state: StoreState) {
  return {
    currentProject: state.currentProjectState.project,
    selectedCharacter: state.characterInventoryState.selectedCharacter,
    allCharacters: state.characterInventoryState.characterSet,
    goal: state.goalsState.currentGoal,
  };
}

function mapDispatchToProps(dispatch: StoreStateDispatch) {
  return {
    setValidCharacters: (inventory: string[]) =>
      dispatch(Actions.setValidCharacters(inventory)),
    setRejectedCharacters: (inventory: string[]) =>
      dispatch(Actions.setRejectedCharacters(inventory)),
    setSelectedCharacter: (character: string) =>
      dispatch(Actions.setSelectedCharacter(character)),
    uploadInventory: async (goal: Goal) =>
      await dispatch(Actions.uploadInventory(goal)),
    fetchWords: async () => await dispatch(Actions.fetchWords()),
    getAllCharacters: async () => await dispatch(Actions.getAllCharacters()),
    resetInState: () => dispatch(Actions.resetInState()),
    exit: Actions.exit,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CharacterInventory);
