import { Card } from "@material-ui/core";
import { useCallback, useEffect, useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import { useDispatch, useSelector } from "react-redux";

import { MergeTreeSense } from "goals/MergeDupGoal/MergeDupStep/MergeDupsTree";
import SenseCardContent from "goals/MergeDupGoal/MergeDupStep/SenseCardContent";
import { setSidebar } from "goals/MergeDupGoal/Redux/MergeDupActions";
import { StoreState } from "types";
import theme from "types/theme";

interface DragSenseProps {
  index: number;
  wordId: string;
  mergeSenseId: string;
  senses: MergeTreeSense[];
}

function arraysEqual<T>(arr1: T[], arr2: T[]): boolean {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}

export default function DragSense(props: DragSenseProps) {
  const [duplicateCount, setDuplicateCount] = useState<number>(1);
  const analysisLangs = useSelector((state: StoreState) =>
    state.currentProjectState.project.analysisWritingSystems.map(
      (ws) => ws.bcp47
    )
  );
  const dispatch = useDispatch();
  const sidebar = useSelector(
    (state: StoreState) => state.mergeDuplicateGoal.tree.sidebar
  );
  const isInSidebar =
    sidebar.wordId === props.wordId &&
    sidebar.mergeSenseId === props.mergeSenseId &&
    sidebar.senses.length > 1;

  const updateSidebar = useCallback(() => {
    dispatch(
      setSidebar({
        senses: props.senses,
        wordId: props.wordId,
        mergeSenseId: props.mergeSenseId,
      })
    );
  }, [dispatch, props]);

  const toggleSidebar = () => {
    if (isInSidebar) {
      dispatch(setSidebar());
    } else {
      updateSidebar();
    }
  };

  useEffect(() => {
    if (props.senses.length !== duplicateCount) {
      if (props.senses.length > duplicateCount) {
        updateSidebar();
      }
      setDuplicateCount(props.senses.length);
    }
  }, [props.senses.length, duplicateCount, updateSidebar]);

  if (
    isInSidebar &&
    !arraysEqual(
      sidebar.senses.map((s) => s.guid),
      props.senses.map((s) => s.guid)
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
      })}
      index={props.index}
    >
      {(provided, snapshot) => (
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
            background:
              snapshot.isDragging || snapshot.combineTargetFor
                ? "lightgreen"
                : isInSidebar
                ? "lightblue"
                : "white",
          }}
        >
          <SenseCardContent
            senses={props.senses}
            languages={analysisLangs}
            toggleFunction={toggleSidebar}
          />
        </Card>
      )}
    </Draggable>
  );
}
