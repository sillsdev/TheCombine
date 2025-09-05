import { Dialog, DialogContent, DialogTitle, Grid2, Icon } from "@mui/material";
import { ReactElement } from "react";

import CloseButton from "components/Buttons/CloseButton";
import DeleteButtonWithDialog from "components/Buttons/DeleteButtonWithDialog";

interface ViewImageDialogProps {
  close: () => void;
  buttonIdClose?: string;
  buttonIdDelete?: string;
  buttonLabelClose?: string;
  buttonLabelDelete?: string;
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
        <CloseButton
          buttonId={props.buttonIdClose}
          buttonLabel={props.buttonLabelClose}
          close={props.close}
        />
      </DialogTitle>
      <DialogContent>
        <img src={props.imgSrc || undefined} />
        <Grid2 container justifyContent="flex-end">
          <DeleteButtonWithDialog
            buttonId={props.buttonIdDelete ?? "delete-image"}
            buttonLabel={props.buttonLabelDelete ?? "Delete image"}
            delete={handleDelete}
            textId={props.deleteTextId ?? ""}
          />
        </Grid2>
      </DialogContent>
    </Dialog>
  );
}
