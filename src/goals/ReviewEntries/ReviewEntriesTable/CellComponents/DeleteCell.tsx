import { ReactElement } from "react";

import { deleteFrontierWord as deleteFromBackend } from "backend";
import { DeleteButtonWithDialog } from "components/Buttons";
import { updateAllWords } from "goals/ReviewEntries/Redux/ReviewEntriesActions";
import { ReviewEntriesWord } from "goals/ReviewEntries/ReviewEntriesTypes";
import { StoreState } from "types";
import { useAppDispatch, useAppSelector } from "types/hooks";

const buttonId = (wordId: string): string => `row-${wordId}-delete`;
const buttonIdCancel = "delete-cancel";
const buttonIdConfirm = "delete-confirm";

interface DeleteCellProps {
  rowData: ReviewEntriesWord;
}

export default function DeleteCell(props: DeleteCellProps): ReactElement {
  const words = useAppSelector(
    (state: StoreState) => state.reviewEntriesState.words
  );
  const dispatch = useAppDispatch();

  const word = props.rowData;
  const disabled = word.protected || !!word.senses.find((s) => s.protected);

  async function deleteFrontierWord(): Promise<void> {
    await deleteFromBackend(word.id);
    const updatedWords = words.filter((w) => w.id !== word.id);
    dispatch(updateAllWords(updatedWords));
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
