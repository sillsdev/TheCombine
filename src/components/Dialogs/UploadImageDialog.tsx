import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import UploadImage from "components/Dialogs/UploadImage";

interface UploadImageDialogProps {
  close: () => void;
  open: boolean;
  titleId: string;
  uploadImage: (imgFile: File) => Promise<void>;
}

export default function UploadImageDialog(
  props: UploadImageDialogProps
): ReactElement {
  const { t } = useTranslation();

  return (
    <Dialog onClose={props.close} open={props.open}>
      <DialogTitle>{t(props.titleId)}</DialogTitle>
      <DialogContent>
        <UploadImage
          doneCallback={props.close}
          uploadImage={props.uploadImage}
        />
      </DialogContent>
    </Dialog>
  );
}
