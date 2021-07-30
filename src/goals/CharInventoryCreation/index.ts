import { connect } from "react-redux";

import CharacterInventory from "goals/CharInventoryCreation/CharacterInventoryComponent";
import * as Actions from "goals/CharInventoryCreation/Redux/CharacterInventoryActions";
import { StoreState } from "types";
import { Goal } from "types/goals";
import { StoreStateDispatch } from "types/Redux/actions";

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
    uploadInventory: (goal: Goal) => dispatch(Actions.uploadInventory(goal)),
    fetchWords: () => dispatch(Actions.fetchWords()),
    getAllCharacters: () => dispatch(Actions.getAllCharacters()),
    resetInState: () => dispatch(Actions.resetInState()),
    exit: Actions.exit,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CharacterInventory);
