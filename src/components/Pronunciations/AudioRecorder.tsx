import { ReactElement, useContext } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { StoreState } from "Redux/rootReduxTypes";
import Recorder from "components/Pronunciations/Recorder";
import RecorderContext from "components/Pronunciations/RecorderContext";
import RecorderIcon from "components/Pronunciations/RecorderIcon";
import { getFileNameForWord } from "components/Pronunciations/utilities";
import { useAppSelector } from "types/hooks";
import { FileWithSpeakerId } from "types/word";

interface RecorderProps {
  disabled?: boolean;
  id: string;
  noSpeaker?: boolean;
  onClick?: () => void;
  uploadAudio: (file: FileWithSpeakerId) => void;
}

export default function AudioRecorder(props: RecorderProps): ReactElement {
  const speakerId = useAppSelector(
    (state: StoreState) => state.currentProjectState.speaker?.id
  );
  const recorder = useContext(RecorderContext);
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
    const file = new File([blob], fileName, {
      lastModified: Date.now(),
      type: Recorder.blobType,
    });
    if (!props.noSpeaker) {
      (file as FileWithSpeakerId).speakerId = speakerId;
    }
    props.uploadAudio(file);
  }

  return (
    <RecorderIcon
      disabled={props.disabled}
      id={props.id}
      startRecording={startRecording}
      stopRecording={stopRecording}
    />
  );
}
