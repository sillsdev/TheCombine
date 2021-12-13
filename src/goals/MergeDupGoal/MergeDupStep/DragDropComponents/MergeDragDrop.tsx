import { Drawer, ImageListItem, Tooltip } from "@material-ui/core";
import { Delete } from "@material-ui/icons";
import { useState } from "react";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import { Translate } from "react-localize-redux";
import { useDispatch, useSelector } from "react-redux";
import { v4 } from "uuid";

import CancelConfirmDialog from "components/Buttons/CancelConfirmDialog";
import DropWord from "goals/MergeDupGoal/MergeDupStep/DragDropComponents/DropWord";
import SidebarDrop from "goals/MergeDupGoal/MergeDupStep/DragDropComponents/SidebarDrop";
import { MergeTreeReference } from "goals/MergeDupGoal/MergeDupStep/MergeDupsTree";
import {
  combineSense,
  deleteSense,
  moveSense,
  orderSense,
} from "goals/MergeDupGoal/Redux/MergeDupActions";
import { StoreState } from "types";
import theme from "types/theme";

export const trashId = "trash-drop";

export default function MergeDragDrop() {
  const dispatch = useDispatch();
  const mergeState = useSelector(
    (state: StoreState) => state.mergeDuplicateGoal
  );
  const [senseToDelete, setSenseToDelete] = useState<string>("");
  const sidebar = mergeState.tree.sidebar;
  const treeWords = mergeState.tree.words;

  function handleDrop(res: DropResult) {
    const senseRef: MergeTreeReference = JSON.parse(res.draggableId);
    if (res.destination?.droppableId === trashId) {
      // Case 1: the sense was dropped on the trash icon.
      setSenseToDelete(res.draggableId);
    } else if (res.combine) {
      // Case 2: the sense was dropped on another sense.
      const combineRef: MergeTreeReference = JSON.parse(
        res.combine.draggableId
      );
      if (combineRef.order !== undefined) {
        // If the target is a sidebar sub-sense, it cannot receive a combine.
        return;
      }
      dispatch(combineSense(senseRef, combineRef));
    } else if (res.destination) {
      // Case 3: The sense was dropped in a droppable.
      if (res.source.droppableId !== res.destination.droppableId) {
        // Case 3a: The source, dest droppables are different.
        const wordId = res.destination.droppableId;
        if (wordId.split(" ").length > 1) {
          // If the destination is SidebarDrop, it cannot receive drags from elsewhere.
          return;
        }
        // Move the sense to the dest MergeWord.
        dispatch(moveSense(senseRef, wordId, res.destination.index));
      } else {
        // Case 3b: The source, dest droppables are the same, so we reorder, not move.
        const order = res.destination.index;
        if (senseRef.order === order) {
          return;
        }
        dispatch(orderSense(senseRef, order));
      }
    }
  }

  function performDelete() {
    dispatch(deleteSense(JSON.parse(senseToDelete)));
    setSenseToDelete("");
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
      <ImageListItem key={"trash"} style={{ marginTop: "70vh" }}>
        <Droppable key={trashId} droppableId={trashId}>
          {(provided) => (
            <div ref={provided.innerRef}>
              <Tooltip
                title={<Translate id="mergeDups.helpText.delete" />}
                placement="top"
              >
                <Delete fontSize="large" />
              </Tooltip>
              <div style={{ position: "absolute" }}>{provided.placeholder}</div>
            </div>
          )}
        </Droppable>
      </ImageListItem>
      {Object.keys(treeWords).map((key) => (
        <ImageListItem
          key={key}
          style={{ height: "70vh", margin: theme.spacing(1) }}
        >
          <DropWord mergeState={mergeState} wordId={key} />
        </ImageListItem>
      ))}
      <ImageListItem key={newId} style={{ margin: theme.spacing(1) }}>
        <DropWord mergeState={mergeState} wordId={newId} />
      </ImageListItem>
      {renderSidebar()}
      <CancelConfirmDialog
        open={!!senseToDelete}
        textId="mergeDups.helpText.deleteDialog"
        handleCancel={() => setSenseToDelete("")}
        handleConfirm={performDelete}
      />
    </DragDropContext>
  );
}
