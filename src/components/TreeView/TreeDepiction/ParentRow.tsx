import { ImageList, ImageListItem } from "@mui/material";
import { Fragment, ReactElement } from "react";

import DomainTileButton from "components/TreeView/TreeDepiction/DomainTileButton";
import {
  Direction,
  TreeRowProps,
} from "components/TreeView/TreeDepiction/TreeDepictionTypes";
import TreeTile from "components/TreeView/TreeDepiction/TreeTile";
import { parent } from "resources/tree";

export default function ParentRow(props: TreeRowProps): ReactElement {
  if (!props.currentDomain.parent) {
    return <Fragment />;
  }
  return (
    <ImageList cols={1} gap={0} rowHeight="auto">
      <ImageListItem>
        <DomainTileButton
          direction={Direction.Up}
          domain={props.currentDomain.parent}
          onClick={props.animate}
        />
      </ImageListItem>
      <TreeTile colWidth={props.colWidth} imgSrc={parent} />
    </ImageList>
  );
}
