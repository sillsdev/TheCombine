import { Card } from "@material-ui/core";
import { Draggable } from "react-beautiful-dnd";

import { trashId } from "goals/MergeDupGoal/MergeDupStep/DragDropComponents/MergeDragDrop";
import {
  MergeTreeReference,
  MergeTreeSense,
  Sidebar,
} from "goals/MergeDupGoal/MergeDupStep/MergeDupsTree";
import SenseCardContent from "goals/MergeDupGoal/MergeDupStep/SenseCardContent";
import theme from "types/theme";

interface SidebarDragSenseProps {
  sidebar: Sidebar;
  sense: MergeTreeSense;
  index: number;
}

export default function SidebarDragSense(props: SidebarDragSenseProps) {
  const ref: MergeTreeReference = {
    wordId: props.sidebar.wordId,
    mergeSenseId: props.sidebar.mergeSenseId,
    order: props.index,
  };

  return (
    <Draggable
      key={props.sense.guid}
      draggableId={JSON.stringify(ref)}
      index={props.index}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <Card
            style={{
              marginBottom: theme.spacing(1),
              marginTop: theme.spacing(1),
              maxWidth: 300,
              opacity:
                snapshot.draggingOver === trashId || snapshot.combineWith
                  ? 0.7
                  : 1,
              background:
                snapshot.draggingOver === trashId
                  ? "red"
                  : snapshot.isDragging
                  ? "lightgreen"
                  : props.index === 0
                  ? "white"
                  : "lightgrey",
            }}
          >
            <SenseCardContent senses={[props.sense]} />
          </Card>
        </div>
      )}
    </Draggable>
  );
}
