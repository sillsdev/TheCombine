import { FiberManualRecord } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";
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
  const isRecordingThis = isRecording && recordingId === props.id;

  const dispatch = useAppDispatch();
  const [hasMic, setHasMic] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    checkMicPermission().then(setHasMic);
  }, []);

  async function toggleIsRecordingToTrue(): Promise<void> {
    if (!isRecording) {
      // Only start a recording if there's not another on in progress.
      if (await props.startRecording()) {
        dispatch(recording(props.id));
      }
    } else {
      // This triggers if user clicks-and-holds on one entry's record icon,
      // drags the mouse outside that icon before releasing,
      // then clicks-and-holds a different entry's record icon.
      if (recordingId !== props.id) {
        console.error(
          "Tried to record for an entry before finishing a recording on another entry."
        );
      }
    }
  }
  function toggleIsRecordingToFalse(): void {
    if (isRecordingThis) {
      props.stopRecording();
      dispatch(resetPronunciations());
    }
  }

  function handleTouchStart(): void {
    // Temporarily disable context menu since some browsers
    // interpret a long-press touch as a right-click.
    document.addEventListener("contextmenu", disableContextMenu, false);
  }
  function handleTouchEnd(): void {
    enableContextMenu();
  }

  function disableContextMenu(event: any): void {
    event.preventDefault();
    enableContextMenu();
  }
  function enableContextMenu(): void {
    document.removeEventListener("contextmenu", disableContextMenu, false);
  }

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
          onBlur={toggleIsRecordingToFalse}
          onPointerDown={toggleIsRecordingToTrue}
          onPointerUp={toggleIsRecordingToFalse}
          onTouchEnd={handleTouchEnd}
          onTouchStart={handleTouchStart}
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
