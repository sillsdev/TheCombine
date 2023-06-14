import { ReactElement } from "react";

import DataEntry from "components/DataEntry/DataEntry";
import {
  closeTreeAction,
  openTreeAction,
} from "components/TreeView/Redux/TreeViewActions";
import { StoreState } from "types";
import { useAppDispatch, useAppSelector } from "types/hooks";

export default function (): ReactElement {
  const dispatch = useAppDispatch();
  const closeTree = () => dispatch(closeTreeAction());
  const openTree = () => dispatch(openTreeAction());

  const { currentDomain, open } = useAppSelector(
    (state: StoreState) => state.treeViewState
  );

  return (
    <DataEntry
      closeTree={closeTree}
      currentDomain={currentDomain}
      isTreeOpen={open}
      openTree={openTree}
    />
  );
}
