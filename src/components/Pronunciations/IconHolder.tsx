import React from "react";
import FiberManualRecord from "@material-ui/icons/FiberManualRecord";
import { makeStyles, IconButton } from "@material-ui/core";
import { red } from "@material-ui/core/colors";
import { useSelector, useDispatch } from "react-redux";
import { updateRecordingStatus } from "../../goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesActions";

export interface IconHolderProps {
  wordId: string;
  safeStartRecording: () => void;
  safeStopRecording: () => void;
}

export interface IconHolderState {
  isRecording: boolean;
}

export default function IconHolder(props: IconHolderProps) {
  const isRecording = useSelector(
    (state: any) => state.reviewEntriesState.isRecording
  );
  const wordBeingRecorded = useSelector(
    (state: any) => state.reviewEntriesState.wordBeingRecorded
  );
  const dispatch = useDispatch();

  const useStyles = makeStyles((theme) => ({
    button: {
      margin: theme.spacing(1),
    },
    iconPress: {
      color: red[900],
    },
    iconRelease: {
      color: red[500],
    },
  }));

  const classes = useStyles();

  function toggleIsRecordingToTrue(
    event: Event | React.TouchEvent | React.MouseEvent
  ) {
    event.preventDefault();
    dispatch(updateRecordingStatus(true, props.wordId));
    props.safeStartRecording();
  }
  function toggleIsRecordingToFalse(
    event: Event | React.TouchEvent | React.MouseEvent
  ) {
    event.preventDefault();
    props.safeStopRecording();
    dispatch(updateRecordingStatus(false, undefined));
  }

  return (
    <IconButton
      onMouseDown={toggleIsRecordingToTrue}
      onTouchStart={toggleIsRecordingToTrue}
      onMouseUp={toggleIsRecordingToFalse}
      onTouchEnd={toggleIsRecordingToFalse}
      className={classes.button}
      aria-label="record"
    >
      <FiberManualRecord
        className={
          isRecording && props.wordId === wordBeingRecorded
            ? classes.iconPress
            : classes.iconRelease
        }
      />
    </IconButton>
  );
}
