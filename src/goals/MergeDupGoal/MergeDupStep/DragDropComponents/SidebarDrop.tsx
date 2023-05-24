import { ArrowForwardIos } from "@mui/icons-material";
import { IconButton, Typography } from "@mui/material";
import { ReactElement } from "react";
import { Droppable } from "react-beautiful-dnd";

import SidebarDragSense from "goals/MergeDupGoal/MergeDupStep/DragDropComponents/SidebarDragSense";
import {
  MergeTreeSense,
  Sidebar,
} from "goals/MergeDupGoal/MergeDupStep/MergeDupsTree";
import { setSidebar } from "goals/MergeDupGoal/Redux/MergeDupActions";
import { useAppDispatch } from "types/hooks";

interface SidebarDropProps {
  sidebar: Sidebar;
  vernacular: string;
}

export default function SidebarDrop(props: SidebarDropProps): ReactElement {
  const dispatch = useAppDispatch();

  return (
    <Droppable
      droppableId={`${props.sidebar.wordId} ${props.sidebar.mergeSenseId}`}
      key={props.sidebar.mergeSenseId}
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
          <Typography variant="h5">{props.vernacular}</Typography>
          {props.sidebar.senses.map((sense: MergeTreeSense, index: number) => (
            <SidebarDragSense
              key={index}
              index={index}
              sidebar={props.sidebar}
              sense={sense}
            />
          ))}
          {providedDroppable.placeholder}
        </div>
      )}
    </Droppable>
  );
}
