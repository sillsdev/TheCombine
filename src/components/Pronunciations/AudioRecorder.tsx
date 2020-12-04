import React from "react";

import Recorder from "./Recorder";
import RecorderIcon from "./RecorderIcon";

export interface RecorderProps {
  wordId: string;
  recorder?: Recorder;
  uploadAudio?: (wordId: string, audioFile: File) => void;
}

export function getFileNameForWord(wordId: string): string {
  var fourCharParts = wordId.match(/.{1,6}/g);
  var compressed =
    fourCharParts === null
      ? ["unknownword"]
      : fourCharParts.map((i) => Number("0x" + i).toString(36));
  return compressed.join("") + "_" + new Date().getTime().toString(36);
}

export default function AudioRecorder(props: RecorderProps) {
  const recorder = props.recorder ?? new Recorder();

  function startRecording() {
    recorder.startRecording();
  }

  function stopRecording() {
    recorder
      .stopRecording()
      .then(() => {
        const blob = recorder.getBlob();
        const fileName = getFileNameForWord(props.wordId);
        const file = new File([blob], fileName, {
          type: blob.type,
          lastModified: Date.now(),
        });
        if (props.uploadAudio) {
          props.uploadAudio(props.wordId, file);
        }
      })
      .catch(() => {
        console.log("Error recording, probably no mic access");
        // <Translate id="pronunciations.noMicAccess" />;
        // TODO: Show alert dialog here
      });
  }

  return (
    <RecorderIcon
      wordId={props.wordId}
      startRecording={startRecording}
      stopRecording={stopRecording}
    />
  );
}
