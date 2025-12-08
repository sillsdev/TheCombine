import { Grid2, ImageList, ImageListItem } from "@mui/material";
import { ReactElement } from "react";

import DomainTileButton from "components/TreeView/TreeDepiction/DomainTileButton";
import DownBrace from "components/TreeView/TreeDepiction/DownBrace";
import {
  Direction,
  RATIO_TILE_TO_GAP,
  TreeRowProps,
  getNumCols,
} from "components/TreeView/TreeDepiction/TreeDepictionTypes";
import * as tree from "resources/tree";

const HALF_TILE = (RATIO_TILE_TO_GAP - 1) / 2; // Half of cols-per-tile, rounded down

export default function ChildrenRow(props: TreeRowProps): ReactElement {
  // Creates a tile for the specified tree part
  const treeTile = (treeSrc: string): ReactElement => (
    <ImageListItem key={treeSrc + Math.random()}>
      <img src={treeSrc} style={{ transform: "scaleY(-1)" }} />
    </ImageListItem>
  );

  // Creates a span across multiple columns
  const multiSpan = (cols: number): ReactElement[] => {
    return Array.from({ length: cols }, () => treeTile(tree.span));
  };

  // Creates empty items, half (rounded down) as many as there are columns in a tile
  const halfTileGap = (): ReactElement[] => {
    return Array.from({ length: HALF_TILE }, () => (
      <ImageListItem key={"gap" + Math.random()} />
    ));
  };

  // Creates the joist connecting current domain with subdomains
  const joistRow = (): ReactElement[] => {
    const row: ReactElement[] = [];
    const teeCount = props.currentDomain.children.length - 2;
    const middleTeeCount = teeCount % 2;
    const halfTeeCount = (teeCount - middleTeeCount) / 2;
    const rtl = document.body.dir === "rtl";

    // If there is only one child, the joist row has no branching
    if (teeCount === -1) {
      row.push(...halfTileGap());
      row.push(treeTile(tree.pillar));
      row.push(...halfTileGap());
      return row;
    }

    /* Start endcap */
    row.push(...halfTileGap());
    row.push(treeTile(rtl ? tree.endcapRight : tree.endcapLeft));

    /* Start -> Middle */
    for (let i = 0; i < halfTeeCount; i++) {
      row.push(...multiSpan(RATIO_TILE_TO_GAP));
      row.push(treeTile(rtl ? tree.teeUpLeft : tree.teeUpRight));
    }

    /* Middle */
    if (middleTeeCount) {
      row.push(...multiSpan(RATIO_TILE_TO_GAP));
      row.push(treeTile(tree.intersect));
      row.push(...multiSpan(RATIO_TILE_TO_GAP));
    } else {
      row.push(...multiSpan(HALF_TILE));
      row.push(treeTile(tree.teeDown));
      row.push(...multiSpan(HALF_TILE));
    }

    /* Middle -> End */
    for (let i = 0; i < halfTeeCount; i++) {
      row.push(treeTile(rtl ? tree.teeUpRight : tree.teeUpLeft));
      row.push(...multiSpan(RATIO_TILE_TO_GAP));
    }

    /* End endcap */
    row.push(treeTile(rtl ? tree.endcapLeft : tree.endcapRight));
    row.push(...halfTileGap());

    return row;
  };

  // Places the subdomain tiles
  const domainRow = (): ReactElement[] => {
    const subdomains: ReactElement[] = [];
    props.currentDomain.children.forEach((child, i) => {
      if (i > 0) {
        subdomains.push(<ImageListItem key={`GapTile${i}`} />);
      }
      subdomains.push(
        <ImageListItem key={`DomainTile${i}`} cols={RATIO_TILE_TO_GAP}>
          <DomainTileButton
            direction={Direction.Down}
            domain={child}
            onClick={(d) => props.animate(d)}
          />
        </ImageListItem>
      );
    });
    return subdomains;
  };

  const numKids = props.currentDomain.children.length;
  const numCols = getNumCols(numKids);

  return props.small ? (
    <Grid2 container justifyContent="center">
      <DownBrace
        height={48}
        width={(window.innerWidth * Math.min(numKids, 3)) / 3}
      />
      <Grid2
        container
        justifyContent={numKids < 3 ? "center" : "flex-start"}
        spacing={2}
        sx={{ px: 2, width: window.innerWidth }}
      >
        {props.currentDomain.children.map((child) => (
          <Grid2 key={child.id} size={4}>
            <DomainTileButton
              direction={Direction.Down}
              domain={child}
              onClick={(d) => props.animate(d)}
            />
          </Grid2>
        ))}
      </Grid2>
    </Grid2>
  ) : (
    <ImageList
      cols={numCols}
      gap={0}
      sx={{ m: 0, overflow: "visible", width: numCols * props.colWidth }}
    >
      {joistRow()}
      {domainRow()}
    </ImageList>
  );
}
