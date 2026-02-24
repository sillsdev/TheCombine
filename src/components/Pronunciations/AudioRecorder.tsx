import {
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
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
  /** Leave id blank if the id doesn't update after an audio upload. */
  id?: string;
  noSpeaker?: boolean;
  onClick?: () => void;
  uploadAudio: (file: FileWithSpeakerId) => void;
}

export default function AudioRecorder(props: RecorderProps): ReactElement {
  const speakerId = useAppSelector(
    (state: StoreState) => state.currentProjectState.speaker?.id
  );
  const recorder = useContext(RecorderContext);
  const clickedRef = useRef(false);
  const { t } = useTranslation();

  useEffect(() => {
    // Re-enable clicking when the word id has changed
    clickedRef.current = false;
  }, [props.id]);

  const stopRecording = useCallback(async (): Promise<void> => {
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
      clickedRef.current = false;
      return;
    }

    if (!props.noSpeaker) {
      (file as FileWithSpeakerId).speakerId = speakerId;
    }
    props.uploadAudio(file);

    if (!props.id) {
      // If recorder is on something with an id,
      // that id will update after the upload is complete,
      // so rely on the useEffect above to do this.
      clickedRef.current = false;
    }
  }, [props.id, props.noSpeaker, props.uploadAudio, recorder, speakerId, t]);

  const startRecording = useCallback(async (): Promise<boolean> => {
    if (clickedRef.current) {
      // Prevent recording again before this word has updated.
      return false;
    }

    const recordingId = recorder.getRecordingId();
    if (recordingId && recordingId !== props.id) {
      // Prevent interfering with an active recording on a different entry.
      return false;
    }

    clickedRef.current = true;

    // Prevent starting a recording before a previous one is finished.
    await stopRecording();

    if (!recorder.startRecording(props.id)) {
      let errorMessage = t("pronunciations.recordingError");
      if (isBrowserFirefox()) {
        errorMessage += ` ${t("pronunciations.recordingPermission")}`;
      }
      toast.error(errorMessage);
      clickedRef.current = false;
      return false;
    }
    return true;
  }, [props.id, recorder, stopRecording, t]);

  return (
    <RecorderIcon
      disabled={props.disabled}
      id={props.id ?? ""}
      startRecording={startRecording}
      stopRecording={stopRecording}
    />
  );
}
