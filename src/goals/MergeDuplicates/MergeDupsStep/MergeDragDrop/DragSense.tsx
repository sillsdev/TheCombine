import { Card } from "@mui/material";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { Draggable } from "react-beautiful-dnd";

import { trashId } from "goals/MergeDuplicates/MergeDupsStep/MergeDragDrop";
import SenseCardContent from "goals/MergeDuplicates/MergeDupsStep/SenseCardContent";
import { MergeTreeSense } from "goals/MergeDuplicates/MergeDupsTreeTypes";
import { setSidebar } from "goals/MergeDuplicates/Redux/MergeDupsActions";
import {
  type StoreState,
  useAppDispatch,
  useAppSelector,
} from "rootRedux/hooks";
import theme from "types/theme";

interface DragSenseProps {
  index: number;
  wordId: string;
  mergeSenseId: string;
  mergeSenses: MergeTreeSense[];
  isOnlySenseInProtectedWord: boolean;
  isProtectedSense: boolean;
}

function arraysEqual<T>(arr1: T[], arr2: T[]): boolean {
  if (arr1.length !== arr2.length) {
    return false;
  }
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
}

export default function DragSense(props: DragSenseProps): ReactElement {
  const [duplicateCount, setDuplicateCount] = useState<number>(1);
  const analysisLangs = useAppSelector(
    (state: StoreState) =>
      state.currentProjectState.project.analysisWritingSystems.map(
        (ws) => ws.bcp47
      ),
    arraysEqual<string>
  );
  const dispatch = useAppDispatch();
  const sidebar = useAppSelector(
    (state: StoreState) => state.mergeDuplicateGoal.tree.sidebar
  );
  const isInSidebar =
    sidebar.wordId === props.wordId &&
    sidebar.mergeSenseId === props.mergeSenseId &&
    sidebar.mergeSenses.length > 1;

  const updateSidebar = useCallback(() => {
    dispatch(
      setSidebar({
        mergeSenses: props.mergeSenses,
        wordId: props.wordId,
        mergeSenseId: props.mergeSenseId,
      })
    );
  }, [dispatch, props]);

  const toggleSidebar = (): void => {
    if (isInSidebar) {
      dispatch(setSidebar());
    } else {
      updateSidebar();
    }
  };

  useEffect(() => {
    if (props.mergeSenses.length !== duplicateCount) {
      if (props.mergeSenses.length > duplicateCount) {
        updateSidebar();
      }
      setDuplicateCount(props.mergeSenses.length);
    }
  }, [props.mergeSenses.length, duplicateCount, updateSidebar]);

  if (
    isInSidebar &&
    !arraysEqual(
      sidebar.mergeSenses.map((m) => m.sense.guid),
      props.mergeSenses.map((m) => m.sense.guid)
    )
  ) {
    updateSidebar();
  }

  return (
    <Draggable
      key={props.mergeSenseId}
      draggableId={JSON.stringify({
        wordId: props.wordId,
        mergeSenseId: props.mergeSenseId,
        isSenseProtected: props.isProtectedSense,
      })}
      index={props.index}
      isDragDisabled={props.isOnlySenseInProtectedWord}
    >
      {(provided, snapshot): ReactElement => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            margin: theme.spacing(1),
            userSelect: "none",
            minWidth: 150,
            maxWidth: 300,
            opacity:
              !props.isProtectedSense &&
              (snapshot.draggingOver === trashId || snapshot.combineWith)
                ? 0.7
                : 1,
            background: isInSidebar
              ? "lightblue"
              : props.isProtectedSense
                ? "lightyellow"
                : snapshot.draggingOver === trashId
                  ? "red"
                  : snapshot.isDragging || snapshot.combineTargetFor
                    ? "lightgreen"
                    : "white",
          }}
        >
          <SenseCardContent
            senses={props.mergeSenses.map((s) => s.sense)}
            languages={analysisLangs}
            toggleFunction={toggleSidebar}
          />
        </Card>
      )}
    </Draggable>
  );
}
