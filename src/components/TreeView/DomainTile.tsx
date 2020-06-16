import React, { ReactNode } from "react";
import {
  Button,
  Grid,
  GridList,
  GridListTile,
  Typography,
} from "@material-ui/core";
import SemanticDomainWithSubdomains from "./SemanticDomain";
import {
  ChevronLeft,
  ChevronRight,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from "@material-ui/icons";

export enum Direction {
  Down = "Down",
  Left = "Left",
  Right = "Right",
  Up = "Up",
}

interface DomainTileProps {
  domain: SemanticDomainWithSubdomains;
  onClick: (domain: SemanticDomainWithSubdomains) => any;
  direction?: Direction;
}

// Creates a semantic domain tile, which can be clicked on to navigate to that semantic domain
export default class DomainTile extends React.Component<DomainTileProps> {
  constructor(props: DomainTileProps) {
    super(props);
  }

  domainText(domain: SemanticDomainWithSubdomains): ReactNode {
    return (
      <div style={{ textTransform: "capitalize" }}>
        <Typography variant={"overline"}>{domain.id}</Typography>
        <Typography variant={"body1"}>{domain.name}</Typography>
      </div>
    );
  }

  textWithArrow(
    domain: SemanticDomainWithSubdomains,
    direction: Direction | undefined
  ): ReactNode {
    switch (direction) {
      case Direction.Down:
        return (
          <div>
            {this.domainText(domain)}
            <KeyboardArrowDown />
          </div>
        );
      case Direction.Left:
        return (
          <Grid
            container
            alignItems="center"
            justify="space-around"
            wrap="nowrap"
          >
            <Grid item>
              <ChevronLeft />
            </Grid>
            <Grid item>{this.domainText(domain)}</Grid>
          </Grid>
        );
      case Direction.Right:
        return (
          <Grid
            container
            alignItems="center"
            justify="space-around"
            wrap="nowrap"
          >
            <Grid item>{this.domainText(domain)}</Grid>
            <Grid item>
              <ChevronRight />
            </Grid>
          </Grid>
        );
      case Direction.Up:
        return (
          <div>
            <KeyboardArrowUp />
            {this.domainText(domain)}
          </div>
        );
      default:
        return <div>{this.domainText(domain)}</div>;
    }
  }

  render() {
    let domain = this.props.domain;
    return (
      <Button
        id={domain.id}
        color={"primary"}
        variant={"outlined"}
        style={{
          left: 0,
          bottom: 0,
          width: "95%",
          height: "95%",
          margin: "2.5%",
        }}
        onClick={() => {
          this.props.onClick(domain);
        }}
      >
        {this.textWithArrow(domain, this.props.direction)}
      </Button>
    );
  }
}
