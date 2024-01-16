import { ReactElement } from "react";

import { Status } from "api/models";
import { deleteFrontierWord } from "backend";
import { DeleteButtonWithDialog } from "components/Buttons";
import { CellProps } from "goals/ReviewEntries/ReviewEntriesTable/Cells/CellTypes";

const buttonId = (wordId: string): string => `row-${wordId}-delete`;
const buttonIdCancel = "delete-cancel";
const buttonIdConfirm = "delete-confirm";

export default function DeleteCell(props: CellProps): ReactElement {
  const word = props.rowData;
  const disabled =
    word.accessibility === Status.Protected ||
    !!word.senses.find((s) => s.accessibility === Status.Protected);

  async function deleteWord(): Promise<void> {
    await deleteFrontierWord(word.id);
    if (props.deleteWord) {
      props.deleteWord(word.id);
    }
  }

  return (
    <DeleteButtonWithDialog
      buttonId={buttonId(props.rowData.id)}
      buttonIdCancel={buttonIdCancel}
      buttonIdConfirm={buttonIdConfirm}
      delete={deleteWord}
      disabled={disabled}
      textId="reviewEntries.deleteWordWarning"
      tooltipTextId={disabled ? "reviewEntries.deleteDisabled" : ""}
    />
  );
}
