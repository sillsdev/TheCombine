import {
  ChevronLeft,
  ChevronRight,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from "@mui/icons-material";
import { Button, Stack, Typography } from "@mui/material";
import { CSSProperties, ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { SemanticDomain } from "api/models";
import { Direction } from "components/TreeView/TreeDepiction/TreeDepictionTypes";
import { rootId } from "types/semanticDomain";

interface DomainTextProps {
  domain: SemanticDomain;
  extraProps?: CSSProperties;
}

export function DomainText(props: DomainTextProps): ReactElement {
  const { t } = useTranslation();
  return (
    <div style={{ ...props.extraProps, textTransform: "capitalize" }}>
      <Typography variant={"overline"}>
        {props.domain.id !== rootId ? props.domain.id : ""}
      </Typography>
      <Typography variant={"body1"}>
        {props.domain.id !== rootId ? props.domain.name : t("addWords.domain")}
      </Typography>
    </div>
  );
}

interface DomainTileProps {
  direction: Direction;
  domain: SemanticDomain;
}

function DomainTile(props: DomainTileProps): ReactElement {
  const rtl = document.body.dir === "rtl";
  switch (props.direction) {
    case Direction.Down:
      return (
        <div>
          <DomainText domain={props.domain} />
          <KeyboardArrowDown />
        </div>
      );
    case Direction.Prev:
      return (
        <Stack
          alignItems="center"
          direction="row"
          justifyContent="space-around"
        >
          {rtl ? <ChevronRight /> : <ChevronLeft />}
          <DomainText domain={props.domain} />
        </Stack>
      );
    case Direction.Next:
      return (
        <Stack
          alignItems="center"
          direction="row"
          justifyContent="space-around"
        >
          <DomainText domain={props.domain} />
          {rtl ? <ChevronLeft /> : <ChevronRight />}
        </Stack>
      );
    case Direction.Up:
      return (
        <div>
          <KeyboardArrowUp />
          <DomainText domain={props.domain} />
        </div>
      );
  }
}

interface DomainTileButtonProps extends DomainTileProps {
  onClick: (domain: SemanticDomain) => void;
}

// Creates a semantic domain tile, which can be clicked on to navigate to that semantic domain
export default function DomainTileButton(
  props: DomainTileButtonProps
): ReactElement {
  return (
    <Button
      color="primary"
      id={props.domain.id}
      onClick={() => props.onClick(props.domain)}
      style={{
        bottom: 0,
        height: "95%",
        insetInlineStart: 0,
        padding: "5px",
      }}
      tabIndex={-1}
      variant={"outlined"}
    >
      <DomainTile {...props} />
    </Button>
  );
}
