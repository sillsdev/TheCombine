import React, { ReactNode } from "react";
import { Button, Typography } from "@material-ui/core";
import SemanticDomainWithSubdomains from "./SemanticDomain";
import {
  ChevronLeft,
  ChevronRight,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from "@material-ui/icons";

export enum Direction {
  Up,
  Down,
  Left,
  Right,
}

/*interface DomainTileProps {
  editable: boolean;
  sortingByGloss: boolean;
}

export default class DomainTile extends ReactNode<
  DomainTileProps
> {
  private inputField(
    sense: ReviewEntriesSense,
    index: number,
    noGloss: string
  ): ReactNode {
*/

// Creates a semantic domain tile, which can be clicked on to navigate to that semantic domain
export default function DomainTile(
  domain: SemanticDomainWithSubdomains,
  onClick: (domain: SemanticDomainWithSubdomains) => any,
  direction?: Direction
): ReactNode {
  return (
    <Button
      id={domain.id}
      color={"primary"}
      variant={"outlined"}
      style={{
        left: 0,
        bottom: 0,
        width: "90%",
        height: "90%",
        margin: "5%",
      }}
      onClick={() => {
        onClick(domain);
      }}
    >
      <div style={{ textTransform: "capitalize" }}>
        <Typography variant={"overline"}>{domain.id}</Typography>
        <Typography variant={"body1"}>{domain.name}</Typography>
      </div>
    </Button>
  );
}
