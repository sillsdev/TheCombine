import { Tooltip } from "@material-ui/core";
import React from "react";
import * as Backend from "../../backend";
import { Recorder } from "./Recorder";
import { Translate } from "react-localize-redux";
import IconHolder from "./IconHolder";

export interface RecorderProps {
  wordId: string;
  recorder?: Recorder;
  recordingFinished?: (oldId: string, newId: string) => void;
}

function getFileNameForWord(wordId: string): string {
  var fourCharParts = wordId.match(/.{1,6}/g);
  var compressed =
    fourCharParts === null
      ? ["unknownword"]
      : fourCharParts.map((i) => Number("0x" + i).toString(36));
  return compressed.join("") + "_" + new Date().getTime().toString(36);
}

export default function AudioRecorder(props: RecorderProps) {
  const recorder =
    props.recorder !== undefined ? props.recorder : new Recorder();

  function safeStartRecording() {
    recorder.startRecording();
  }

  function safeStopRecording() {
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
          if (props.recordingFinished) {
            props.recordingFinished(props.wordId, newWordId);
          }
        });
      })
      .catch(() => {
        console.log("Error recording, probably no mic access");
        // <Translate id="pronunciations.noMicAccess" />;
        // TODO: Show alert dialog here
      });
  }

  return (
    <Tooltip title={<Translate id="pronunciations.recordTooltip" />}>
      <IconHolder
        wordId={props.wordId}
        safeStartRecording={safeStartRecording}
        safeStopRecording={safeStopRecording}
      />
    </Tooltip>
  );
}
