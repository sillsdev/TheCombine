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
  return props.small ? (
    <CurrentRowSm {...props} />
  ) : (
    <CurrentRowLg {...props} />
  );
}

function CurrentTile(props: TreeRowProps): ReactElement {
  const { animate, currentDomain } = props;

  return (
    <Button
      disabled={!currentDomain.parent}
      fullWidth
      id="current-domain"
      onClick={() => animate(currentDomain)}
      sx={{ height: "100%", p: 1 }}
      variant="contained"
    >
      <DomainText domain={currentDomain} />
    </Button>
  );
}

function CurrentRowLg(props: TreeRowProps): ReactElement {
  const { next, parent, previous } = props.currentDomain;

  return (
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
        <ImageListItem cols={3}>
          <CurrentTile {...props} />
        </ImageListItem>
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

function CurrentRowSm(props: TreeRowProps): ReactElement {
  const { next, parent, previous } = props.currentDomain;

  return (
    <Grid2 container spacing={2} sx={{ px: 2, width: window.innerWidth }}>
      {!!parent && (
        <>
          <Grid2 key="uncle" size={4} />
          <Grid2 key="parent" size={4}>
            <DomainTileButton
              direction={Direction.Up}
              domain={parent}
              onClick={props.animate}
            />
          </Grid2>
          <Grid2 key="aunt" size={4} />
        </>
      )}
      <Grid2 key="prev" size={4}>
        {previous && (
          <DomainTileButton
            direction={Direction.Prev}
            domain={previous}
            onClick={props.animate}
          />
        )}
      </Grid2>
      <Grid2 key="current" size={4}>
        <CurrentTile {...props} />
      </Grid2>
      <Grid2 key="next" size={4}>
        {next && (
          <DomainTileButton
            direction={Direction.Next}
            domain={next}
            onClick={props.animate}
          />
        )}
      </Grid2>
    </Grid2>
  );
}
