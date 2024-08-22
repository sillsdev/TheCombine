import { ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid,
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
  /** Setting title (goes second in `AccordionSummary` after icon). */
  title: ReactNode;
}

/** An accordion that holds a single project setting. */
export default function BaseSettings(props: BaseSettingsProps): ReactElement {
  return (
    <Accordion
      defaultExpanded
      disableGutters
      sx={{ maxWidth: props.maxWidth || "700px" }}
    >
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Grid container spacing={2} style={{ flexWrap: "nowrap" }}>
          <Grid item style={{ marginTop: 4, color: "grey" }}>
            {props.icon}
          </Grid>
          <Grid item>
            <Typography variant="h5">{props.title}</Typography>
          </Grid>
        </Grid>
      </AccordionSummary>
      <AccordionDetails>{props.body}</AccordionDetails>
    </Accordion>
  );
}
