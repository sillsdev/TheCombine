import { Dialog, DialogContent, DialogTitle, Grid, Icon } from "@mui/material";
import { ReactElement } from "react";

import { CloseButton, DeleteButtonWithDialog } from "components/Buttons";

interface ViewImageDialogProps {
  close: () => void;
  buttonIdClose?: string;
  buttonIdDelete?: string;
  deleteImage?: () => void | Promise<void>;
  deleteTextId?: string;
  imgSrc: string;
  open: boolean;
  title: string;
}

export default function ViewImageDialog(
  props: ViewImageDialogProps
): ReactElement {
  const handleDelete = async (): Promise<void> => {
    if (props.deleteImage) {
      await props.deleteImage();
    }
    props.close();
  };

  return (
    <Dialog maxWidth={false} onClose={props.close} open={props.open}>
      <DialogTitle>
        {props.title}
        <Icon />
        <CloseButton buttonId={props.buttonIdClose} close={props.close} />
      </DialogTitle>
      <DialogContent>
        <img src={props.imgSrc || undefined} />
        <Grid container justifyContent="flex-end">
          <Grid item>
            <DeleteButtonWithDialog
              buttonId={props.buttonIdDelete || "delete-image"}
              delete={handleDelete}
              textId={props.deleteTextId ?? ""}
            />
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
