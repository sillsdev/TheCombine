import { Dialog, DialogContent, DialogTitle, Icon } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { CloseButton } from "components/Buttons";
import AudioRecorder from "components/Pronunciations/AudioRecorder";

interface RecordAudioDialogProps {
  audioId: string;
  close: () => void;
  open: boolean;
  titleId: string;
  uploadAudio: (file: File) => Promise<void>;
}

export default function RecordAudioDialog(
  props: RecordAudioDialogProps
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
        <AudioRecorder
          id={props.audioId}
          noSpeaker
          uploadAudio={(file) => props.uploadAudio(file)}
        />
      </DialogContent>
    </Dialog>
  );
}
