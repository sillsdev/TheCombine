import { Grid2, SxProps } from "@mui/material";
import { ReactElement } from "react";

import { Gloss } from "api/models";
import { TypographyWithFont } from "utilities/fontComponents";

/** Style with a top dotted line if the index isn't 0. */
function BorderTopSx(index: number, style?: "solid" | "dotted"): SxProps {
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
  const { glosses, index, vernacular } = props;

  return (
    <Grid2 container wrap="nowrap" justifyContent="space-around">
      <Grid2 size={5} sx={{ ...BorderTopSx(index), position: "relative" }}>
        <TypographyWithFont variant="body1" vernacular>
          {vernacular}
        </TypographyWithFont>
      </Grid2>
      <Grid2 size={5} sx={{ ...BorderTopSx(index), position: "relative" }}>
        {glosses.map((g, i) => (
          <TypographyWithFont
            analysis
            key={i}
            lang={g.language}
            sx={BorderTopSx(i, "dotted")}
            variant="body1"
          >
            {g.def}
          </TypographyWithFont>
        ))}
      </Grid2>
    </Grid2>
  );
}
