import React from "react";
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

interface DomainTileProps {
  domain: SemanticDomainWithSubdomains;
  onClick: (domain: SemanticDomainWithSubdomains) => any;
}

export default class DomainTile extends React.Component<DomainTileProps> {
  /*private inputField(
    sense: ReviewEntriesSense,
    index: number,
    noGloss: string
  ): ReactNode {*/

  constructor(props: DomainTileProps) {
    super(props);
  }

  // Creates a semantic domain tile, which can be clicked on to navigate to that semantic domain
  /*export default function DomainTile(
  domain: SemanticDomainWithSubdomains,
  onClick: (domain: SemanticDomainWithSubdomains) => any,
  direction?: Direction
): ReactNode {*/
  render() {
    let domain = this.props.domain;
    let onClick = this.props.onClick;
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
}
