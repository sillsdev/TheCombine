import { Delete } from "@mui/icons-material";
import { ReactElement, useState } from "react";

import { IconButtonWithTooltip } from "components/Buttons";
import { CancelConfirmDialog } from "components/Dialogs";

interface DeleteButtonWithDialogProps {
  buttonId: string;
  buttonIdCancel?: string;
  buttonIdConfirm?: string;
  delete: () => void | Promise<void>;
  disabled?: boolean;
  textId: string;
  tooltipTextId?: string;
}

export default function DeleteButtonWithDialog(
  props: DeleteButtonWithDialogProps
): ReactElement {
  const [open, setOpen] = useState(false);

  const handleConfirm = async (): Promise<void> => {
    await props.delete();
    setOpen(false);
  };

  return (
    <>
      <IconButtonWithTooltip
        buttonId={props.buttonId}
        icon={<Delete />}
        onClick={props.disabled ? undefined : () => setOpen(true)}
        textId={props.tooltipTextId || props.textId}
      />
      <CancelConfirmDialog
        buttonIdCancel={props.buttonIdCancel}
        buttonIdConfirm={props.buttonIdConfirm}
        handleCancel={() => setOpen(false)}
        handleConfirm={handleConfirm}
        open={open}
        textId={props.textId}
      />
    </>
  );
}
