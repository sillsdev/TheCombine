import React from "react";

import * as Backend from "../../backend";
import AudioPlayer from "./AudioPlayer";
import AudioRecorder from "./AudioRecorder";
import Recorder from "./Recorder";

export interface PronunciationProps {
  wordId: string;
  pronunciationFiles: string[];
  recorder?: Recorder;
  deleteAudio?: (wordId: string, fileName: string) => void;
  getAudioUrl?: (wordId: string, fileName: string) => string;
  uploadAudio?: (wordId: string, audioFile: File) => void;
}

/** Audio recording/playing component */
export function Pronunciations(props: PronunciationProps) {
  let audioButtons = null;
  if (props.pronunciationFiles !== null) {
    audioButtons = props.pronunciationFiles.map((fileName) => {
      return (
        <AudioPlayer
          key={fileName}
          wordId={props.wordId}
          fileName={fileName}
          pronunciationUrl={
            props.getAudioUrl
              ? props.getAudioUrl(props.wordId, fileName)
              : Backend.getAudioUrl(props.wordId, fileName)
          }
          deleteAudio={props.deleteAudio}
        />
      );
    });
  }
  return (
    <React.Fragment>
      <AudioRecorder
        wordId={props.wordId}
        recorder={props.recorder}
        uploadAudio={props.uploadAudio}
      />
      {audioButtons}
    </React.Fragment>
  );
}

export default React.memo(Pronunciations, (props, nextProps) => {
  /* Don't update if things that could change haven't changed.
   * This decreases unnecessary fetching of audio files.
   */
  const isSameEntry = nextProps.wordId === props.wordId;
  const hasSameAudio =
    JSON.stringify(nextProps.pronunciationFiles) ===
    JSON.stringify(props.pronunciationFiles);
  return isSameEntry && hasSameAudio;
});
