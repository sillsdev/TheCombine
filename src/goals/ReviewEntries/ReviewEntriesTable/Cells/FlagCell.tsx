import { type ReactElement } from "react";

import { type Flag } from "api/models";
import { getWord, updateWord } from "backend";
import FlagButton from "components/Buttons/FlagButton";
import { type CellProps } from "goals/ReviewEntries/ReviewEntriesTable/Cells/CellTypes";

export default function FlagCell(props: CellProps): ReactElement {
  const updateFlag = async (flag: Flag): Promise<void> => {
    const word = await getWord(props.word.id);
    if (word.flag.active !== flag.active || word.flag.text !== flag.text) {
      const newId = (await updateWord({ ...word, flag })).id;
      await props.replace(word.id, newId);
    }
  };

  return (
    <FlagButton
      flag={props.word.flag}
      buttonId={`row-${props.word.id}-flag`}
      updateFlag={updateFlag}
    />
  );
}
