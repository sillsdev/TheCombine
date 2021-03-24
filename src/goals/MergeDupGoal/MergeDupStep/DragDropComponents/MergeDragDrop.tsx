import { Drawer, GridListTile } from "@material-ui/core";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { useDispatch, useSelector } from "react-redux";
import { v4 } from "uuid";

import DropWord from "goals/MergeDupGoal/MergeDupStep/DragDropComponents/DropWord";
import SidebarDrop from "goals/MergeDupGoal/MergeDupStep/DragDropComponents/SidebarDrop";
import {
  moveSenses,
  orderDuplicate,
  orderSense,
} from "goals/MergeDupGoal/MergeDupStep/MergeDupStepActions";
import {
  Hash,
  MergeTreeReference,
  MergeTreeWord,
} from "goals/MergeDupGoal/MergeDupStep/MergeDupsTree";
import { StoreState } from "types";

interface MergeDragDropProps {
  portrait: boolean;
  words: Hash<MergeTreeWord>;
}

export default function MergeDragDrop(props: MergeDragDropProps) {
  const dispatch = useDispatch();
  const sidebar = useSelector(
    (state: StoreState) => state.mergeDuplicateGoal.tree.sidebar
  );

  function handleDrop(res: DropResult) {
    const srcRefs: MergeTreeReference[] = [];

    const srcRef: MergeTreeReference = JSON.parse(res.draggableId);
    if (srcRef.order === undefined) {
      const wordId = srcRef.wordId;
      const mergeSenseId = srcRef.mergeSenseId;
      props.words[wordId].sensesGuids[mergeSenseId].forEach((_guid, order) =>
        srcRefs.push({ wordId, mergeSenseId, order })
      );
    } else {
      srcRefs.push(srcRef);
    }

    if (res.combine) {
      const combineRef: MergeTreeReference = JSON.parse(
        res.combine.draggableId
      );
      const destRefs: MergeTreeReference[] = [];
      srcRefs.forEach(() =>
        destRefs.push({
          wordId: combineRef.wordId,
          mergeSenseId: combineRef.mergeSenseId,
          order: -1,
        })
      );
      dispatch(moveSenses(srcRefs, destRefs));
    } else if (res.destination) {
      if (res.source.droppableId !== res.destination.droppableId) {
        // move to different word
        const destRefs: MergeTreeReference[] = [];
        const mergeSenseId = v4();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (let _ in srcRefs) {
          destRefs.push({
            wordId: res.destination.droppableId,
            mergeSenseId,
            order: -1,
          });
        }
        dispatch(moveSenses(srcRefs, destRefs));
        const ref: MergeTreeReference = {
          wordId: res.destination.droppableId,
          mergeSenseId,
          order: res.destination.index,
        };
        dispatch(orderSense(ref));
      } else {
        // set ordering
        if (srcRef.order !== undefined) {
          dispatch(orderDuplicate(srcRef, res.destination.index));
        } else {
          const ref: MergeTreeReference = {
            ...srcRef,
            order: res.destination.index,
          };
          dispatch(orderSense(ref));
        }
      }
    }
  }

  function renderSidebar() {
    if (sidebar.senses.length <= 1) return <div />;
    return (
      <Drawer
        anchor="right"
        variant="persistent"
        open={sidebar.senses.length > 1}
      >
        <SidebarDrop
          sidebar={sidebar}
          vernacular={props.words[sidebar.wordId].vern}
        />
      </Drawer>
    );
  }

  const newId = v4();

  return (
    <DragDropContext onDragEnd={handleDrop}>
      {Object.keys(props.words).map((key) => (
        <GridListTile key={key} style={{ height: "70vh", margin: 8 }}>
          <DropWord portrait={props.portrait} wordId={key} />
        </GridListTile>
      ))}
      <GridListTile key={newId} style={{ margin: 8 }}>
        <DropWord portrait={props.portrait} wordId={newId} />
      </GridListTile>
      {renderSidebar()}
    </DragDropContext>
  );
}
