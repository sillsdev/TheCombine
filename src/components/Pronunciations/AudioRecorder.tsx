import { ReactElement, useContext } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import Recorder from "components/Pronunciations/Recorder";
import RecorderContext from "components/Pronunciations/RecorderContext";
import RecorderIcon from "components/Pronunciations/RecorderIcon";
import { getFileNameForWord } from "components/Pronunciations/utilities";
import { StoreState } from "types";
import { useAppSelector } from "types/hooks";

interface RecorderProps {
  id: string;
  uploadAudio: (audioFile: File, speakerId?: string) => void;
  onClick?: () => void;
}

export default function AudioRecorder(props: RecorderProps): ReactElement {
  const recorder = useContext(RecorderContext);
  const speakerId = useAppSelector(
    (state: StoreState) => state.currentProjectState.speaker?.id
  );
  const { t } = useTranslation();

  function startRecording(): void {
    recorder.startRecording();
  }

  async function stopRecording(): Promise<void> {
    if (props.onClick) {
      props.onClick();
    }
    const blob = await recorder.stopRecording();
    if (!blob) {
      toast.error(t("pronunciations.noMicAccess"));
      return;
    }
    const fileName = getFileNameForWord(props.id);
    const options: FilePropertyBag = {
      lastModified: Date.now(),
      type: Recorder.blobType,
    };
    props.uploadAudio(new File([blob], fileName, options), speakerId);
  }

  return (
    <RecorderIcon
      id={props.id}
      startRecording={startRecording}
      stopRecording={stopRecording}
    />
  );
}
