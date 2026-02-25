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

  const uploadAudio = useCallback(
    (file?: File): boolean => {
      if (!file?.size) {
        console.error("No audio file to upload");
        toast.error(t("pronunciations.recordingError"));
        return false;
      }

      try {
        if (!props.noSpeaker) {
          (file as FileWithSpeakerId).speakerId = speakerId;
        }
        props.uploadAudio(file);
        return true;
      } catch (err) {
        console.error("Error uploading audio:", err);
        toast.error(t("pronunciations.recordingError"));
        return false;
      }
    },
    [props.noSpeaker, props.uploadAudio, speakerId]
  );

  const stopRecording = useCallback(async (): Promise<void> => {
    // Prevent triggering this function if no recording is active.
    if (recorder.getRecordingId() === undefined) {
      return;
    }

    props.onClick?.();

    const uploadSuccess = uploadAudio(await recorder.stopRecording());

    if (uploadSuccess && props.id) {
      // The id will change when the frontend updates with the new audio,
      // so we rely on a useEffect above to reset the clickedRef.
    } else {
      clickedRef.current = false;
    }
  }, [props.id, props.onClick, recorder, t, uploadAudio]);

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
