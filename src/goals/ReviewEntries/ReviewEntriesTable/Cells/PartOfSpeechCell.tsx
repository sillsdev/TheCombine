import { Grid } from "@mui/material";
import { ReactElement } from "react";

import { GrammaticalInfo, Sense } from "api/models";
import { PartOfSpeechButton } from "components/Buttons";
import { CellProps } from "goals/ReviewEntries/ReviewEntriesTable/Cells/CellTypes";

/** Collect all distinct sense.grammaticalInfo values. */
function gatherGramInfo(senses: Sense[]): GrammaticalInfo[] {
  return senses.reduce<GrammaticalInfo[]>((a, sense) => {
    const cg = sense.grammaticalInfo.catGroup;
    const gc = sense.grammaticalInfo.grammaticalCategory;
    return a.some((gi) => gi.catGroup === cg && gi.grammaticalCategory === gc)
      ? a
      : [...a, sense.grammaticalInfo];
  }, []);
}

export default function PartOfSpeechCell(props: CellProps): ReactElement {
  return (
    <Grid container direction="row" spacing={2}>
      {gatherGramInfo(props.word.senses).map((gi) => (
        <Grid item key={`${gi.catGroup}-${gi.grammaticalCategory}`}>
          <PartOfSpeechButton gramInfo={gi} />
        </Grid>
      ))}
    </Grid>
  );
}
