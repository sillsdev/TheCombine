import { Grid } from "@mui/material";
import { CSSProperties, ReactElement } from "react";

import { Gloss } from "api/models";
import { TypographyWithFont } from "utilities/fontComponents";

/** Style with a top dotted line if the index isn't 0. */
function TopStyle(index: number): CSSProperties {
  return index ? { borderTopStyle: "dotted", borderTopWidth: 1 } : {};
}

interface ImmutableExistingDataProps {
  glosses: Gloss[];
  index: number;
  vernacular: string;
}

/** Displays a word-sense that the user cannot edit. */
export default function ImmutableExistingData(
  props: ImmutableExistingDataProps
): ReactElement {
  return (
    <Grid container wrap="nowrap" justifyContent="space-around">
      <Grid
        item
        style={{ ...TopStyle(props.index), position: "relative" }}
        xs={5}
      >
        <TypographyWithFont variant="body1" vernacular>
          {props.vernacular}
        </TypographyWithFont>
      </Grid>
      <Grid
        item
        style={{ ...TopStyle(props.index), position: "relative" }}
        xs={5}
      >
        {props.glosses.map((g, i) => (
          <TypographyWithFont
            analysis
            key={i}
            lang={g.language}
            style={TopStyle(i)}
            variant="body1"
          >
            {g.def}
          </TypographyWithFont>
        ))}
      </Grid>
    </Grid>
  );
}
