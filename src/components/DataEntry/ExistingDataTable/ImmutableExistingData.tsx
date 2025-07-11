import { Grid2 } from "@mui/material";
import { CSSProperties, ReactElement } from "react";

import { Gloss } from "api/models";
import { TypographyWithFont } from "utilities/fontComponents";

/** Style with a top dotted line if the index isn't 0. */
function TopStyle(index: number, style?: "solid" | "dotted"): CSSProperties {
  return index ? { borderTopStyle: style ?? "solid", borderTopWidth: 1 } : {};
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
    <Grid2 container wrap="nowrap" justifyContent="space-around">
      <Grid2
        size={5}
        style={{ ...TopStyle(props.index), position: "relative" }}
      >
        <TypographyWithFont variant="body1" vernacular>
          {props.vernacular}
        </TypographyWithFont>
      </Grid2>
      <Grid2
        size={5}
        style={{ ...TopStyle(props.index), position: "relative" }}
      >
        {props.glosses.map((g, i) => (
          <TypographyWithFont
            analysis
            key={i}
            lang={g.language}
            style={TopStyle(i, "dotted")}
            variant="body1"
          >
            {g.def}
          </TypographyWithFont>
        ))}
      </Grid2>
    </Grid2>
  );
}
