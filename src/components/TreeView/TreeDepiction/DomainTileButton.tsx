import {
  ChevronLeft,
  ChevronRight,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from "@mui/icons-material";
import { Box, Button, Stack, Typography, useTheme } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { SemanticDomain } from "api/models";
import { getDomainProgressProportion } from "backend";
import { Direction } from "components/TreeView/TreeDepiction/TreeDepictionTypes";
import { rootId } from "types/semanticDomain";

interface DomainTextProps {
  domain: SemanticDomain;
}

export function DomainText(props: DomainTextProps): ReactElement {
  const { t } = useTranslation();
  const { id, name } = props.domain;
  return (
    <div style={{ textTransform: "capitalize" }}>
      {id !== rootId && <Typography variant="overline">{id}</Typography>}
      <Typography>{id !== rootId ? name : t("addWords.domain")}</Typography>
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
  const { onClick, direction, ...domainTileProps } = props;
  const theme = useTheme();
  const [progressProportion, setProgressProportion] = useState<
    number | undefined
  >(undefined);

  const shouldShowProgress =
    direction === Direction.Down ||
    direction === Direction.Prev ||
    direction === Direction.Next;

  useEffect(() => {
    if (shouldShowProgress && props.domain.id && props.domain.lang) {
      getDomainProgressProportion(props.domain.id, props.domain.lang)
        .then(setProgressProportion)
        .catch(() => {
          // Silently fail - the progress bar simply won't be displayed
          setProgressProportion(undefined);
        });
    }
  }, [shouldShowProgress, props.domain.id, props.domain.lang]);

  return (
    <Button
      id={props.domain.id}
      fullWidth
      onClick={() => onClick(props.domain)}
      sx={{ height: "100%", position: "relative", overflow: "hidden" }}
      tabIndex={-1}
      variant="outlined"
    >
      <DomainTile direction={direction} {...domainTileProps} />
      {shouldShowProgress && progressProportion !== undefined && (
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            backgroundColor: theme.palette.action.disabledBackground,
            borderBottomLeftRadius: theme.shape.borderRadius,
            borderBottomRightRadius: theme.shape.borderRadius,
          }}
        >
          <Box
            sx={{
              height: "100%",
              width: `${progressProportion * 100}%`,
              backgroundColor: theme.palette.primary.main,
              borderBottomLeftRadius: theme.shape.borderRadius,
              borderBottomRightRadius:
                progressProportion === 1 ? theme.shape.borderRadius : 0,
            }}
          />
        </Box>
      )}
    </Button>
  );
}
