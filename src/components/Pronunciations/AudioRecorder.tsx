import { ReactElement, useContext } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import RecorderContext from "components/Pronunciations/RecorderContext";
import RecorderIcon from "components/Pronunciations/RecorderIcon";
import { getFileNameForWord } from "components/Pronunciations/utilities";
import { useAppSelector } from "rootRedux/hooks";
import { type StoreState } from "rootRedux/types";
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

  async function startRecording(): Promise<void> {
    const isRecordingId = recorder.isRecording();
    if (isRecordingId && isRecordingId !== props.id) {
      // Prevent interfering with an active recording on a different entry.
      return;
    }

    // Prevent starting a recording before a previous one is finished.
    await stopRecording();

    recorder.startRecording(props.id);
  }

  async function stopRecording(): Promise<string | undefined> {
    // Prevent triggering this function if no recording is active.
    if (recorder.isRecording() === undefined) {
      return;
    }

    if (props.onClick) {
      props.onClick();
    }
    const file = await recorder.stopRecording();
    if (!file) {
      toast.error(t("pronunciations.noMicAccess"));
      return;
    }
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
