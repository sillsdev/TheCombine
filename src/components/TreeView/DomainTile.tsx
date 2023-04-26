import {
  ChevronLeft,
  ChevronRight,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from "@mui/icons-material";
import { Button, Grid, Typography } from "@mui/material";
import React, { CSSProperties, ReactElement } from "react";
import { useTranslation } from "react-i18next";

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

interface DomainTextProps {
  domain: SemanticDomain;
  extraProps?: CSSProperties;
}

export function DomainText(props: DomainTextProps): ReactElement {
  const { t } = useTranslation();
  return (
    <div style={{ ...props.extraProps, textTransform: "capitalize" }}>
      <Typography variant={"overline"}>
        {props.domain.id !== RootId ? props.domain.id : ""}
      </Typography>
      <Typography variant={"body1"}>
        {props.domain.id !== RootId ? props.domain.name : t("addWords.domain")}
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
    const rtl = document.body.dir === "rtl";
    switch (direction) {
      case Direction.Down:
        return (
          <div>
            <DomainText domain={domain} />
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
            <Grid item>{rtl ? <ChevronRight /> : <ChevronLeft />}</Grid>
            <Grid item>
              <DomainText domain={domain} />
            </Grid>
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
            <Grid item>
              <DomainText domain={domain} />
            </Grid>
            <Grid item>{rtl ? <ChevronLeft /> : <ChevronRight />}</Grid>
          </Grid>
        );
      case Direction.Up:
        return (
          <div>
            <KeyboardArrowUp />
            <DomainText domain={domain} />
          </div>
        );
      default:
        return <DomainText domain={domain} />;
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
