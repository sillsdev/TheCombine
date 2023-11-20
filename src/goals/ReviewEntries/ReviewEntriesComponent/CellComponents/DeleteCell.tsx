import { ReactElement } from "react";

import { deleteFrontierWord as deleteFromBackend } from "backend";
import { DeleteButtonWithDialog } from "components/Buttons";
import { updateAllWords } from "goals/ReviewEntries/ReviewEntriesComponent/Redux/ReviewEntriesActions";
import { ReviewEntriesWord } from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import { StoreState } from "types";
import { useAppDispatch, useAppSelector } from "types/hooks";

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
      buttonId={`row-${props.rowData.id}-delete`}
      buttonIdCancel="row-delete-cancel"
      buttonIdConfirm="row-delete-confirm"
      delete={deleteFrontierWord}
      disabled={disabled}
      textId="reviewEntries.deleteWordWarning"
      tooltipTextId={disabled ? "reviewEntries.deleteDisabled" : ""}
    />
  );
}
