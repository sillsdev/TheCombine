import React from "react";
import FiberManualRecord from "@material-ui/icons/FiberManualRecord";
import { makeStyles, IconButton } from "@material-ui/core";
import { useSelector, useDispatch } from "react-redux";
import { updateRecordingStatus } from "../../goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesActions";
import { recorderStatus } from "../../types/theme";

export interface RecorderIconProps {
  wordId: string;
  startRecording: () => void;
  stopRecording: () => void;
}

export default function RecorderIcon(props: RecorderIconProps) {
  // This component was constructed for ReviewEntries,
  // but is also used with DataEntry, so we now have to check
  // if state.reviewEntriesState exists (or DataEntry tests fail)
  const isRecording = useSelector((state: any) =>
    state.reviewEntriesState ? state.reviewEntriesState.isRecording : null
  );
  const wordBeingRecorded = useSelector((state: any) =>
    state.reviewEntriesState ? state.reviewEntriesState.wordBeingRecorded : null
  );

  const dispatch = useDispatch();

  const useStyles = makeStyles((theme) => ({
    button: {
      marginRight: theme.spacing(1),
    },
    iconPress: {
      color: recorderStatus.active.color,
    },
    iconRelease: {
      color: recorderStatus.idle.color,
    },
  }));

  const classes = useStyles();

  function toggleIsRecordingToTrue() {
    dispatch(updateRecordingStatus(true, props.wordId));
    props.startRecording();
  }
  function toggleIsRecordingToFalse() {
    props.stopRecording();
    dispatch(updateRecordingStatus(false, undefined));
  }

  return (
    <IconButton
      tabIndex={-1}
      onMouseDown={toggleIsRecordingToTrue}
      onTouchStart={toggleIsRecordingToTrue}
      onMouseUp={toggleIsRecordingToFalse}
      onTouchEnd={toggleIsRecordingToFalse}
      className={classes.button}
      aria-label="record"
      id="recordingButton"
    >
      <FiberManualRecord
        className={
          isRecording && props.wordId === wordBeingRecorded
            ? classes.iconPress
            : classes.iconRelease
        }
        id="icon"
      />
    </IconButton>
  );
}
