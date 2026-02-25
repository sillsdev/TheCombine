import { FiberManualRecord } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import { ReactElement, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  recording,
  resetPronunciations,
} from "components/Pronunciations/Redux/PronunciationsActions";
import { PronunciationsStatus } from "components/Pronunciations/Redux/PronunciationsReduxTypes";
import { checkMicPermission } from "components/Pronunciations/utilities";
import { useAppDispatch, useAppSelector } from "rootRedux/hooks";
import { type StoreState } from "rootRedux/types";
import { themeColors } from "types/theme";

export const recordButtonId = "recordingButton";

interface RecorderIconProps {
  disabled?: boolean;
  id: string;
  startRecording: () => Promise<boolean>;
  stopRecording: () => void;
}

export default function RecorderIcon(props: RecorderIconProps): ReactElement {
  const isRecording = useAppSelector(
    (state: StoreState) =>
      state.pronunciationsState.status === PronunciationsStatus.Recording
  );
  const recordingId = useAppSelector(
    (state: StoreState) => state.pronunciationsState.wordId
  );

  const dispatch = useAppDispatch();
  const [hasMic, setHasMic] = useState(false);
  const { t } = useTranslation();

  // Use refs to keep dependencies stable in useEffect/useCallback.
  const isRecordingRef = useRef(false);
  const isRecordingThisRef = useRef(false);
  const stopAndResetRef = useRef<(() => void) | undefined>();

  isRecordingRef.current = isRecording;
  const isRecordingThis = isRecording && recordingId === props.id;
  isRecordingThisRef.current = isRecordingThis;

  const stopAndReset = useCallback(() => {
    if (isRecordingThisRef.current) {
      props.stopRecording();
      dispatch(resetPronunciations());
    }
  }, [dispatch, props.stopRecording]);
  stopAndResetRef.current = stopAndReset;

  useEffect(() => {
    checkMicPermission().then(setHasMic);

    return () => {
      // Reset recording state if this component unmounts while recording
      // (e.g., navigating away from the page mid-recording).
      stopAndResetRef.current?.();
    };
  }, []);

  const start = useCallback(async (): Promise<void> => {
    if (isRecordingRef.current) {
      if (!isRecordingThisRef.current) {
        // This happens if user clicks-and-holds on one entry's record icon,
        // drags the mouse outside that icon before releasing,
        // then clicks-and-holds a different entry's record icon.
        console.error(
          "Tried to record for an entry before finishing a recording on another entry."
        );
      }
      return;
    }

    // Only start a recording if there's not another one in progress.
    if (await props.startRecording()) {
      dispatch(recording(props.id));
    }
  }, [dispatch, props.id, props.startRecording]);

  const tooltipId = hasMic
    ? "pronunciations.recordTooltip"
    : "pronunciations.enableMicTooltip";

  return (
    <Tooltip
      disableTouchListener // Distracting when already recording with a long-press.
      placement="top"
      title={!props.disabled && t(tooltipId)}
    >
      <span>
        <IconButton
          aria-label="record"
          data-testid={recordButtonId}
          disabled={props.disabled || !hasMic}
          id={recordButtonId}
          onBlur={stopAndReset}
          onContextMenu={(e) => e.preventDefault()}
          onPointerCancel={stopAndReset}
          onPointerDown={start}
          onPointerUp={stopAndReset}
          size="large"
          tabIndex={-1}
        >
          <FiberManualRecord
            sx={{
              color: (t) =>
                props.disabled || !hasMic
                  ? t.palette.grey[400]
                  : isRecordingThis
                    ? themeColors.recordActive
                    : themeColors.recordIdle,
            }}
          />
        </IconButton>
      </span>
    </Tooltip>
  );
}
