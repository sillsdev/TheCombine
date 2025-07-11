import { Droppable } from "@hello-pangea/dnd";
import { ArrowForwardIos, HelpOutline } from "@mui/icons-material";
import { Grid, IconButton, Typography } from "@mui/material";
import { type ReactElement } from "react";

import SidebarDragSense from "goals/MergeDuplicates/MergeDupsStep/MergeDragDrop/SidebarDragSense";
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
    return tree.words[tree.sidebar.senseRef.wordId]?.vern;
  });

  const { mergeSenseId, wordId } = sidebar.senseRef;

  return (
    <Droppable droppableId={`${wordId} ${mergeSenseId}`} key={mergeSenseId}>
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
          {sidebar.mergeSenses.map((mergeSense, index) => (
            <SidebarDragSense
              index={index}
              // Need the key to change when the index changes for the droppable to update.
              key={`${mergeSense.sense.guid}-${index}`}
              mergeSense={mergeSense}
            />
          ))}
          {providedDroppable.placeholder}
        </div>
      )}
    </Droppable>
  );
}
