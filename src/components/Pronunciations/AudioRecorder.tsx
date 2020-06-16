import {
  makeStyles,
  Theme,
  createStyles,
  IconButton,
  Tooltip,
} from "@material-ui/core";
import { red } from "@material-ui/core/colors";
import FiberManualRecord from "@material-ui/icons/FiberManualRecord";
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateRecordingStatus } from "../../goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesActions";
import * as Backend from "../../backend";
import { Recorder } from "./Recorder";
import { Translate } from "react-localize-redux";

export interface RecorderProps {
  wordId: string;
  recorder?: Recorder;
  recordingFinished?: (oldId: string, newId: string) => void;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    button: {
      margin: theme.spacing(1),
    },
    iconPress: {
      color: red[900],
    },
    iconRelease: {
      color: red[500],
    },
  })
);

function getFileNameForWord(wordId: string): string {
  var fourCharParts = wordId.match(/.{1,6}/g);
  var compressed =
    fourCharParts === null
      ? ["unknownword"]
      : fourCharParts.map((i) => Number("0x" + i).toString(36));
  return compressed.join("") + "_" + new Date().getTime().toString(36);
}

export default function AudioRecorder(props: RecorderProps) {
  const isRecording = useSelector(
    (state: any) => state.reviewEntriesState.isRecording
  );
  const dispatch = useDispatch();
  const classes = useStyles();

  const recorder =
    props.recorder !== undefined ? props.recorder : new Recorder();

  function safeStartRecording(
    event: Event | React.TouchEvent | React.MouseEvent
  ) {
    console.log(isRecording);
    if (!isRecording) {
      dispatch(updateRecordingStatus(true));
      event.preventDefault();
      recorder.startRecording();
    }
  }

  function safeStopRecording(
    event: Event | React.TouchEvent | React.MouseEvent
  ) {
    if (/*isRecording*/ true) {
      event.preventDefault();
      recorder
        .stopRecording()
        .then((audioUrl: string) => {
          const blob = recorder.getBlob();
          const fileName = getFileNameForWord(props.wordId);
          const file = new File([blob], fileName, {
            type: blob.type,
            lastModified: Date.now(),
          });
          Backend.uploadAudio(props.wordId, file).then((newWordId) => {
            recorder.clearData();
            if (props.recordingFinished) {
              props.recordingFinished(props.wordId, newWordId);
            }
          });
        })
        .catch(() => {
          console.log("Error recording, probably no mic access");
          // <Translate id="pronunciations.noMicAccess" />;
          // TODO: Show alert dialog here
        })
        .finally(() => dispatch(updateRecordingStatus(false)));
    }
  }

  return (
    <Tooltip title={<Translate id="pronunciations.recordTooltip" />}>
      <IconButton
        onMouseDown={safeStartRecording}
        onTouchStart={safeStartRecording}
        onMouseUp={safeStopRecording}
        onTouchEnd={safeStopRecording}
        className={classes.button}
        aria-label="record"
      >
        <FiberManualRecord
          className={isRecording ? classes.iconPress : classes.iconRelease}
        />
      </IconButton>
    </Tooltip>
  );
}
