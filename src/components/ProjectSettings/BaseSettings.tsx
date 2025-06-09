import { ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from "@mui/material";
import { type ReactElement, type ReactNode } from "react";

interface BaseSettingsProps {
  /** Setting content (goes in `AccordionDetails`). */
  body: ReactNode;
  /** Representative icon (goes first in `AccordionSummary` before title). */
  icon: ReactNode;
  /** If maxWidth not specified, defaults to 700px. */
  maxWidth?: string | number;
  /** If minWidth not specified, defaults to Accordion's default. */
  minWidth?: string | number;
  /** Setting title (goes second in `AccordionSummary` after icon). */
  title: ReactNode;
}

/** An accordion that holds a single project setting. */
export default function BaseSettings(props: BaseSettingsProps): ReactElement {
  return (
    <Accordion
      defaultExpanded
      disableGutters
      sx={{
        background: (theme) => theme.palette.background.default,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        maxWidth: props.maxWidth || "700px",
        minWidth: props.minWidth,
      }}
    >
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography variant="h5">
          <Box
            component="span" // to be inline with the title
            sx={{
              color: "grey",
              marginInlineEnd: 1,
              verticalAlign: "middle",
            }}
          >
            {props.icon}
          </Box>
          {props.title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>{props.body}</AccordionDetails>
    </Accordion>
  );
}
