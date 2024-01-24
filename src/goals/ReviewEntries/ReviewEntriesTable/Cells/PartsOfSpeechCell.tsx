import { Grid } from "@mui/material";
import { ReactElement } from "react";

import { GramCatGroup, GrammaticalInfo, Sense } from "api/models";
import { PartOfSpeechButton } from "components/Buttons";
import { CellProps } from "goals/ReviewEntries/ReviewEntriesTable/Cells/CellTypes";

/** Collect all distinct sense.grammaticalInfo values. */
function gatherGramInfo(senses: Sense[]): GrammaticalInfo[] {
  return senses.reduce<GrammaticalInfo[]>((a, { grammaticalInfo }) => {
    const { catGroup, grammaticalCategory } = grammaticalInfo;
    return grammaticalCategory === GramCatGroup.Unspecified ||
      a.some(
        (i) =>
          i.catGroup === catGroup &&
          i.grammaticalCategory === grammaticalCategory
      )
      ? a
      : [...a, grammaticalInfo];
  }, []);
}

export default function PartOfSpeechCell(props: CellProps): ReactElement {
  return (
    <Grid container direction="row" spacing={2}>
      {gatherGramInfo(props.rowData.senses).map((gi) => (
        <Grid item key={`${gi.catGroup}-${gi.grammaticalCategory}`}>
          <PartOfSpeechButton gramInfo={gi} />
        </Grid>
      ))}
    </Grid>
  );
}
