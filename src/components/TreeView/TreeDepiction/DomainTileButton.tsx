import {
  ChevronLeft,
  ChevronRight,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Stack,
  SxProps,
  Typography,
  useTheme,
} from "@mui/material";
import { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { SemanticDomain } from "api/models";
import { getDomainProgress } from "backend";
import DomainCountBadge from "components/TreeView/TreeDepiction/DomainCountBadge";
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

const badgeClass = "DomainCountBadge";

/** Style to show the child with given className only on hover of the parent */
const hoverSx = (className: string): SxProps => ({
  [`& .${className}`]: { opacity: 0, transition: "opacity .25s ease" },
  [`&:hover .${className}`]: { opacity: 1 },
});

interface DomainTileButtonProps extends DomainTileProps {
  onClick: (domain: SemanticDomain) => void;
}

// Creates a semantic domain tile, which can be clicked on to navigate to that semantic domain
export default function DomainTileButton(
  props: DomainTileButtonProps
): ReactElement {
  const { onClick, ...domainTileProps } = props;

  const [progress, setProgress] = useState<number>(0);
  const theme = useTheme();

  const shouldShowProgress = domainTileProps.direction !== Direction.Up;

  useEffect(() => {
    if (shouldShowProgress) {
      setProgress(0);
      getDomainProgress(props.domain.id)
        .then(setProgress)
        .catch(() => {}); // Silently fail
    }
  }, [shouldShowProgress, props.domain.id]);

  return (
    <Button
      id={props.domain.id}
      fullWidth
      onClick={() => onClick(props.domain)}
      sx={{ height: "100%", ...hoverSx(badgeClass) }}
      tabIndex={-1}
      variant="outlined"
    >
      <DomainTile {...domainTileProps} />

      <DomainCountBadge className={badgeClass} domainId={props.domain.id} />

      {shouldShowProgress && (
        <Box
          sx={{
            backgroundColor: theme.palette.action.disabledBackground,
            borderBottomLeftRadius: theme.shape.borderRadius,
            borderBottomRightRadius: theme.shape.borderRadius,
            height: 3,
            inset: "auto 0 0 0",
            position: "absolute",
          }}
        >
          <Box
            sx={{
              backgroundColor: theme.palette.primary.main,
              borderBottomLeftRadius: theme.shape.borderRadius,
              borderBottomRightRadius: progress * theme.shape.borderRadius,
              height: "100%",
              transition: progress ? "width .5s ease" : undefined,
              width: `${progress * 100}%`,
            }}
          />
        </Box>
      )}
    </Button>
  );
}
