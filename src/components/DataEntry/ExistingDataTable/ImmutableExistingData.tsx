import { Grid } from "@mui/material";
import { ReactElement } from "react";

import { TypographyWithFont } from "utilities/fontComponents";

interface ImmutableExistingDataProps {
  vernacular: string;
  gloss: string;
  glossLang?: string;
}

/**
 * Displays a word users cannot edit any more
 */
export default function ImmutableExistingData(
  props: ImmutableExistingDataProps
): ReactElement {
  return (
    <Grid container wrap="nowrap" justifyContent="space-around">
      <Grid
        item
        xs={5}
        key={"vernacular_" + props.vernacular}
        style={{
          borderBottomStyle: "dotted",
          borderBottomWidth: 1,
          position: "relative",
        }}
      >
        <TypographyWithFont variant="body1" vernacular>
          {props.vernacular}
        </TypographyWithFont>
      </Grid>
      <Grid
        item
        xs={5}
        key={"gloss_" + props.gloss}
        style={{
          borderBottomStyle: "dotted",
          borderBottomWidth: 1,
          position: "relative",
        }}
      >
        <TypographyWithFont analysis lang={props.glossLang} variant="body1">
          {props.gloss}
        </TypographyWithFont>
      </Grid>
    </Grid>
  );
}
