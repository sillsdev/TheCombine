import { Drawer, GridListTile } from "@material-ui/core";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { useDispatch, useSelector } from "react-redux";
import { v4 } from "uuid";

import DropWord from "goals/MergeDupGoal/MergeDupStep/DragDropComponents/DropWord";
import SidebarDrop from "goals/MergeDupGoal/MergeDupStep/DragDropComponents/SidebarDrop";
import {
  combineSense,
  moveSense,
  orderSense,
} from "goals/MergeDupGoal/MergeDupStep/MergeDupStepActions";
import { MergeTreeReference } from "goals/MergeDupGoal/MergeDupStep/MergeDupsTree";
import { StoreState } from "types";
import theme from "types/theme";

interface MergeDragDropProps {
  portrait: boolean;
}

export default function MergeDragDrop(props: MergeDragDropProps) {
  const dispatch = useDispatch();
  const mergeState = useSelector(
    (state: StoreState) => state.mergeDuplicateGoal
  );
  const sidebar = mergeState.tree.sidebar;
  const treeWords = mergeState.tree.words;

  function handleDrop(res: DropResult) {
    const senseRef: MergeTreeReference = JSON.parse(res.draggableId);
    if (res.combine) {
      // Case 1: the sense was dropped on another sense.
      const combineRef: MergeTreeReference = JSON.parse(
        res.combine.draggableId
      );
      if (combineRef.order !== undefined) {
        // If the target is a sidebar sub-sense, it cannot receive a combine.
        return;
      }
      dispatch(combineSense(senseRef, combineRef));
    } else if (res.destination) {
      // Case 2: The sense was dropped in a droppable.
      if (res.source.droppableId !== res.destination.droppableId) {
        // Case 2a: The source, dest droppables are different.
        const wordId = res.destination.droppableId;
        if (wordId.split(" ").length > 1) {
          // If the destination is SidebarDrop, it cannot receive drags from elsewhere.
          return;
        }
        // Move the sense to the dest MergeWord.
        dispatch(moveSense(senseRef, wordId, res.destination.index));
      } else {
        // Case 2b: The source, dest droppables are the same, so we reorder, not move.
        const order = res.destination.index;
        if (senseRef.order === order) {
          return;
        }
        dispatch(orderSense(senseRef, order));
      }
    }
  }

  function renderSidebar() {
    if (sidebar.senses.length <= 1) return <div />;
    return (
      <Drawer
        anchor="right"
        variant="persistent"
        open={sidebar.senses.length > 1}
      >
        <SidebarDrop
          sidebar={sidebar}
          vernacular={treeWords[sidebar.wordId]?.vern}
        />
      </Drawer>
    );
  }

  const newId = v4();

  return (
    <DragDropContext onDragEnd={handleDrop}>
      {Object.keys(treeWords).map((key) => (
        <GridListTile
          key={key}
          style={{ height: "70vh", margin: theme.spacing(1) }}
        >
          <DropWord
            mergeState={mergeState}
            portrait={props.portrait}
            wordId={key}
          />
        </GridListTile>
      ))}
      <GridListTile key={newId} style={{ margin: theme.spacing(1) }}>
        <DropWord
          mergeState={mergeState}
          portrait={props.portrait}
          wordId={newId}
        />
      </GridListTile>
      {renderSidebar()}
    </DragDropContext>
  );
}
