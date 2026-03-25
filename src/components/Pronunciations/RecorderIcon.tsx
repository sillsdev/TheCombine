import { FiberManualRecord } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import { ReactElement, useEffect, useRef, useState } from "react";
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

  // Use refs to for the useEffect cleanup.
  const stopRef = useRef<(() => void) | undefined>();

  const isRecordingThis = isRecording && recordingId === props.id;
  const disabled =
    props.disabled || !hasMic || (isRecording && !isRecordingThis);

  const stop = (): void => {
    if (isRecordingThis) {
      props.stopRecording();
      dispatch(resetPronunciations());
    }
  };
  stopRef.current = stop;

  useEffect(() => {
    checkMicPermission().then(setHasMic);

    return () => {
      // Reset recording state if this component unmounts while recording
      // (e.g., navigating away from the page mid-recording).
      stopRef.current?.();
    };
  }, []);

  const start = async (): Promise<void> => {
    if (isRecording) {
      return;
    }

    // Only start a recording if there's not another one in progress.
    if (await props.startRecording()) {
      dispatch(recording(props.id));
    }
  };

  const tooltipId = hasMic
    ? "pronunciations.recordTooltip"
    : "pronunciations.enableMicTooltip";

  return (
    <Tooltip
      disableTouchListener // Distracting when already recording with a long-press.
      placement="top"
      title={disabled ? undefined : t(tooltipId)}
    >
      <span>
        <IconButton
          aria-label="record"
          data-testid={recordButtonId}
          disabled={disabled}
          id={recordButtonId}
          onBlur={stop}
          onContextMenu={(e) => e.preventDefault()}
          onPointerCancel={stop}
          onPointerDown={start}
          onPointerUp={stop}
          size="large"
          tabIndex={-1}
        >
          <FiberManualRecord
            sx={{
              color: (t) =>
                disabled
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
