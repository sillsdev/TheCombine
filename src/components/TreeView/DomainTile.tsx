import { Button, Grid, Typography } from "@material-ui/core";
import {
  ChevronLeft,
  ChevronRight,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from "@material-ui/icons";
import { t } from "i18next";
import React, { CSSProperties, ReactElement } from "react";

import { SemanticDomain } from "api/models";

export enum Direction {
  Down,
  Left,
  Right,
  Up,
}

interface DomainTileProps {
  domain: SemanticDomain;
  onClick: (domain: SemanticDomain) => void;
  direction?: Direction | undefined;
}

const RootId = "Sem";

export function domainText(
  domain: SemanticDomain,
  extraProps: CSSProperties = {}
): ReactElement {
  return (
    <div style={{ ...extraProps, textTransform: "capitalize" }}>
      <Typography variant={"overline"}>
        {domain.id !== RootId ? domain.id : ""}
      </Typography>
      <Typography variant={"body1"}>
        {domain.id !== RootId ? domain.name : t("addWords.domain")}
      </Typography>
    </div>
  );
}

// Creates a semantic domain tile, which can be clicked on to navigate to that semantic domain
export default class DomainTile extends React.Component<DomainTileProps> {
  textWithArrow(
    domain: SemanticDomain,
    direction: Direction | undefined
  ): ReactElement {
    switch (direction) {
      case Direction.Down:
        return (
          <div>
            {domainText(domain)}
            <KeyboardArrowDown />
          </div>
        );
      case Direction.Left:
        return (
          <Grid
            container
            alignItems="center"
            justifyContent="space-around"
            wrap="nowrap"
          >
            <Grid item>
              <ChevronLeft />
            </Grid>
            <Grid item>{domainText(domain)}</Grid>
          </Grid>
        );
      case Direction.Right:
        return (
          <Grid
            container
            alignItems="center"
            justifyContent="space-around"
            wrap="nowrap"
          >
            <Grid item>{domainText(domain)}</Grid>
            <Grid item>
              <ChevronRight />
            </Grid>
          </Grid>
        );
      case Direction.Up:
        return (
          <div>
            <KeyboardArrowUp />
            {domainText(domain)}
          </div>
        );
      default:
        return <div>{domainText(domain)}</div>;
    }
  }

  render() {
    const domain = this.props.domain;
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
        onClick={() => this.props.onClick(domain)}
      >
        {this.textWithArrow(domain, this.props.direction)}
      </Button>
    );
  }
}
