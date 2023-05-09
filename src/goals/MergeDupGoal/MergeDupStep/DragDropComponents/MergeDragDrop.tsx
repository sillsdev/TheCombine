import { Delete } from "@mui/icons-material";
import { Drawer, ImageList, ImageListItem, Tooltip } from "@mui/material";
import { ReactElement, useState } from "react";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import { useTranslation } from "react-i18next";
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
import { useAppDispatch, useAppSelector } from "types/hooks";
import theme from "types/theme";

export const trashId = "trash-drop";

export default function MergeDragDrop(): ReactElement {
  const dispatch = useAppDispatch();
  const mergeState = useAppSelector(
    (state: StoreState) => state.mergeDuplicateGoal
  );
  const [senseToDelete, setSenseToDelete] = useState<string>("");
  const { t } = useTranslation();

  const sidebar = mergeState.tree.sidebar;
  const treeWords = mergeState.tree.words;

  function handleDrop(res: DropResult): void {
    const senseRef: MergeTreeReference = JSON.parse(res.draggableId);
    const sourceId = res.source.droppableId;
    if (
      treeWords[sourceId]?.protected &&
      Object.keys(treeWords[sourceId].sensesGuids).length == 1
    ) {
      // Case 0: The final sense of a protected word cannot be moved.
      return;
    } else if (res.destination?.droppableId === trashId) {
      // Case 1: The sense was dropped on the trash icon.
      if (senseRef.isSenseProtected) {
        // Case 1a: Cannot delete a protected sense.
        return;
      }
      setSenseToDelete(res.draggableId);
    } else if (res.combine) {
      // Case 2: the sense was dropped on another sense.
      if (senseRef.isSenseProtected) {
        // Case 2a: Cannot merge a protected sense into another sense.
        if (sourceId !== res.combine.droppableId) {
          // The target sense is in a different word, so move instead of combine.
          dispatch(moveSense(senseRef, res.combine.droppableId, 0));
        }
        return;
      }
      const combineRef: MergeTreeReference = JSON.parse(
        res.combine.draggableId
      );
      if (combineRef.order !== undefined) {
        // Case 2b: If the target is a sidebar sub-sense, it cannot receive a combine.
        return;
      }
      dispatch(combineSense(senseRef, combineRef));
    } else if (res.destination) {
      const destId = res.destination.droppableId;
      // Case 3: The sense was dropped in a droppable.
      if (sourceId !== destId) {
        // Case 3a: The source, dest droppables are different.
        if (destId.split(" ").length > 1) {
          // If the destination is SidebarDrop, it cannot receive drags from elsewhere.
          return;
        }
        // Move the sense to the dest MergeWord.
        dispatch(moveSense(senseRef, destId, res.destination.index));
      } else {
        // Case 3b: The source & dest droppables are the same, so we reorder, not move.
        const order = res.destination.index;
        if (
          senseRef.order === order ||
          (order === 0 &&
            senseRef.order !== undefined &&
            sidebar.senses[0].protected)
        ) {
          // If the sense wasn't moved or was moved within the sidebar above a protected sense, do nothing.
          return;
        }
        dispatch(orderSense(senseRef, order));
      }
    }
  }

  function performDelete(): void {
    dispatch(deleteSense(JSON.parse(senseToDelete)));
    setSenseToDelete("");
  }

  function renderSidebar(): ReactElement {
    if (sidebar.senses.length <= 1) {
      return <div />;
    }
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
  const colCount = Object.keys(treeWords).length + 2; // +2 for trash and extra empty word

  return (
    <DragDropContext onDragEnd={handleDrop}>
      <ImageList rowHeight="auto" cols={colCount}>
        <ImageListItem key={"trash"} style={{ marginTop: "70vh" }}>
          <Droppable key={trashId} droppableId={trashId}>
            {(provided): ReactElement => (
              <div ref={provided.innerRef}>
                <Tooltip title={t("mergeDups.helpText.delete")} placement="top">
                  <Delete fontSize="large" />
                </Tooltip>
                <div style={{ position: "absolute" }}>
                  {provided.placeholder}
                </div>
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
      </ImageList>
    </DragDropContext>
  );
}
