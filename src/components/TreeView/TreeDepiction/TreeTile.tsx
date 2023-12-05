import { ImageListItem } from "@mui/material";
import { ReactElement } from "react";

interface TreeTileProps {
  colWidth: number;
  imgSrc: string;
}
/** Creates a section of the tree diagram (one of the branches) set to proper dimensions. */
export default function TreeTile(props: TreeTileProps): ReactElement {
  return (
    <ImageListItem style={{ transform: "scaleY(-1)" }}>
      <img
        src={props.imgSrc}
        alt={props.imgSrc}
        width={props.colWidth + 1} // The +1 is to avoid visual gaps from rounding errors
        height={60}
      />
    </ImageListItem>
  );
}
