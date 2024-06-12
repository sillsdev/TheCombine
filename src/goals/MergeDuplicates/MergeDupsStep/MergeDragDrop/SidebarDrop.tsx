import { ArrowForwardIos, HelpOutline } from "@mui/icons-material";
import { Grid, IconButton, Typography } from "@mui/material";
import { ReactElement } from "react";
import { Droppable } from "react-beautiful-dnd";

import SidebarDragSense from "goals/MergeDuplicates/MergeDupsStep/MergeDragDrop/SidebarDragSense";
import { MergeTreeSense } from "goals/MergeDuplicates/MergeDupsTreeTypes";
import { setSidebar } from "goals/MergeDuplicates/Redux/MergeDupsActions";
import { useAppDispatch, useAppSelector } from "rootRedux/hooks";
import { type StoreState } from "rootRedux/types";
import { openUserGuide } from "utilities/pathUtilities";

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
          <Grid container justifyContent="space-between">
            <IconButton
              id="sidebar-close"
              onClick={() => dispatch(setSidebar())}
            >
              <ArrowForwardIos />
            </IconButton>
            <IconButton
              id="sidebar-help"
              onClick={() => openUserGuide("goals.html#merge-a-sense")}
            >
              <HelpOutline />
            </IconButton>
          </Grid>
          <Typography variant="h5">{vernacular}</Typography>
          {sidebar.mergeSenses.map((ms: MergeTreeSense, i: number) => (
            <SidebarDragSense key={ms.sense.guid} index={i} mergeSense={ms} />
          ))}
          {providedDroppable.placeholder}
        </div>
      )}
    </Droppable>
  );
}
