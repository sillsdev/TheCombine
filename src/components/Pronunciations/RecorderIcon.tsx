import { IconButton, makeStyles, Tooltip } from "@material-ui/core";
import { FiberManualRecord } from "@material-ui/icons";
import React from "react";
import { Translate } from "react-localize-redux";
import { useDispatch, useSelector } from "react-redux";

import {
  PronunciationsStatus,
  recording,
  reset,
} from "components/Pronunciations/PronunciationsActions";
import { StoreState } from "types";
import { themeColors } from "types/theme";

interface RecorderIconProps {
  wordId: string;
  startRecording: () => void;
  stopRecording: () => void;
}

export default function RecorderIcon(props: RecorderIconProps) {
  const pronunciationsState = useSelector(
    (state: StoreState) => state.pronunciationsState
  );
  const dispatch = useDispatch();

  const useStyles = makeStyles((theme) => ({
    button: {
      marginRight: theme.spacing(1),
    },
    iconPress: {
      color: themeColors.recordActive,
    },
    iconRelease: {
      color: themeColors.recordIdle,
    },
  }));

  const classes = useStyles();

  function toggleIsRecordingToTrue() {
    dispatch(recording(props.wordId));
    props.startRecording();
  }
  function toggleIsRecordingToFalse() {
    props.stopRecording();
    dispatch(reset());
  }

  function handleTouchStart() {
    // Temporarily disable context menu since some browsers
    // interpret a long-press touch as a right-click.
    document.addEventListener("contextmenu", disableContextMenu, false);
    toggleIsRecordingToTrue();
  }
  function handleTouchEnd() {
    enableContextMenu();
    toggleIsRecordingToFalse();
  }

  function disableContextMenu(event: any) {
    event.preventDefault();
    enableContextMenu();
  }
  function enableContextMenu() {
    document.removeEventListener("contextmenu", disableContextMenu, false);
  }

  return (
    <Tooltip title={<Translate id="pronunciations.recordTooltip" />}>
      <IconButton
        tabIndex={-1}
        onMouseDown={toggleIsRecordingToTrue}
        onTouchStart={handleTouchStart}
        onMouseUp={toggleIsRecordingToFalse}
        onTouchEnd={handleTouchEnd}
        className={classes.button}
        aria-label="record"
        id="recordingButton"
      >
        <FiberManualRecord
          className={
            pronunciationsState.type === PronunciationsStatus.Recording &&
            pronunciationsState.payload === props.wordId
              ? classes.iconPress
              : classes.iconRelease
          }
          id="icon"
        />
      </IconButton>
    </Tooltip>
  );
}
