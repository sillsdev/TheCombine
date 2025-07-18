import { Draggable } from "@hello-pangea/dnd";
import { Card } from "@mui/material";
import { type ReactElement } from "react";

import { trashId } from "goals/MergeDuplicates/MergeDupsStep/MergeDragDrop/MergeDragDropTypes";
import SenseCardContent from "goals/MergeDuplicates/MergeDupsStep/SenseCardContent";
import { type MergeTreeSense } from "goals/MergeDuplicates/MergeDupsTreeTypes";
import { useAppSelector } from "rootRedux/hooks";
import { type StoreState } from "rootRedux/types";
import theme from "types/theme";

interface SidebarDragSenseProps {
  mergeSense: MergeTreeSense;
  index: number;
}

export default function SidebarDragSense(
  props: SidebarDragSenseProps
): ReactElement {
  const draggableId = useAppSelector((state: StoreState) => {
    const ref = state.mergeDuplicateGoal.tree.sidebar.senseRef;
    return JSON.stringify({ ...ref, order: props.index });
  });
  const overrideProtection = useAppSelector(
    (state: StoreState) => state.mergeDuplicateGoal.overrideProtection
  );

  return (
    <Draggable
      key={props.mergeSense.sense.guid}
      draggableId={draggableId}
      index={props.index}
      isDragDisabled={props.mergeSense.protected && !overrideProtection}
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
                    : props.mergeSense.protected
                      ? "lightyellow"
                      : props.index === 0
                        ? "white"
                        : "lightgrey",
            }}
          >
            <SenseCardContent senses={[props.mergeSense.sense]} sidebar />
          </Card>
        </div>
      )}
    </Draggable>
  );
}
