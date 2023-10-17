import { Grid } from "@mui/material";
import { ReactElement } from "react";

import { Gloss } from "api/models";
import { TypographyWithFont } from "utilities/fontComponents";

interface ImmutableExistingDataProps {
  gloss: Gloss;
  vernacular: string;
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
        style={{
          borderBottomStyle: "dotted",
          borderBottomWidth: 1,
          position: "relative",
        }}
      >
        <TypographyWithFont
          analysis
          lang={props.gloss.language}
          variant="body1"
        >
          {props.gloss.def}
        </TypographyWithFont>
      </Grid>
    </Grid>
  );
}
