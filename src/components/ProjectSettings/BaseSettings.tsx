import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid,
  Typography,
} from "@mui/material";
import { type ReactElement, type ReactNode } from "react";

interface BaseSettingsProps {
  title: ReactNode;
  icon: ReactNode;
  body: ReactNode;
}

export default function BaseSettings(props: BaseSettingsProps): ReactElement {
  return (
    <Accordion defaultExpanded>
      <AccordionSummary>
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
