import { ReactElement, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import RecorderContext from "components/Pronunciations/RecorderContext";
import RecorderIcon from "components/Pronunciations/RecorderIcon";
import { isBrowserFirefox } from "components/Pronunciations/utilities";
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
  const [clicked, setClicked] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    // Re-enable clicking when the word id has changed
    setClicked(false);
  }, [props.id]);

  async function startRecording(): Promise<boolean> {
    if (clicked) {
      // Prevent recording again before this word has updated.
      return false;
    }

    const recordingId = recorder.getRecordingId();
    if (recordingId && recordingId !== props.id) {
      // Prevent interfering with an active recording on a different entry.
      return false;
    }

    setClicked(true);

    // Prevent starting a recording before a previous one is finished.
    await stopRecording();

    if (!recorder.startRecording(props.id)) {
      let errorMessage = t("pronunciations.recordingError");
      if (isBrowserFirefox()) {
        errorMessage += ` ${t("pronunciations.recordingPermission")}`;
      }
      toast.error(errorMessage);
      return false;
    }
    return true;
  }

  async function stopRecording(): Promise<void> {
    // Prevent triggering this function if no recording is active.
    if (recorder.getRecordingId() === undefined) {
      return;
    }

    if (props.onClick) {
      props.onClick();
    }
    const file = await recorder.stopRecording();
    if (!file || !file.size) {
      toast.error(t("pronunciations.recordingError"));
      setClicked(false);
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
