import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import AudioRecorder from "components/Pronunciations/AudioRecorder";

interface RecordAudioDialogProps {
  audioId: string;
  close: () => void;
  open: boolean;
  titleId: string;
  uploadAudio: (audioFile: File) => Promise<void>;
}

export default function RecordAudioDialog(
  props: RecordAudioDialogProps
): ReactElement {
  const { t } = useTranslation();

  return (
    <Dialog onClose={props.close} open={props.open}>
      <DialogTitle>{t(props.titleId)}</DialogTitle>
      <DialogContent>
        <AudioRecorder id={props.audioId} uploadAudio={props.uploadAudio} />
      </DialogContent>
    </Dialog>
  );
}
