import { Dialog, DialogContent, DialogTitle, Icon } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { CloseButton } from "components/Buttons";
import UploadImage from "components/Dialogs/UploadImage";

interface UploadImageDialogProps {
  close: () => void;
  open: boolean;
  titleId: string;
  uploadImage: (imageFile: File) => Promise<void>;
}

export default function UploadImageDialog(
  props: UploadImageDialogProps
): ReactElement {
  const { t } = useTranslation();

  return (
    <Dialog onClose={props.close} open={props.open}>
      <DialogTitle>
        {t(props.titleId)}
        <Icon />
        <CloseButton close={props.close} />
      </DialogTitle>
      <DialogContent>
        <UploadImage
          doneCallback={props.close}
          uploadImage={props.uploadImage}
        />
      </DialogContent>
    </Dialog>
  );
}
