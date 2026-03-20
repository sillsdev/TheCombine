import { type ReactElement } from "react";

import { type Flag } from "api/models";
import { updateWord } from "backend";
import FlagButton from "components/Buttons/FlagButton";
import { type CellProps } from "goals/ReviewEntries/ReviewEntriesTable/Cells/CellTypes";

export default function FlagCell(props: CellProps): ReactElement {
  const updateFlag = async (flag: Flag): Promise<void> => {
    const oldFlag = props.word.flag;
    if (oldFlag.active !== flag.active || oldFlag.text !== flag.text) {
      const newId = (await updateWord({ ...props.word, flag })).id;
      await props.replace(props.word.id, newId);
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
