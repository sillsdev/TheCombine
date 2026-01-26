import { Dialog, DialogContent, DialogTitle, Icon } from "@mui/material";
import { type KeyboardEvent, ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { Key } from "ts-key-enum";

import CloseButton from "components/Buttons/CloseButton";
import UploadImage from "components/Dialogs/UploadImage";

interface UploadImageDialogProps {
  buttonIdClose?: string;
  buttonLabelClose?: string;
  close: () => void;
  open: boolean;
  titleId: string;
  uploadImage: (imageFile: File) => Promise<void>;
}

export default function UploadImageDialog(
  props: UploadImageDialogProps
): ReactElement {
  const [hasFile, setHasFile] = useState(false);
  const { t } = useTranslation();

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === Key.Enter && !hasFile) {
      // Trigger the Browse button when Enter is pressed and no file is selected
      const fileInput = document.getElementById("file-input");
      if (fileInput) {
        fileInput.click();
      }
    }
    // When a file is selected, the form's onSubmit will handle Enter key
  };

  return (
    <Dialog onClose={props.close} open={props.open} onKeyDown={handleKeyDown}>
      <DialogTitle>
        {t(props.titleId)}
        <Icon />
        <CloseButton
          buttonId={props.buttonIdClose}
          buttonLabel={props.buttonLabelClose}
          close={props.close}
        />
      </DialogTitle>
      <DialogContent>
        <UploadImage
          doneCallback={props.close}
          uploadImage={props.uploadImage}
          onFileChange={setHasFile}
        />
      </DialogContent>
    </Dialog>
  );
}
