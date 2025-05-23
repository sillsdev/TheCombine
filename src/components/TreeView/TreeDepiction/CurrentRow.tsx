import { Box, Button, Grid2, ImageList, ImageListItem } from "@mui/material";
import { ReactElement } from "react";

import DomainTileButton, {
  DomainText,
} from "components/TreeView/TreeDepiction/DomainTileButton";
import {
  Direction,
  TreeRowProps,
} from "components/TreeView/TreeDepiction/TreeDepictionTypes";
import { parent as parentSvg } from "resources/tree";

export default function CurrentRow(props: TreeRowProps): ReactElement {
  const { next, parent, previous } = props.currentDomain;

  const currentTile = (
    <Button
      disabled={!props.currentDomain.parent}
      fullWidth
      id="current-domain"
      onClick={() => props.animate(props.currentDomain)}
      sx={{ height: "100%", p: 1 }}
      variant="contained"
    >
      <DomainText domain={props.currentDomain} />
    </Button>
  );

  return props.small ? (
    <Grid2 container spacing={2} sx={{ px: 2, width: window.innerWidth }}>
      <Grid2 size={4} />
      <Grid2 size={4}>
        {parent && (
          <DomainTileButton
            direction={Direction.Up}
            domain={parent}
            onClick={props.animate}
          />
        )}
      </Grid2>
      <Grid2 size={4} />
      <Grid2 size={4}>
        {previous && (
          <DomainTileButton
            direction={Direction.Prev}
            domain={previous}
            onClick={props.animate}
          />
        )}
      </Grid2>
      <Grid2 size={4}>{currentTile}</Grid2>
      <Grid2 size={4}>
        {next && (
          <DomainTileButton
            direction={Direction.Next}
            domain={next}
            onClick={props.animate}
          />
        )}
      </Grid2>
    </Grid2>
  ) : (
    <>
      {parent && (
        <>
          <Box>
            <DomainTileButton
              direction={Direction.Up}
              domain={parent}
              onClick={props.animate}
            />
          </Box>
          <img
            src={parentSvg}
            style={{ transform: "scaleY(-1)" }}
            width={props.colWidth}
          />
        </>
      )}
      <ImageList cols={7} gap={20} sx={{ mx: 1, my: 0 }}>
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
    </>
  );
}
