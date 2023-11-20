import { Dialog, DialogContent, DialogTitle, Grid } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { CloseButton, DeleteButtonWithDialog } from "components/Buttons";

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
  const { t } = useTranslation();

  const handleDelete = async (): Promise<void> => {
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
            <DeleteButtonWithDialog
              buttonId={props.deleteButtonId || "delete-image"}
              delete={handleDelete}
              textId={props.deleteTextId ?? ""}
            />
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
