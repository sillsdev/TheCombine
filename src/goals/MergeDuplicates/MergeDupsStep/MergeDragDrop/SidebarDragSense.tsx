import { Card } from "@mui/material";
import { ReactElement } from "react";
import { Draggable } from "react-beautiful-dnd";

import { trashId } from "goals/MergeDuplicates/MergeDupsStep/MergeDragDrop";
import SenseCardContent from "goals/MergeDuplicates/MergeDupsStep/SenseCardContent";
import {
  MergeTreeReference,
  MergeTreeSense,
} from "goals/MergeDuplicates/MergeDupsTreeTypes";
import { StoreState } from "types";
import { useAppSelector } from "types/hooks";
import theme from "types/theme";

interface SidebarDragSenseProps {
  sense: MergeTreeSense;
  index: number;
}

export default function SidebarDragSense(
  props: SidebarDragSenseProps
): ReactElement {
  const draggableId = useAppSelector((state: StoreState) => {
    const { mergeSenseId, wordId } = state.mergeDuplicateGoal.tree.sidebar;
    const order = props.index;
    const ref: MergeTreeReference = { wordId, mergeSenseId, order };
    return JSON.stringify(ref);
  });

  return (
    <Draggable
      key={props.sense.guid}
      draggableId={draggableId}
      index={props.index}
      isDragDisabled={props.sense.protected}
    >
      {(provided, snapshot): ReactElement => (
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
                    : props.sense.protected
                      ? "lightyellow"
                      : props.index === 0
                        ? "white"
                        : "lightgrey",
            }}
          >
            <SenseCardContent senses={[props.sense]} sidebar />
          </Card>
        </div>
      )}
    </Draggable>
  );
}
