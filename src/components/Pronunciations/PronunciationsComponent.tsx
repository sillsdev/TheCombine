import React from "react";

import * as backend from "backend";
import AudioPlayer from "components/Pronunciations/AudioPlayer";
import AudioRecorder from "components/Pronunciations/AudioRecorder";
import Recorder from "components/Pronunciations/Recorder";

interface PronunciationProps {
  wordId: string;
  pronunciationFiles: string[];
  recorder?: Recorder;
  deleteAudio?: (wordId: string, fileName: string) => void;
  getAudioUrl?: (wordId: string, fileName: string) => string;
  uploadAudio?: (wordId: string, audioFile: File) => void;
}

/** Audio recording/playing component */
export function Pronunciations(props: PronunciationProps) {
  const audioButtons = props.pronunciationFiles.map((fileName) => {
    return (
      <AudioPlayer
        key={fileName}
        wordId={props.wordId}
        fileName={fileName}
        pronunciationUrl={
          props.getAudioUrl
            ? props.getAudioUrl(props.wordId, fileName)
            : backend.getAudioUrl(props.wordId, fileName)
        }
        deleteAudio={props.deleteAudio}
      />
    );
  });
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

// Memoize to decrease unnecessary fetching of audio files.
// https://dmitripavlutin.com/use-react-memo-wisely/#11-custom-equality-check-of-props
function pronunciationPropsAreEqual(
  props: PronunciationProps,
  nextProps: PronunciationProps
) {
  if (nextProps.wordId === props.wordId) {
    const hasSameAudio =
      JSON.stringify(nextProps.pronunciationFiles) ===
      JSON.stringify(props.pronunciationFiles);
    return hasSameAudio;
  }
  return false;
}
export default React.memo(Pronunciations, pronunciationPropsAreEqual);
