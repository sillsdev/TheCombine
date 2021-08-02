import { Card } from "@material-ui/core";
import { Draggable } from "react-beautiful-dnd";
import { useSelector } from "react-redux";

import {
  MergeTreeReference,
  MergeTreeSense,
  Sidebar,
} from "goals/MergeDupGoal/MergeDupStep/MergeDupsTree";
import SenseCardContent from "goals/MergeDupGoal/MergeDupStep/SenseCardContent";
import { StoreState } from "types";
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
  const showDefinitions = useSelector(
    (state: StoreState) => state.currentProjectState.project.definitionsEnabled
  );

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
              background: snapshot.isDragging
                ? "lightgreen"
                : props.index === 0
                ? "white"
                : "lightgrey",
            }}
          >
            <SenseCardContent
              senses={[props.sense]}
              includeDefinitions={showDefinitions}
            />
          </Card>
        </div>
      )}
    </Draggable>
  );
}
