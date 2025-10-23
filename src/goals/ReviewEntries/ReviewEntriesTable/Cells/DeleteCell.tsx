import { type ReactElement } from "react";

import { Status } from "api/models";
import { deleteFrontierWord } from "backend";
import DeleteButtonWithDialog from "components/Buttons/DeleteButtonWithDialog";
import { type CellProps } from "goals/ReviewEntries/ReviewEntriesTable/Cells/CellTypes";

const buttonIdCancel = "delete-cancel";
const buttonIdConfirm = "delete-confirm";

export default function DeleteCell(props: CellProps): ReactElement {
  const { accessibility, id, senses } = props.word;
  const disabled =
    accessibility === Status.Protected ||
    senses.some((s) => s.accessibility === Status.Protected);

  async function deleteWord(): Promise<void> {
    await deleteFrontierWord(id);
    await props.delete?.(id);
  }

  return (
    <DeleteButtonWithDialog
      buttonId={`row-${id}-delete`}
      buttonIdCancel={buttonIdCancel}
      buttonIdConfirm={buttonIdConfirm}
      delete={deleteWord}
      disabled={disabled}
      textId="reviewEntries.deleteWordWarning"
      tooltipTextId={disabled ? "reviewEntries.deleteDisabled" : ""}
    />
  );
}
