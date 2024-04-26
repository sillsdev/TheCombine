import { FiberManualRecord } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import {
  recording,
  resetPronunciations,
} from "components/Pronunciations/Redux/PronunciationsActions";
import { PronunciationsStatus } from "components/Pronunciations/Redux/PronunciationsReduxTypes";
import { useAppDispatch, useAppSelector } from "rootRedux/hooks";
import { type StoreState } from "rootRedux/rootReduxTypes";
import { themeColors } from "types/theme";

export const recordButtonId = "recordingButton";
export const recordIconId = "recordingIcon";

interface RecorderIconProps {
  disabled?: boolean;
  id: string;
  startRecording: () => void;
  stopRecording: () => void;
}

export default function RecorderIcon(props: RecorderIconProps): ReactElement {
  const isRecording = useAppSelector(
    (state: StoreState) =>
      state.pronunciationsState.status === PronunciationsStatus.Recording &&
      state.pronunciationsState.wordId === props.id
  );

  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  function toggleIsRecordingToTrue(): void {
    dispatch(recording(props.id));
    props.startRecording();
  }
  function toggleIsRecordingToFalse(): void {
    props.stopRecording();
    dispatch(resetPronunciations());
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

  return (
    <Tooltip
      disableTouchListener // Distracting when already recording with a long-press.
      placement="top"
      title={t("pronunciations.recordTooltip")}
    >
      <IconButton
        aria-label="record"
        disabled={props.disabled}
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
          id={recordIconId}
          sx={{
            color: (t) =>
              props.disabled
                ? t.palette.grey[400]
                : isRecording
                  ? themeColors.recordActive
                  : themeColors.recordIdle,
          }}
        />
      </IconButton>
    </Tooltip>
  );
}
