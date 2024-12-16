import { Delete } from "@mui/icons-material";
import { Drawer, Grid, ImageList, ImageListItem, Tooltip } from "@mui/material";
import { CSSProperties, ReactElement, useState } from "react";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import { useTranslation } from "react-i18next";
import { v4 } from "uuid";

import { appBarHeight } from "components/AppBar/AppBarTypes";
import { CancelConfirmDialog } from "components/Dialogs";
import DropWord from "goals/MergeDuplicates/MergeDupsStep/MergeDragDrop/DropWord";
import SidebarDrop from "goals/MergeDuplicates/MergeDupsStep/MergeDragDrop/SidebarDrop";
import { protectReasonsText } from "goals/MergeDuplicates/MergeDupsStep/protectReasonUtils";
import { MergeTreeReference } from "goals/MergeDuplicates/MergeDupsTreeTypes";
import {
  combineSense,
  deleteSense,
  moveSense,
  orderSense,
} from "goals/MergeDuplicates/Redux/MergeDupsActions";
import {
  type CombineSenseMergePayload,
  type MoveSensePayload,
  type OrderSensePayload,
} from "goals/MergeDuplicates/Redux/MergeDupsReduxTypes";
import { useAppDispatch, useAppSelector } from "rootRedux/hooks";
import { type StoreState } from "rootRedux/types";
import theme from "types/theme";

export const trashId = "trash-drop";

export default function MergeDragDrop(): ReactElement {
  const dispatch = useAppDispatch();
  const overrideProtection = useAppSelector(
    (state: StoreState) => state.mergeDuplicateGoal.overrideProtection
  );
  const sidebarOpen = useAppSelector(
    (state: StoreState) =>
      state.mergeDuplicateGoal.tree.sidebar.mergeSenses.length > 1
  );
  const sidebarProtected = useAppSelector((state: StoreState) => {
    const goal = state.mergeDuplicateGoal;
    const ms = goal.tree.sidebar.mergeSenses;
    return ms.length && ms[0].protected && !goal.overrideProtection;
  });
  const words = useAppSelector(
    (state: StoreState) => state.mergeDuplicateGoal.tree.words
  );

  interface ProtectedOverride {
    combinePayload?: CombineSenseMergePayload;
    deletePayload?: MergeTreeReference;
    movePayload?: MoveSensePayload;
    orderPayload?: OrderSensePayload;
    protectReason: string;
  }
  const [override, setOverride] = useState<ProtectedOverride | undefined>();
  const [srcToDelete, setSrcToDelete] = useState<
    MergeTreeReference | undefined
  >();

  const { t } = useTranslation();

  function handleDrop(res: DropResult): void {
    const src: MergeTreeReference = JSON.parse(res.draggableId);
    const srcWordId = res.source.droppableId;
    const srcWord = words[srcWordId];

    // Generate text for protected data that will be lost if user overrides.
    const isOnlySenseInProtectedWord =
      srcWord?.protected && Object.keys(srcWord.sensesGuids).length === 1;
    let protectReason = "";
    if (overrideProtection) {
      const wordReasons = isOnlySenseInProtectedWord
        ? (srcWord.protectReasons ?? [])
        : undefined;
      const senseReasons = src.protectReasons;
      protectReason = t("mergeDups.helpText.protectedOverrideWarning", {
        val: protectReasonsText(t, wordReasons, senseReasons, false),
      });
    }

    if (isOnlySenseInProtectedWord && !overrideProtection) {
      // Case 0: The final sense of a protected word cannot be moved.
      return;
    }
    if (res.destination?.droppableId === trashId) {
      // Case 1: The sense was dropped on the trash icon.
      if (src.isSenseProtected || isOnlySenseInProtectedWord) {
        // Case 1a: Cannot delete a protected sense.
        if (overrideProtection) {
          // ... unless protection override is active and user confirms.
          setOverride({ deletePayload: src, protectReason });
        }
        return;
      }
      setSrcToDelete(src);
    } else if (res.combine) {
      const combinePayload: CombineSenseMergePayload = {
        dest: JSON.parse(res.combine.draggableId),
        src,
      };
      // Case 2: the sense was dropped on another sense.
      if (src.isSenseProtected || isOnlySenseInProtectedWord) {
        // Case 2a: Cannot merge a protected sense into another sense.
        if (overrideProtection) {
          // ... unless protection override is active and user confirms.
          setOverride({ combinePayload, protectReason });
        } else if (srcWordId !== res.combine.droppableId) {
          // Otherwise, if target sense is in different word, move instead of combine.
          dispatch(
            moveSense({
              src,
              destWordId: res.combine.droppableId,
              destOrder: 0,
            })
          );
        }
        return;
      }
      if (combinePayload.dest.order !== undefined) {
        // Case 2b: If the target is a sidebar sub-sense, it cannot receive a combine.
        return;
      }
      // TODO: handle override case when sense is last in protected word
      dispatch(combineSense(combinePayload));
    } else if (res.destination) {
      const destOrder = res.destination.index;
      const destWordId = res.destination.droppableId;
      // Case 3: The sense was dropped in a droppable.
      if (srcWordId !== destWordId) {
        // Case 3a: The source, dest droppables are different.
        if (destWordId.split(" ").length > 1) {
          // If the destination is SidebarDrop, it cannot receive drags from elsewhere.
          return;
        }
        // Move the sense to the dest MergeWord.
        const movePayload: MoveSensePayload = { destOrder, destWordId, src };
        if (isOnlySenseInProtectedWord) {
          setOverride({ movePayload, protectReason });
          return;
        }
        dispatch(moveSense(movePayload));
      } else {
        // Case 3b: The source & dest droppables are the same, so we reorder, not move.
        const orderPayload: OrderSensePayload = { destOrder, src };
        if (
          src.order === destOrder ||
          (destOrder === 0 && src.order !== undefined && sidebarProtected)
        ) {
          // If the sense wasn't moved or was moved within the sidebar above a protected sense, do nothing.
          if (overrideProtection) {
            setOverride({ orderPayload, protectReason });
          }
          return;
        }
        dispatch(orderSense(orderPayload));
      }
    }
  }

  function onConfirmDelete(): void {
    if (srcToDelete) {
      dispatch(deleteSense(srcToDelete));
      setSrcToDelete(undefined);
    }
  }

  function onConfirmOverride(): void {
    if (override?.combinePayload) {
      dispatch(combineSense(override.combinePayload));
    } else if (override?.deletePayload) {
      dispatch(deleteSense(override.deletePayload));
    } else if (override?.movePayload) {
      dispatch(moveSense(override.movePayload));
    } else if (override?.orderPayload) {
      dispatch(orderSense(override.orderPayload));
    }
    setOverride(undefined);
  }

  function renderSidebar(): ReactElement {
    return sidebarOpen ? (
      <Drawer
        anchor="right"
        variant="persistent"
        open={sidebarOpen}
        SlideProps={{
          style: {
            height: `calc(100% - ${appBarHeight}px)`,
            top: appBarHeight,
          },
        }}
      >
        <SidebarDrop />
      </Drawer>
    ) : (
      <div />
    );
  }

  const newId = v4();
  const colCount = Object.keys(words).length + 1; // +1 for extra empty word.

  // This prevents things from moving when a draggable is dragged over the trash.
  const trashPlaceholderStyle: CSSProperties = {
    height: 0,
    overflow: "hidden",
    position: "absolute",
  };

  return (
    <DragDropContext onDragEnd={handleDrop}>
      <Grid container>
        <Grid item columns={1} key={"trash"} style={{ marginTop: "70vh" }}>
          <Droppable key={trashId} droppableId={trashId}>
            {(provided): ReactElement => (
              <div ref={provided.innerRef}>
                <Tooltip title={t("mergeDups.helpText.delete")} placement="top">
                  <Delete fontSize="large" />
                </Tooltip>
                <div style={trashPlaceholderStyle}>{provided.placeholder}</div>
              </div>
            )}
          </Droppable>
        </Grid>
        <Grid item sm={11} xs={10 /* Allow trash icon more space. */}>
          <ImageList rowHeight="auto" cols={colCount} style={{ width: "90vw" }}>
            {Object.keys(words).map((key) => (
              <ImageListItem
                key={key}
                style={{ height: "70vh", margin: theme.spacing(1) }}
              >
                <DropWord wordId={key} />
              </ImageListItem>
            ))}
            <ImageListItem key={newId} style={{ margin: theme.spacing(1) }}>
              <DropWord wordId={newId} />
            </ImageListItem>
            {renderSidebar()}
            <CancelConfirmDialog
              open={!!override}
              text={override?.protectReason ?? ""}
              handleCancel={() => setOverride(undefined)}
              handleConfirm={onConfirmOverride}
            />
            <CancelConfirmDialog
              open={!!srcToDelete}
              text="mergeDups.helpText.deleteDialog"
              handleCancel={() => setSrcToDelete(undefined)}
              handleConfirm={onConfirmDelete}
            />
          </ImageList>
        </Grid>
      </Grid>
    </DragDropContext>
  );
}
