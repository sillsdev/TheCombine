import { ArrowForwardIos } from "@mui/icons-material";
import { IconButton, Typography } from "@mui/material";
import { ReactElement } from "react";
import { Droppable } from "react-beautiful-dnd";

import SidebarDragSense from "goals/MergeDuplicates/MergeDupsStep/MergeDragDrop/SidebarDragSense";
import { MergeTreeSense } from "goals/MergeDuplicates/MergeDupsTreeTypes";
import { setSidebar } from "goals/MergeDuplicates/Redux/MergeDupsActions";
import { StoreState } from "types";
import { useAppDispatch, useAppSelector } from "types/hooks";

export default function SidebarDrop(): ReactElement {
  const dispatch = useAppDispatch();
  const sidebar = useAppSelector(
    (state: StoreState) => state.mergeDuplicateGoal.tree.sidebar
  );
  const vernacular = useAppSelector((state: StoreState) => {
    const tree = state.mergeDuplicateGoal.tree;
    return tree.words[tree.sidebar.wordId]?.vern;
  });

  return (
    <Droppable
      droppableId={`${sidebar.wordId} ${sidebar.mergeSenseId}`}
      key={sidebar.mergeSenseId}
    >
      {(providedDroppable): ReactElement => (
        <div
          ref={providedDroppable.innerRef}
          {...providedDroppable.droppableProps}
          style={{ backgroundColor: "lightblue", height: "100%", padding: 20 }}
        >
          <IconButton
            onClick={() => dispatch(setSidebar())}
            id="sidebar-close"
            size="large"
          >
            <ArrowForwardIos />
          </IconButton>
          <Typography variant="h5">{vernacular}</Typography>
          {sidebar.senses.map((sense: MergeTreeSense, index: number) => (
            <SidebarDragSense key={index} index={index} sense={sense} />
          ))}
          {providedDroppable.placeholder}
        </div>
      )}
    </Droppable>
  );
}
