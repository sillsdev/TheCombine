import { Dialog, DialogContent, DialogTitle, Grid } from "@mui/material";
import { ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";

import { CloseButton, DeleteButtonWithDialog } from "components/Buttons";
import { CancelConfirmDialog } from "components/Dialogs";

interface ViewImageDialogProps {
  close: () => void;
  deleteButtonId?: string;
  deleteImage?: () => void | Promise<void>;
  deleteTextId?: string;
  imgSrc: string;
  open: boolean;
  titleId: string;
}

export default function ViewImageDialog(
  props: ViewImageDialogProps
): ReactElement {
  const [dialogOpen, setDialogOpen] = useState(false);

  const { t } = useTranslation();

  const handleDelete = async (): Promise<void> => {
    setDialogOpen(false);
    if (props.deleteImage) {
      await props.deleteImage();
    }
    props.close();
  };

  return (
    <Dialog maxWidth={false} onClose={props.close} open={props.open}>
      <DialogTitle>
        {t(props.titleId)}
        <CloseButton close={props.close} />
      </DialogTitle>
      <DialogContent>
        <img src={props.imgSrc || undefined} />
        <Grid container justifyContent="flex-end">
          <Grid item>
            <CancelConfirmDialog
              open={dialogOpen}
              textId={props.deleteTextId ?? ""}
              handleCancel={() => setDialogOpen(false)}
              handleConfirm={handleDelete}
            />
            <DeleteButtonWithDialog
              buttonId={props.deleteButtonId || "delete-image"}
              delete={() => setDialogOpen(true)}
              textId={props.deleteTextId ?? ""}
            />
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
