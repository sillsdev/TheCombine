import { Grid2 } from "@mui/material";
import { type ReactElement } from "react";

import { type GrammaticalInfo, type Sense } from "api/models";
import PartOfSpeechButton from "components/Buttons/PartOfSpeechButton";
import { type CellProps } from "goals/ReviewEntries/ReviewEntriesTable/Cells/CellTypes";

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
    <Grid2 container spacing={2}>
      {gatherGramInfo(props.word.senses).map((gi) => (
        <PartOfSpeechButton
          gramInfo={gi}
          key={`${gi.catGroup}-${gi.grammaticalCategory}`}
        />
      ))}
    </Grid2>
  );
}
