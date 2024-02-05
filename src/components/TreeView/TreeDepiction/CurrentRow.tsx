import { Button, ImageList, ImageListItem } from "@mui/material";
import { ReactElement } from "react";

import DomainTileButton, {
  DomainText,
} from "components/TreeView/TreeDepiction/DomainTileButton";
import {
  Direction,
  TreeDepictionProps,
} from "components/TreeView/TreeDepiction/TreeDepictionTypes";

export default function CurrentRow(props: TreeDepictionProps): ReactElement {
  const { next, previous } = props.currentDomain;

  const currentTile = (
    <Button
      color="primary"
      disabled={!props.currentDomain.parent}
      fullWidth
      id="current-domain"
      onClick={() => props.animate(props.currentDomain)}
      size="large"
      style={{ height: "95%" }}
      variant="contained"
    >
      <DomainText domain={props.currentDomain} extraProps={{ minWidth: 200 }} />
    </Button>
  );

  return props.small ? (
    currentTile
  ) : (
    <ImageList cols={7} gap={20} rowHeight={"auto"}>
      <ImageListItem cols={2}>
        {previous && (
          <DomainTileButton
            direction={Direction.Prev}
            domain={previous}
            onClick={props.animate}
          />
        )}
      </ImageListItem>
      <ImageListItem cols={3}>{currentTile}</ImageListItem>
      <ImageListItem cols={2}>
        {next && (
          <DomainTileButton
            direction={Direction.Next}
            domain={next}
            onClick={props.animate}
          />
        )}
      </ImageListItem>
    </ImageList>
  );
}
