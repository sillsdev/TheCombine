import { ReactElement } from "react";

import { Status } from "api/models";
import { deleteFrontierWord as deleteFromBackend } from "backend";
import { DeleteButtonWithDialog } from "components/Buttons";
import { deleteWord } from "goals/ReviewEntries/Redux/ReviewEntriesActions";
import { CellProps } from "goals/ReviewEntries/ReviewEntriesTable/Cells/CellTypes";
import { useAppDispatch } from "types/hooks";

const buttonId = (wordId: string): string => `row-${wordId}-delete`;
const buttonIdCancel = "delete-cancel";
const buttonIdConfirm = "delete-confirm";

export default function DeleteCell(props: CellProps): ReactElement {
  const dispatch = useAppDispatch();

  const word = props.rowData;
  const disabled =
    word.accessibility === Status.Protected ||
    !!word.senses.find((s) => s.accessibility === Status.Protected);

  async function deleteFrontierWord(): Promise<void> {
    await deleteFromBackend(word.id);
    dispatch(deleteWord(word.id));
  }

  return (
    <DeleteButtonWithDialog
      buttonId={buttonId(props.rowData.id)}
      buttonIdCancel={buttonIdCancel}
      buttonIdConfirm={buttonIdConfirm}
      delete={deleteFrontierWord}
      disabled={disabled}
      textId="reviewEntries.deleteWordWarning"
      tooltipTextId={disabled ? "reviewEntries.deleteDisabled" : ""}
    />
  );
}
